import { Activity, BookCheck, FileSearch, GitBranch, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { TesterAIConfigSummary } from '../tester-ai-config.js';
import { testerCapabilities } from '../tester-capabilities.js';

type ReadinessTone = 'success' | 'info' | 'warning' | 'neutral';

type ReadinessCell = {
  id: string;
  label: string;
  primary: string;
  detail: string;
  tone: ReadinessTone;
  icon: LucideIcon;
};

type ReadinessBandProps = {
  summary: TesterAIConfigSummary | null;
  evidenceCapture?: 'enabled' | 'disabled';
};

function countTypedUnavailable(): number {
  return testerCapabilities.filter((capability) => capability.execution === 'typed-unavailable').length;
}

function countStandalone(): number {
  return testerCapabilities.filter((capability) => capability.execution === 'standalone-tauri').length;
}

export function ReadinessBand({ summary, evidenceCapture = 'disabled' }: ReadinessBandProps) {
  const runtime = summary?.runtime;
  const total = testerCapabilities.length;
  const typedUnavailable = countTypedUnavailable();
  const standalone = countStandalone();

  const cells: ReadinessCell[] = [
    {
      id: 'runtime-session',
      label: 'Runtime session',
      primary: runtime ? runtime.mode : 'checking',
      detail: runtime
        ? runtime.status === 'ready'
          ? 'runtime app projection ready'
          : 'projection unavailable — see diagnostics'
        : 'awaiting first probe',
      tone: runtime ? (runtime.status === 'ready' ? 'success' : 'warning') : 'neutral',
      icon: Activity,
    },
    {
      id: 'provider-catalog',
      label: 'Provider catalog',
      primary: summary?.providerCatalogSurface || 'runtimeAdmin.listProviderCatalog',
      detail: summary?.schedulingOwner === 'runtime'
        ? 'scheduling owned by runtime'
        : 'scheduling owner pending',
      tone: 'info',
      icon: GitBranch,
    },
    {
      id: 'sdk-gaps',
      label: 'SDK gaps',
      primary: `${typedUnavailable} / ${total} lanes typed-unavailable`,
      detail: standalone
        ? `${standalone} standalone tauri lane${standalone === 1 ? '' : 's'} admitted`
        : 'no admitted runtime lane yet',
      tone: typedUnavailable === 0 ? 'success' : 'warning',
      icon: FileSearch,
    },
    {
      id: 'evidence-capture',
      label: 'Evidence capture',
      primary: evidenceCapture === 'enabled' ? 'auto on cockpit run' : 'manual via command bar',
      detail: 'real runs persist via app-owned tester storage',
      tone: evidenceCapture === 'enabled' ? 'info' : 'neutral',
      icon: BookCheck,
    },
    {
      id: 'app-boundary',
      label: 'App boundary',
      primary: 'fail-closed contract',
      detail: 'no rest bypass · no synthetic success · scaffold-managed auth',
      tone: 'success',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="readiness-band" aria-label="Runtime readiness status band" data-testid="nimi-tester-readiness-band">
      {cells.map((cell) => {
        const Icon = cell.icon;
        return (
          <article key={cell.id} className={`readiness-cell readiness-cell--${cell.tone}`}>
            <header className="readiness-cell__head">
              <span className="readiness-cell__icon" aria-hidden="true">
                <Icon size={13} />
              </span>
              <span className="readiness-cell__label">{cell.label}</span>
              <span className={`readiness-cell__dot readiness-cell__dot--${cell.tone}`} aria-hidden="true" />
            </header>
            <p className="readiness-cell__primary" title={cell.primary}>{cell.primary}</p>
            <p className="readiness-cell__detail">{cell.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
