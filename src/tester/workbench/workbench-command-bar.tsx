import { CircleDot, Cog, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { Button, IconButton, StatusBadge } from '@nimiplatform/kit/ui';
import type { TesterRuntimeInspection } from '../tester-runtime.js';

type CommandBarProps = {
  appId: string;
  scaffoldProfile: string;
  runtime: TesterRuntimeInspection | null;
  busy: boolean;
  onRunCheck: () => void;
  onCaptureEvidence: () => void;
};

function runtimeTone(runtime: TesterRuntimeInspection | null): 'success' | 'warning' | 'neutral' {
  if (!runtime) return 'neutral';
  return runtime.status === 'ready' ? 'success' : 'warning';
}

function runtimeLabel(runtime: TesterRuntimeInspection | null): string {
  if (!runtime) return 'Runtime: checking';
  return runtime.status === 'ready' ? 'Runtime: ready' : 'Runtime: typed unavailable';
}

export function WorkbenchCommandBar({
  appId,
  scaffoldProfile,
  runtime,
  busy,
  onRunCheck,
  onCaptureEvidence,
}: CommandBarProps) {
  return (
    <header className="workbench-command-bar" data-testid="nimi-tester-command-bar">
      <div className="workbench-command-bar__identity">
        <div className="workbench-command-bar__chip">
          <CircleDot size={14} aria-hidden="true" />
          <span>{appId}</span>
        </div>
        <span className="workbench-command-bar__divider" aria-hidden="true" />
        <div className="workbench-command-bar__meta">
          <span>{scaffoldProfile} scaffold</span>
          <span>third-party Nimi App workbench</span>
        </div>
      </div>
      <div className="workbench-command-bar__status">
        <StatusBadge tone={runtimeTone(runtime)} shape="dot">
          {runtimeLabel(runtime)}
        </StatusBadge>
        <StatusBadge tone="info" shape="outline">
          {runtime ? runtime.mode : 'mode: pending'}
        </StatusBadge>
        <StatusBadge tone="neutral">developer-mode</StatusBadge>
      </div>
      <div className="workbench-command-bar__actions">
        <Button
          type="button"
          tone="secondary"
          size="sm"
          leadingIcon={<RefreshCw size={14} />}
          onClick={onRunCheck}
          loading={busy}
        >
          Run check
        </Button>
        <Button
          type="button"
          tone="primary"
          size="sm"
          leadingIcon={<Save size={14} />}
          onClick={onCaptureEvidence}
        >
          Capture evidence
        </Button>
        <IconButton
          aria-label="Workbench preferences"
          tone="ghost"
          size="sm"
          icon={<Cog size={15} />}
        />
        <IconButton
          aria-label="Boundary policy"
          tone="ghost"
          size="sm"
          icon={<ShieldCheck size={15} />}
        />
      </div>
    </header>
  );
}
