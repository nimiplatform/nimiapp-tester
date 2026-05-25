import { AlertTriangle, CheckCircle2, CircleSlash, Layers, ShieldCheck, Workflow } from 'lucide-react';
import { InlineAlert, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import { RuntimeReadinessCard } from './runtime-readiness-card.js';
import { testerCapabilities } from '../tester-capabilities.js';
import type { TesterAIConfigSummary } from '../tester-ai-config.js';

type SectionDiagnosticsProps = {
  summary: TesterAIConfigSummary | null;
};

type CheckTone = 'pass' | 'warn' | 'info';

type ContractCheck = {
  label: string;
  detail: string;
  tone: CheckTone;
};

const boundaryChecks: ContractCheck[] = [
  {
    label: 'No Desktop renderer private imports',
    detail: 'Tester app must not pull from @renderer/* or @runtime/* internals.',
    tone: 'pass',
  },
  {
    label: 'No app-local REST bypass',
    detail: 'All AI execution flows through admitted SDK methods or fails closed.',
    tone: 'pass',
  },
  {
    label: 'No synthetic success',
    detail: 'Unavailable lanes surface typed reasons — no placeholder artifacts or fake retries.',
    tone: 'pass',
  },
  {
    label: 'Scaffold-managed auth + tauri glue',
    detail: 'AuthGate, runtime-platform, manifest, submission, and main.tsx remain platform-owned.',
    tone: 'pass',
  },
];

const tauriCommands = [
  { name: 'tester_run_history_load', purpose: 'Read persisted lane runs (object keyed by capability id).' },
  { name: 'tester_run_history_save', purpose: 'Append a typed run record after every lane invocation.' },
  { name: 'tester_image_history_load', purpose: 'Read persisted media/world artifacts (array, ≤80 entries).' },
  { name: 'tester_image_history_save', purpose: 'Persist real Runtime/SDK artifact records.' },
  { name: 'resolve_world_tour_fixture', purpose: 'Resolve the standalone world-tour fixture manifest path.' },
  { name: 'open_world_tour_window', purpose: 'Launch the app-owned tauri viewer window with the fixture.' },
];

function admissionLanes() {
  const typedUnavailable = testerCapabilities.filter((cap) => cap.execution === 'typed-unavailable');
  const standalone = testerCapabilities.filter((cap) => cap.execution === 'standalone-tauri');
  const admitted = testerCapabilities.filter((cap) => cap.execution === 'runtime-sdk');
  return { typedUnavailable, standalone, admitted };
}

function ToneIcon({ tone }: { tone: CheckTone }) {
  if (tone === 'pass') return <CheckCircle2 size={14} aria-hidden="true" />;
  if (tone === 'warn') return <AlertTriangle size={14} aria-hidden="true" />;
  return <CircleSlash size={14} aria-hidden="true" />;
}

export function SectionDiagnostics({ summary }: SectionDiagnosticsProps) {
  const runtime = summary?.runtime;
  const lanes = admissionLanes();

  return (
    <div className="section-diagnostics">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h2>Contract inspector</h2>
          <p>Runtime projection, boundary policy, SDK admission, and the app-owned tauri command surface — one screen per audit pass.</p>
        </div>
        <StatusBadge tone={runtime?.status === 'ready' ? 'success' : 'warning'} shape="dot">
          {runtime ? runtime.status : 'checking'}
        </StatusBadge>
      </header>

      <div className="diagnostics-grid">
        <RuntimeReadinessCard summary={summary} />

        <Surface className="boundary-card" material="glass-thin" tone="card" elevation="base">
          <div className="boundary-card__head">
            <div>
              <p className="eyebrow">Boundary policy</p>
              <h3>Enforced contract rules</h3>
            </div>
            <ShieldCheck size={16} aria-hidden="true" />
          </div>
          <ul className="boundary-card__list">
            {boundaryChecks.map((rule) => (
              <li key={rule.label} className={`boundary-card__rule boundary-card__rule--${rule.tone}`}>
                <ToneIcon tone={rule.tone} />
                <div>
                  <strong>{rule.label}</strong>
                  <span>{rule.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface className="boundary-card" material="glass-thin" tone="card" elevation="base">
          <div className="boundary-card__head">
            <div>
              <p className="eyebrow">SDK admission</p>
              <h3>Per-lane admission map</h3>
            </div>
            <Layers size={16} aria-hidden="true" />
          </div>
          <ul className="admission-grid">
            {lanes.admitted.length > 0 ? lanes.admitted.map((cap) => (
              <li key={cap.id} className="admission-row admission-row--ready">
                <StatusBadge tone="success" shape="dot">admitted</StatusBadge>
                <div>
                  <strong>{cap.label}</strong>
                  <span>{cap.surface}</span>
                </div>
              </li>
            )) : null}
            {lanes.standalone.map((cap) => (
              <li key={cap.id} className="admission-row admission-row--info">
                <StatusBadge tone="info" shape="dot">tauri</StatusBadge>
                <div>
                  <strong>{cap.label}</strong>
                  <span>{cap.surface}</span>
                </div>
              </li>
            ))}
            {lanes.typedUnavailable.map((cap) => (
              <li key={cap.id} className="admission-row admission-row--warn">
                <StatusBadge tone="warning" shape="dot">sdk gap</StatusBadge>
                <div>
                  <strong>{cap.label}</strong>
                  <span>{cap.missingSurface || cap.surface}</span>
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface className="boundary-card" material="glass-thin" tone="card" elevation="base">
          <div className="boundary-card__head">
            <div>
              <p className="eyebrow">App-owned tauri surface</p>
              <h3>Storage & viewer commands</h3>
            </div>
            <Workflow size={16} aria-hidden="true" />
          </div>
          <ul className="tauri-command-list">
            {tauriCommands.map((cmd) => (
              <li key={cmd.name}>
                <code>{cmd.name}</code>
                <span>{cmd.purpose}</span>
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      {runtime && runtime.status !== 'ready' ? (
        <InlineAlert tone="warning">
          <div className="runtime-alert-copy">
            <strong>Runtime projection blocked</strong>
            <span>{runtime.detail}</span>
            <span>Re-run the workbench command bar Run check after restoring transport.</span>
          </div>
        </InlineAlert>
      ) : null}
    </div>
  );
}
