import { InlineAlert, Surface } from '@nimiplatform/kit/ui';
import { ScrollText, Terminal } from 'lucide-react';
import { CapabilityMatrix } from './capability-matrix.js';
import { CapabilityDetail } from './capability-detail.js';
import { RuntimeReadinessCard } from './runtime-readiness-card.js';
import { RunsHistoryList } from './runs-history-list.js';
import type { TesterCapability, TesterCapabilityId } from '../tester-capabilities.js';
import type { TesterAIConfigSummary } from '../tester-ai-config.js';
import type { TesterRunHistory } from '../tester-history.js';
import type { TesterCapabilityRunResult } from '../tester-runtime.js';

type SectionAITestingProps = {
  activeId: TesterCapabilityId;
  onSelect: (id: TesterCapabilityId) => void;
  capability: TesterCapability;
  onResult: (result: TesterCapabilityRunResult, prompt: string) => void | Promise<void>;
  summary: TesterAIConfigSummary | null;
  history: TesterRunHistory | null;
  lastResult: TesterCapabilityRunResult | null;
  historyError: string | null;
};

function consoleLine(result: TesterCapabilityRunResult | null): string {
  if (!result) return '> idle — awaiting capability invocation.';
  if (result.ok) {
    return `> ${result.capabilityId} :: ready — ${result.message}`;
  }
  return `> ${result.capabilityId} :: ${result.reason} — ${result.message}`;
}

export function SectionAITesting({
  activeId,
  onSelect,
  capability,
  onResult,
  summary,
  history,
  lastResult,
  historyError,
}: SectionAITestingProps) {
  return (
    <div className="section-ai-testing" data-testid="nimi-tester-section-ai-testing">
      <header className="section-header">
        <div>
          <p className="eyebrow">AI Testing Cockpit</p>
          <h2>Capability matrix</h2>
          <p>Pick a capability lane. Execution is bound to Runtime/SDK admission; typed unavailable is surfaced inline.</p>
        </div>
      </header>

      <CapabilityMatrix activeId={activeId} onSelect={onSelect} />

      <div className="cockpit-grid">
        <div className="cockpit-grid__primary">
          <CapabilityDetail capability={capability} onResult={onResult} />
          <Surface className="cockpit-console" material="glass-thin" tone="card" elevation="base">
            <div className="cockpit-console__head">
              <div>
                <p className="eyebrow">Execution console</p>
                <h3>Last typed result</h3>
              </div>
              <Terminal size={15} aria-hidden="true" />
            </div>
            <pre className="cockpit-console__line">{consoleLine(lastResult)}</pre>
            {lastResult && !lastResult.ok ? (
              <p className="cockpit-console__hint">{lastResult.actionHint}</p>
            ) : null}
          </Surface>
        </div>
        <div className="cockpit-grid__sidebar">
          <RuntimeReadinessCard summary={summary} />
          <Surface className="cockpit-runs" material="glass-thin" tone="card" elevation="base">
            <div className="cockpit-runs__head">
              <div>
                <p className="eyebrow">Recent runs</p>
                <h3>Capability history</h3>
              </div>
              <ScrollText size={15} aria-hidden="true" />
            </div>
            <RunsHistoryList history={history} limit={6} />
            {historyError ? (
              <InlineAlert tone="warning">
                <div className="runtime-alert-copy">
                  <strong>History persistence unavailable</strong>
                  <span>{historyError}</span>
                </div>
              </InlineAlert>
            ) : null}
          </Surface>
        </div>
      </div>
    </div>
  );
}
