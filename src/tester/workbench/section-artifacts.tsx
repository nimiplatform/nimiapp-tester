import { useEffect, useState } from 'react';
import { Button, EmptyState, InlineAlert, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import { PackageOpen, RefreshCw } from 'lucide-react';
import { EvidenceProtocol } from './evidence-protocol.js';
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

  const total = state.kind === 'ready' ? state.records.length : 0;

  return (
    <div className="section-artifacts">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">Artifacts</p>
          <h2>Captured media & world fixtures</h2>
          <p>Sourced from the app-owned tauri storage command. No synthetic artifacts — empty means no real run has produced one.</p>
        </div>
        <div className="section-header__actions">
          <StatusBadge tone={total === 0 ? 'neutral' : 'success'} shape="dot">{total} artifacts</StatusBadge>
          <Button
            type="button"
            tone="secondary"
            size="sm"
            leadingIcon={<RefreshCw size={14} />}
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Reload
          </Button>
        </div>
      </header>

      <div className="evidence-grid">
        <Surface className="artifacts-card" material="glass-thin" tone="card" elevation="base">
          {state.kind === 'loading' ? (
            <p className="artifacts-card__status">Loading artifact projection…</p>
          ) : null}
          {state.kind === 'error' ? (
            <InlineAlert tone="warning">
              <div className="runtime-alert-copy">
                <strong>Typed unavailable</strong>
                <span>{state.message}</span>
                <span>tester_image_history_load is the only admitted reader — fix the tauri command before retrying.</span>
              </div>
            </InlineAlert>
          ) : null}
          {state.kind === 'ready' && state.records.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={18} />}
              title="No captured artifacts"
              description="An Image Generate, Video Generate, or Speech Bundle lane that reaches an admitted SDK surface will append a record here via tester_image_history_save."
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
        <aside className="evidence-aside" aria-label="Artifacts evidence protocol">
          <p className="eyebrow">Evidence protocol</p>
          <EvidenceProtocol
            source="$TMPDIR/nimiapp-tester/tester-image-history.json"
            producer="Image / Video / Speech lanes → tester_image_history_save (app-owned tauri command)"
            notes={[
              'Only real Runtime/SDK results are persisted — never placeholder media.',
              'Up to 80 records are retained; older entries fall off automatically.',
              'World-tour fixtures live alongside under world-tour/ inside the same tester temp root.',
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
