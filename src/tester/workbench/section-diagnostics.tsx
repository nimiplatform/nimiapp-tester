import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { InlineAlert, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import { RuntimeReadinessCard } from './runtime-readiness-card.js';
import type { TesterAIConfigSummary } from '../tester-ai-config.js';

type SectionDiagnosticsProps = {
  summary: TesterAIConfigSummary | null;
};

const boundaryRules = [
  {
    label: 'No Desktop renderer private imports',
    detail: 'Tester app must not pull from @renderer/* or @runtime/* internals.',
  },
  {
    label: 'No app-local REST bypass',
    detail: 'All AI execution flows through admitted SDK methods or fails closed.',
  },
  {
    label: 'No synthetic success',
    detail: 'Unavailable lanes surface typed reasons. No placeholder artifacts.',
  },
  {
    label: 'Scaffold-managed auth and Tauri glue',
    detail: 'AuthGate, runtime-platform, manifest, and submission remain platform-owned.',
  },
];

export function SectionDiagnostics({ summary }: SectionDiagnosticsProps) {
  const runtime = summary?.runtime;
  return (
    <div className="section-diagnostics">
      <header className="section-header">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h2>Runtime, boundaries, and projection</h2>
          <p>Authoritative view of session readiness and contract enforcement.</p>
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
            {boundaryRules.map((rule) => (
              <li key={rule.label}>
                <CheckCircle2 size={14} aria-hidden="true" />
                <div>
                  <strong>{rule.label}</strong>
                  <span>{rule.detail}</span>
                </div>
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
          </div>
        </InlineAlert>
      ) : null}
    </div>
  );
}
