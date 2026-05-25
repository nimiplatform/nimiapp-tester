import { InlineAlert, Surface } from '@nimiplatform/kit/ui';
import { ScrollText, Terminal } from 'lucide-react';
import { CapabilityMatrix } from './capability-matrix.js';
import { CapabilityDetail } from './capability-detail.js';
import { RuntimeReadinessCard } from './runtime-readiness-card.js';
import { RunsHistoryList } from './runs-history-list.js';
import { KitSystemSummary } from './kit-system-summary.js';
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
  onOpenKitComponents: () => void;
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
  onOpenKitComponents,
}: SectionAITestingProps) {
  return (
    <div className="section-ai-testing" data-testid="nimi-tester-section-ai-testing">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">AI Testing Cockpit</p>
          <h2>Capability lanes</h2>
          <p>Each lane runs through real Runtime/SDK admission. Typed unavailable is surfaced inline as evidence — never faked.</p>
        </div>
      </header>

      <div className="dual-core-grid">
        <div className="dual-core-grid__cockpit">
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
        <aside className="dual-core-grid__kit" aria-label="Kit system summary">
          <KitSystemSummary onOpen={onOpenKitComponents} />
        </aside>
      </div>
    </div>
  );
}
