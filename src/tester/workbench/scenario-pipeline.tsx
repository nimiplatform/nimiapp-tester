import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  InlineAlert,
  SegmentedControl,
  StatusBadge,
  Surface,
  TextareaField,
} from '@nimiplatform/kit/ui';
import { AlertTriangle, CheckCircle2, CircleDot, Play, ShieldAlert, Terminal } from 'lucide-react';
import type { TesterCapability } from '../tester-capabilities.js';
import {
  runTesterCapability,
  type TesterCapabilityRunResult,
  type TesterRuntimeInspection,
} from '../tester-runtime.js';
import type { TesterTypedOutput, TesterTypedSuccess } from '../tester-runtime-invokers.js';
import {
  openWorldTourWindow,
  resolveWorldTourFixture,
  type ResolvedWorldTourFixture,
} from '../world-tour/world-tour-shared.js';

type ScenarioPipelineProps = {
  capability: TesterCapability;
  runtime: TesterRuntimeInspection | null;
  lastResult: TesterCapabilityRunResult | null;
  onResult: (result: TesterCapabilityRunResult, prompt: string) => void | Promise<void>;
  onConsole?: (line: string) => void;
};

type ScenarioPreset = {
  id: string;
  label: string;
  prompt: string;
  intent: string;
};

const DEFAULT_PRESETS: Record<string, ScenarioPreset[]> = {
  'text.generate': [
    { id: 'tg-acceptance', label: 'Acceptance note', prompt: 'Write a concise acceptance note for a Runtime-backed Nimi App.', intent: 'Smoke prompt — should fail closed without admitted SDK method.' },
    { id: 'tg-spec', label: 'Spec summary', prompt: 'Summarise how an app should fail closed when the admitted SDK surface is missing.', intent: 'Stress prompt — verifies typed unavailable copy.' },
  ],
  'chat.stream': [
    { id: 'cs-continue', label: 'Continuation probe', prompt: 'Continue this conversation as a Runtime app stream readiness check.', intent: 'Stream readiness probe.' },
  ],
  'text.embed': [
    { id: 'te-sample', label: 'Embedding sample', prompt: 'Nimi App tester embedding readiness sample.', intent: 'Vector shape diagnostics.' },
  ],
  'image.generate': [
    { id: 'ig-ui', label: 'Workbench preview', prompt: 'Generate a product-grade UI inspection image for a Nimi App workbench.', intent: 'Image artifact contract probe.' },
  ],
  'video.generate': [
    { id: 'vg-clip', label: 'Inspection clip', prompt: 'Create a short inspection clip for a Nimi App glass UI workflow.', intent: 'Video job lifecycle probe.' },
  ],
  'audio.synthesize': [
    { id: 'as-line', label: 'Synth single line', prompt: 'Synthesize a short Runtime acceptance sentence.', intent: 'Voice asset readiness probe.' },
  ],
  'audio.transcribe': [
    { id: 'at-url', label: 'Transcribe URL', prompt: 'https://example.test/sample.wav', intent: 'Paste a real http(s):// or file:// audio asset URL — Runtime fetches and transcribes it.' },
  ],
  'speech.bundle': [
    { id: 'sb-bundle', label: 'Voice catalog probe', prompt: 'List voices via runtime.media.tts.listVoices.', intent: 'No prompt needed — exercises the voice catalog readiness path.' },
  ],
  'world.generate': [
    { id: 'wg-fixture', label: 'Fixture probe', prompt: 'Resolve the world-tour fixture and open the standalone viewer.', intent: 'Standalone tauri viewer launch.' },
  ],
};

type Phase = 'idle' | 'running' | 'done';

type AdmissionView = {
  tone: 'success' | 'warning' | 'info';
  label: string;
  detail: string;
};

function admissionFor(capability: TesterCapability, runtime: TesterRuntimeInspection | null): AdmissionView {
  if (capability.execution === 'standalone-tauri') {
    return {
      tone: 'info',
      label: 'standalone tauri lane',
      detail: 'Runs in the app-owned Tauri window; runtime session is informational.',
    };
  }
  if (!runtime) {
    return {
      tone: 'info',
      label: 'awaiting runtime probe',
      detail: 'Workbench has not produced a runtime readiness reading yet.',
    };
  }
  if (runtime.status !== 'ready') {
    return {
      tone: 'warning',
      label: 'runtime not ready',
      detail: runtime.detail,
    };
  }
  if (capability.execution === 'typed-unavailable') {
    return {
      tone: 'warning',
      label: 'sdk gap',
      detail: capability.missingSurface || 'No admitted SDK method for this lane.',
    };
  }
  return {
    tone: 'success',
    label: 'admission ready',
    detail: 'Lane is admitted; runtime session and SDK surface are in place.',
  };
}

function consoleLine(result: TesterCapabilityRunResult | null): string {
  if (!result) return '> idle — awaiting capability invocation.';
  if (result.ok) return `> ${result.capabilityId} :: ready — ${result.message}`;
  return `> ${result.capabilityId} :: ${result.reason} — ${result.message}`;
}

function formatTrace(trace: TesterTypedSuccess['trace']): string | null {
  if (!trace) return null;
  const parts: string[] = [];
  if (trace.modelResolved) parts.push(`model=${trace.modelResolved}`);
  if (trace.routeDecision) parts.push(`route=${trace.routeDecision}`);
  if (trace.traceId) parts.push(`traceId=${trace.traceId.slice(0, 12)}…`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function TypedOutputBlock({ output }: { output: TesterTypedOutput }) {
  if (output.kind === 'text') {
    return (
      <div className="typed-output typed-output--text">
        <div className="typed-output__meta">
          <span><strong>finishReason</strong> {output.finishReason}</span>
          {typeof output.inputTokens === 'number' ? <span><strong>input</strong> {output.inputTokens}</span> : null}
          {typeof output.outputTokens === 'number' ? <span><strong>output</strong> {output.outputTokens}</span> : null}
          {typeof output.totalTokens === 'number' ? <span><strong>total</strong> {output.totalTokens}</span> : null}
          <span className="typed-output__chip">{output.streamed ? 'streamed' : 'single-shot'}</span>
        </div>
        <pre className="typed-output__body">{output.text || '(empty body)'}</pre>
      </div>
    );
  }
  if (output.kind === 'embedding') {
    return (
      <div className="typed-output typed-output--embedding">
        <div className="typed-output__meta">
          <span><strong>vectors</strong> {output.vectorCount}</span>
          <span><strong>dim</strong> {output.dimensions}</span>
          {typeof output.totalTokens === 'number' ? <span><strong>tokens</strong> {output.totalTokens}</span> : null}
        </div>
        <pre className="typed-output__body">{output.sample.length > 0 ? `[${output.sample.map((value) => value.toFixed(4)).join(', ')}${output.dimensions > output.sample.length ? ', …' : ''}]` : '(empty vector)'}</pre>
      </div>
    );
  }
  if (output.kind === 'artifacts') {
    return (
      <div className="typed-output typed-output--artifacts">
        <div className="typed-output__meta">
          <span><strong>job</strong> {output.jobId || '(no job id)'}</span>
          <span><strong>state</strong> {output.jobState}</span>
          <span><strong>artifacts</strong> {output.artifactCount}</span>
        </div>
        {output.firstArtifact ? (
          <pre className="typed-output__body">{JSON.stringify(output.firstArtifact, null, 2)}</pre>
        ) : (
          <p className="typed-output__note">No artifact metadata returned by Runtime.</p>
        )}
      </div>
    );
  }
  if (output.kind === 'transcript') {
    return (
      <div className="typed-output typed-output--text">
        <div className="typed-output__meta">
          <span><strong>job</strong> {output.jobId || '(no job id)'}</span>
          <span><strong>state</strong> {output.jobState}</span>
          <span><strong>artifacts</strong> {output.artifactCount}</span>
        </div>
        <pre className="typed-output__body">{output.text || '(empty transcript)'}</pre>
      </div>
    );
  }
  // voice-catalog
  return (
    <div className="typed-output typed-output--voices">
      <div className="typed-output__meta">
        <span><strong>model</strong> {output.modelResolved}</span>
        <span><strong>voices</strong> {output.voiceCount}</span>
      </div>
      {output.sample.length > 0 ? (
        <ul className="typed-output__list">
          {output.sample.map((voice) => (
            <li key={voice.voiceId}>
              <code>{voice.voiceId}</code>
              <span>{voice.name}</span>
              <span>{voice.lang}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="typed-output__note">Runtime returned an empty voice catalog.</p>
      )}
    </div>
  );
}

export function ScenarioPipeline({ capability, runtime, lastResult, onResult, onConsole }: ScenarioPipelineProps) {
  const presets = DEFAULT_PRESETS[capability.id] || [{ id: 'default', label: 'Default scenario', prompt: capability.summary, intent: 'Workbench default probe.' }];
  const [scenarioId, setScenarioId] = useState(presets[0].id);
  const [prompt, setPrompt] = useState(presets[0].prompt);
  const [phase, setPhase] = useState<Phase>('idle');
  const [worldFixture, setWorldFixture] = useState<ResolvedWorldTourFixture | null>(null);
  const [worldMessage, setWorldMessage] = useState<string | null>(null);
  const admission = useMemo(() => admissionFor(capability, runtime), [capability, runtime]);

  useEffect(() => {
    const firstPreset = (DEFAULT_PRESETS[capability.id] || [])[0];
    if (firstPreset) {
      setScenarioId(firstPreset.id);
      setPrompt(firstPreset.prompt);
    }
    setPhase('idle');
    setWorldFixture(null);
    setWorldMessage(null);
  }, [capability.id]);

  function selectScenario(id: string) {
    const preset = presets.find((item) => item.id === id);
    if (!preset) return;
    setScenarioId(id);
    setPrompt(preset.prompt);
    setPhase('idle');
  }

  async function runLane() {
    setPhase('running');
    onConsole?.(`> ${capability.id} :: invocation begin — scenario=${scenarioId}`);
    try {
      if (capability.id === 'world.generate') {
        const fixture = await resolveWorldTourFixture({});
        setWorldFixture(fixture);
        const opened = await openWorldTourWindow({ manifestPath: fixture.manifestPath });
        setWorldMessage(`Opened standalone viewer: ${opened.windowLabel}`);
        const result: TesterCapabilityRunResult = {
          ok: true,
          capabilityId: capability.id,
          capabilityLabel: capability.label,
          message: `Standalone viewer window opened with manifest ${fixture.manifestPath}.`,
          output: {
            kind: 'artifacts',
            jobId: opened.windowLabel,
            jobState: 'window-opened',
            artifactCount: 1,
            firstArtifact: { displayName: fixture.manifestPath, mimeType: 'application/x-nimi-world-manifest' },
          },
        };
        await onResult(result, prompt);
      } else {
        const result = await runTesterCapability({ capabilityId: capability.id, prompt, scenarioId });
        await onResult(result, prompt);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || 'Lane execution failed.');
      setWorldMessage(message);
      onConsole?.(`> ${capability.id} :: invocation error — ${message}`);
    } finally {
      setPhase('done');
    }
  }

  const segmentedItems = presets.map((preset) => ({ value: preset.id, label: preset.label }));
  const activePreset = presets.find((preset) => preset.id === scenarioId) || presets[0];

  return (
    <Surface className="scenario-pipeline" material="glass-thin" tone="panel" elevation="base" data-testid="nimi-tester-scenario-pipeline">
      <header className="scenario-pipeline__head">
        <div className="scenario-pipeline__title">
          <p className="eyebrow">{capability.surface}</p>
          <h3>{capability.label}</h3>
          <p className="scenario-pipeline__summary">{capability.summary}</p>
        </div>
        <div className="scenario-pipeline__chips">
          <StatusBadge tone={admission.tone === 'warning' ? 'warning' : admission.tone === 'success' ? 'success' : 'info'} shape="dot">
            {admission.label}
          </StatusBadge>
        </div>
      </header>

      <section className="scenario-pipeline__step" aria-label="Step 1 — pick scenario">
        <div className="scenario-pipeline__step-head">
          <span className="scenario-pipeline__step-index">1</span>
          <div>
            <p className="eyebrow">Scenario</p>
            <p className="scenario-pipeline__step-intent">{activePreset.intent}</p>
          </div>
        </div>
        {segmentedItems.length > 1 ? (
          <SegmentedControl items={segmentedItems} value={scenarioId} onValueChange={selectScenario} ariaLabel="Scenario presets" size="sm" />
        ) : (
          <p className="scenario-pipeline__single-preset">{segmentedItems[0].label}</p>
        )}
      </section>

      <section className="scenario-pipeline__step" aria-label="Step 2 — edit request">
        <div className="scenario-pipeline__step-head">
          <span className="scenario-pipeline__step-index">2</span>
          <div>
            <p className="eyebrow">Request body</p>
            <p className="scenario-pipeline__step-intent">App-owned draft; not persisted until the lane runs.</p>
          </div>
        </div>
        <TextareaField rows={4} value={prompt} onChange={(event) => setPrompt(event.currentTarget.value)} aria-label={`${capability.label} request`} />
      </section>

      <section className={`scenario-pipeline__step scenario-pipeline__admission scenario-pipeline__admission--${admission.tone}`} aria-label="Step 3 — admission state">
        <div className="scenario-pipeline__step-head">
          <span className="scenario-pipeline__step-index">3</span>
          <div>
            <p className="eyebrow">Admission</p>
            <p className="scenario-pipeline__step-intent">{admission.label}</p>
          </div>
        </div>
        <div className="scenario-pipeline__admission-body">
          {admission.tone === 'success' ? <CheckCircle2 size={15} /> : admission.tone === 'warning' ? <ShieldAlert size={15} /> : <CircleDot size={15} />}
          <span>{admission.detail}</span>
        </div>
      </section>

      <section className="scenario-pipeline__step scenario-pipeline__action" aria-label="Step 4 — run">
        <div className="scenario-pipeline__step-head">
          <span className="scenario-pipeline__step-index">4</span>
          <div>
            <p className="eyebrow">Run lane</p>
            <p className="scenario-pipeline__step-intent">Result is recorded into app-owned tester storage even when typed unavailable.</p>
          </div>
        </div>
        <div className="scenario-pipeline__action-row">
          <Button
            type="button"
            tone="primary"
            leadingIcon={<Play size={14} />}
            onClick={runLane}
            disabled={phase === 'running' || (!prompt.trim() && capability.id !== 'world.generate')}
            loading={phase === 'running'}
          >
            {phase === 'running' ? 'Invoking…' : 'Run lane'}
          </Button>
          <span className="scenario-pipeline__action-hint">
            {capability.execution === 'typed-unavailable'
              ? 'Lane returns typed unavailable until SDK admits this method.'
              : capability.execution === 'standalone-tauri'
              ? 'Lane calls the app-owned Tauri command; no SDK admission required.'
              : 'Lane will execute against the admitted runtime SDK surface.'}
          </span>
        </div>
      </section>

      <section className="scenario-pipeline__step scenario-pipeline__result" aria-label="Step 5 — result + evidence">
        <div className="scenario-pipeline__step-head">
          <span className="scenario-pipeline__step-index">5</span>
          <div>
            <p className="eyebrow">Result &amp; evidence</p>
            <p className="scenario-pipeline__step-intent">Console reflects the actual runtime/SDK outcome.</p>
          </div>
        </div>
        <Surface className="scenario-pipeline__console" material="glass-thin" tone="card" elevation="base">
          <div className="scenario-pipeline__console-head">
            <Terminal size={13} aria-hidden="true" />
            <span>Last typed result</span>
          </div>
          <pre className="scenario-pipeline__console-line">{consoleLine(lastResult)}</pre>
          {lastResult && !lastResult.ok ? (
            <p className="scenario-pipeline__console-hint">{lastResult.actionHint}</p>
          ) : null}
        </Surface>
        {lastResult && lastResult.ok ? (
          <Surface className="scenario-pipeline__output" material="glass-thin" tone="card" elevation="base">
            <div className="scenario-pipeline__output-head">
              <p className="eyebrow">Typed output</p>
              {formatTrace(lastResult.trace) ? (
                <span className="scenario-pipeline__trace">{formatTrace(lastResult.trace)}</span>
              ) : null}
            </div>
            <TypedOutputBlock output={lastResult.output} />
          </Surface>
        ) : null}
        {worldMessage ? (
          <InlineAlert tone={worldFixture ? 'success' : 'warning'} icon={worldFixture ? undefined : <AlertTriangle size={14} />}>
            <div className="runtime-alert-copy">
              <strong>{worldFixture ? 'World-tour command result' : 'World-tour command unavailable'}</strong>
              <span>{worldMessage}</span>
            </div>
          </InlineAlert>
        ) : null}
        {worldFixture ? <pre className="tester-json">{JSON.stringify(worldFixture, null, 2)}</pre> : null}
      </section>
    </Surface>
  );
}
