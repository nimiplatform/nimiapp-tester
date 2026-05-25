import { Activity, Cable, ShieldCheck } from 'lucide-react';
import { InlineAlert, StatusBadge, Surface } from '@nimiplatform/kit/ui';
import type { TesterAIConfigSummary } from '../tester-ai-config.js';

type RuntimeReadinessCardProps = {
  summary: TesterAIConfigSummary | null;
};

function tone(summary: TesterAIConfigSummary | null): 'success' | 'warning' | 'neutral' {
  if (!summary) return 'neutral';
  return summary.runtime.status === 'ready' ? 'success' : 'warning';
}

export function RuntimeReadinessCard({ summary }: RuntimeReadinessCardProps) {
  const runtime = summary?.runtime;
  return (
    <Surface
      className="runtime-readiness-card"
      material="glass-thin"
      tone="card"
      elevation="base"
      data-testid="nimi-tester-runtime-diagnostics"
    >
      <div className="runtime-readiness-card__head">
        <div>
          <p className="eyebrow">Runtime Readiness</p>
          <h3>Session projection</h3>
        </div>
        <StatusBadge tone={tone(summary)} shape="dot">
          {runtime ? runtime.status : 'checking'}
        </StatusBadge>
      </div>
      <ul className="runtime-readiness-card__facts">
        <li>
          <Activity size={13} aria-hidden="true" />
          <span className="runtime-readiness-card__fact-label">Mode</span>
          <span>{runtime?.mode || '—'}</span>
        </li>
        <li>
          <ShieldCheck size={13} aria-hidden="true" />
          <span className="runtime-readiness-card__fact-label">Scheduling owner</span>
          <span>{summary?.schedulingOwner || 'runtime'}</span>
        </li>
        <li>
          <Cable size={13} aria-hidden="true" />
          <span className="runtime-readiness-card__fact-label">Provider catalog</span>
          <span>{summary?.providerCatalogSurface || 'runtimeAdmin.listConnectors/listConnectorModels'}</span>
        </li>
        <li>
          <ShieldCheck size={13} aria-hidden="true" />
          <span className="runtime-readiness-card__fact-label">App-local defaults</span>
          <span>{summary?.appLocalProviderDefaults === false ? 'forbidden' : 'checking'}</span>
        </li>
      </ul>
      {runtime && runtime.status !== 'ready' ? (
        <InlineAlert tone="warning">
          <div className="runtime-alert-copy">
            <strong>Typed unavailable</strong>
            <span>{runtime.detail}</span>
          </div>
        </InlineAlert>
      ) : null}
      {runtime?.healthJson ? (
        <pre className="runtime-readiness-card__json">{runtime.healthJson}</pre>
      ) : null}
    </Surface>
  );
}
