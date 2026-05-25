import { useEffect, useState } from 'react';
import { EmptyState, InlineAlert, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import { Boxes, RefreshCw } from 'lucide-react';
import { Button } from '@nimiplatform/kit/ui';
import { loadTesterImageHistory, type TesterImageHistoryRecord } from '../tester-image-history.js';

type ArtifactsState =
  | { kind: 'loading' }
  | { kind: 'ready'; records: TesterImageHistoryRecord[] }
  | { kind: 'error'; message: string };

function statusTone(status: TesterImageHistoryRecord['status']): 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

export function SectionArtifacts() {
  const [state, setState] = useState<ArtifactsState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ kind: 'loading' });
    loadTesterImageHistory()
      .then((records) => {
        if (!active) return;
        setState({ kind: 'ready', records });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          kind: 'error',
          message: error instanceof Error ? error.message : String(error || 'Artifacts unavailable.'),
        });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div className="section-artifacts">
      <header className="section-header">
        <div>
          <p className="eyebrow">Artifacts</p>
          <h2>Captured media and world fixtures</h2>
          <p>Sourced from the standalone Tauri storage command. No synthetic artifacts.</p>
        </div>
        <Button
          type="button"
          tone="secondary"
          size="sm"
          leadingIcon={<RefreshCw size={14} />}
          onClick={() => setReloadKey((value) => value + 1)}
        >
          Reload
        </Button>
      </header>
      <Surface className="artifacts-card" material="glass-thin" tone="card" elevation="base">
        {state.kind === 'loading' ? (
          <p className="artifacts-card__status">Loading artifact projection…</p>
        ) : null}
        {state.kind === 'error' ? (
          <InlineAlert tone="warning">
            <div className="runtime-alert-copy">
              <strong>Typed unavailable</strong>
              <span>{state.message}</span>
            </div>
          </InlineAlert>
        ) : null}
        {state.kind === 'ready' && state.records.length === 0 ? (
          <EmptyState
            icon={<Boxes size={18} />}
            title="No captured artifacts"
            description="Run a capability lane that resolves to a real Runtime artifact, or capture evidence from a typed unavailable lane."
          />
        ) : null}
        {state.kind === 'ready' && state.records.length > 0 ? (
          <ul className="artifacts-list">
            {state.records.map((record) => (
              <li key={record.id} className="artifacts-row">
                <div>
                  <strong>{record.title}</strong>
                  <span>{record.capabilityId} · {record.createdAt}</span>
                </div>
                <StatusBadge tone={statusTone(record.status)} shape="dot">{record.status}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
      </Surface>
    </div>
  );
}
