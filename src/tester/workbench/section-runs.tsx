import { useMemo, useState } from 'react';
import { SegmentedControl, Surface } from '@nimiplatform/kit/ui';
import { RunsHistoryList } from './runs-history-list.js';
import { testerCapabilities, type TesterCapabilityId } from '../tester-capabilities.js';
import type { TesterRunHistory } from '../tester-history.js';

type SectionRunsProps = {
  history: TesterRunHistory | null;
};

type FilterValue = TesterCapabilityId | 'all';

export function SectionRuns({ history }: SectionRunsProps) {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filterItems = useMemo(() => {
    return [
      { value: 'all' as FilterValue, label: 'All lanes' },
      ...testerCapabilities.map((capability) => ({ value: capability.id as FilterValue, label: capability.label })),
    ];
  }, []);

  const filteredHistory = useMemo<TesterRunHistory | null>(() => {
    if (!history) return null;
    if (filter === 'all') return history;
    const list = history[filter];
    return list ? { [filter]: list } : {};
  }, [history, filter]);

  return (
    <div className="section-runs">
      <header className="section-header">
        <div>
          <p className="eyebrow">Runs</p>
          <h2>Persisted capability execution history</h2>
          <p>Runs are stored by the app-owned Tauri storage command. Typed unavailable runs count as evidence.</p>
        </div>
      </header>
      <Surface className="runs-card" material="glass-thin" tone="card" elevation="base">
        <SegmentedControl
          items={filterItems}
          value={filter}
          onValueChange={(value) => setFilter(value as FilterValue)}
          ariaLabel="Filter runs by capability"
          size="sm"
        />
        <RunsHistoryList history={filteredHistory} className="runs-card__list" />
      </Surface>
    </div>
  );
}
