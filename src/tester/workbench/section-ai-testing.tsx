import { InlineAlert, Surface } from '@nimiplatform/kit/ui';
import { ScrollText } from 'lucide-react';
import { LaneSelector } from './lane-selector.js';
import { ScenarioPipeline } from './scenario-pipeline.js';
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
  const runtime = summary?.runtime ?? null;
  return (
    <div className="section-ai-testing" data-testid="nimi-tester-section-ai-testing">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">AI Testing Cockpit</p>
          <h2>Lane → scenario → admission → run → evidence</h2>
          <p>Pick a capability lane, edit the scenario, watch admission state, run, and read the typed result. No mock returns.</p>
        </div>
      </header>

      <div className="dual-core-grid">
        <div className="dual-core-grid__cockpit">
          <div className="cockpit-pipeline-grid">
            <LaneSelector activeId={activeId} onSelect={onSelect} />
            <ScenarioPipeline
              capability={capability}
              runtime={runtime}
              lastResult={lastResult}
              onResult={onResult}
            />
          </div>
          <div className="cockpit-grid">
            <div className="cockpit-grid__primary">
              <RuntimeReadinessCard summary={summary} />
            </div>
            <div className="cockpit-grid__sidebar">
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
