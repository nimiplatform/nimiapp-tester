import { useMemo, useState } from 'react';
import { EmptyState, FieldShell, SelectField, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import { ScrollText } from 'lucide-react';
import { RunsHistoryList } from './runs-history-list.js';
import { EvidenceProtocol } from './evidence-protocol.js';
import { testerCapabilities, type TesterCapabilityId } from '../tester-capabilities.js';
import type { TesterRunHistory } from '../tester-history.js';

type SectionRunsProps = {
  history: TesterRunHistory | null;
};

type FilterValue = TesterCapabilityId | 'all';

function countRuns(history: TesterRunHistory | null): number {
  if (!history) return 0;
  return Object.values(history).reduce((sum, list) => sum + list.length, 0);
}

export function SectionRuns({ history }: SectionRunsProps) {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filterItems = useMemo(() => [
    { value: 'all' as FilterValue, label: 'All lanes' },
    ...testerCapabilities.map((capability) => ({ value: capability.id as FilterValue, label: capability.label })),
  ], []);

  const filteredHistory = useMemo<TesterRunHistory | null>(() => {
    if (!history) return null;
    if (filter === 'all') return history;
    const list = history[filter];
    return list ? { [filter]: list } : {};
  }, [history, filter]);

  const total = countRuns(history);

  return (
    <div className="section-runs">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">Runs</p>
          <h2>Persisted capability execution history</h2>
          <p>Every lane invocation is written to app-owned tester storage — typed unavailable still counts as evidence.</p>
        </div>
        <StatusBadge tone={total === 0 ? 'neutral' : 'info'} shape="dot">{total} runs persisted</StatusBadge>
      </header>

      <div className="evidence-grid">
        <Surface className="runs-card" material="glass-thin" tone="card" elevation="base">
          <FieldShell label="Filter by lane">
            <SelectField
              value={filter}
              onValueChange={(value) => setFilter(value as FilterValue)}
              options={filterItems.map((item) => ({ value: item.value, label: item.label }))}
              aria-label="Filter runs by capability"
            />
          </FieldShell>
          {total === 0 ? (
            <EmptyState
              icon={<ScrollText size={18} />}
              title="No runs captured yet"
              description="The Run lane button in AI Testing writes here via tester_run_history_save. Typed unavailable returns also persist so you can audit fail-closed paths."
            />
          ) : (
            <RunsHistoryList history={filteredHistory} className="runs-card__list" />
          )}
        </Surface>
        <aside className="evidence-aside" aria-label="Runs evidence protocol">
          <p className="eyebrow">Evidence protocol</p>
          <EvidenceProtocol
            source="$TMPDIR/nimiapp-tester/tester-run-history.json"
            producer="AI Testing → Run lane → tester_run_history_save (app-owned tauri command)"
            notes={[
              'Loader: tester_run_history_load returns an object keyed by capability id.',
              'Records keep prompt, status, message, createdAt — never synthesised when SDK is missing.',
              'Last 40 entries per capability are retained; older entries fall off automatically.',
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
