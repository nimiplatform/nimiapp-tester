import { EmptyState, ScrollArea, StatusBadge } from '@nimiplatform/kit/ui';
import { Boxes } from 'lucide-react';
import type { TesterRunHistory, TesterRunHistoryRecord } from '../tester-history.js';
import { getTesterCapability, type TesterCapabilityId } from '../tester-capabilities.js';

type FlatRecord = TesterRunHistoryRecord & { capabilityLabel: string };

function flattenHistory(history: TesterRunHistory): FlatRecord[] {
  const records: FlatRecord[] = [];
  for (const [capabilityId, list] of Object.entries(history)) {
    let label = capabilityId;
    try {
      label = getTesterCapability(capabilityId as TesterCapabilityId).label;
    } catch {
      label = capabilityId;
    }
    for (const record of list) {
      records.push({ ...record, capabilityLabel: label });
    }
  }
  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return records;
}

function statusTone(status: TesterRunHistoryRecord['status']): 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

function formatTimestamp(value: string): string {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' });
  } catch {
    return value;
  }
}

type RunsHistoryListProps = {
  history: TesterRunHistory | null;
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function RunsHistoryList({
  history,
  limit,
  emptyTitle = 'No runs captured yet',
  emptyDescription = 'Trigger a capability lane or resolve a typed blocker to populate this list.',
  className,
}: RunsHistoryListProps) {
  const flat = history ? flattenHistory(history) : [];
  const visible = typeof limit === 'number' ? flat.slice(0, limit) : flat;

  if (!visible.length) {
    return (
      <EmptyState
        icon={<Boxes size={18} />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ScrollArea className={className ? `runs-history ${className}` : 'runs-history'}>
      <ul className="runs-history__list">
        {visible.map((record) => (
          <li key={record.id} className="runs-history__row">
            <div className="runs-history__row-main">
              <span className="runs-history__capability">{record.capabilityLabel}</span>
              <span className="runs-history__prompt" title={record.prompt}>{record.prompt}</span>
            </div>
            <div className="runs-history__row-meta">
              <StatusBadge tone={statusTone(record.status)} shape="dot">
                {record.status}
              </StatusBadge>
              <span className="runs-history__time">{formatTimestamp(record.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
