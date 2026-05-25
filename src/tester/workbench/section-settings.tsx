import { useState } from 'react';
import { ProgressIndicator, SegmentedControl, StatusBadge, Surface, Toggle } from '@nimiplatform/kit/ui';

const evidenceModes = [
  { value: 'manual', label: 'Manual' },
  { value: 'on-run', label: 'On run' },
  { value: 'continuous', label: 'Continuous' },
];

export function SectionSettings() {
  const [localDrafts, setLocalDrafts] = useState(true);
  const [evidenceCapture, setEvidenceCapture] = useState(false);
  const [evidenceMode, setEvidenceMode] = useState('manual');
  const [verbose, setVerbose] = useState(false);

  return (
    <div className="section-settings">
      <header className="section-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Workbench preferences</h2>
          <p>App-owned local toggles. Auth and Runtime configuration stay scaffold-managed.</p>
        </div>
      </header>
      <div className="settings-grid">
        <Surface className="settings-card" material="glass-thin" tone="card" elevation="base">
          <div className="settings-card__head">
            <div>
              <p className="eyebrow">Local data</p>
              <h3>Drafts and persistence</h3>
            </div>
            <StatusBadge tone={localDrafts ? 'success' : 'neutral'} shape="dot">
              {localDrafts ? 'enabled' : 'disabled'}
            </StatusBadge>
          </div>
          <label className="settings-row">
            <span>Persist capability request drafts</span>
            <Toggle checked={localDrafts} onChange={setLocalDrafts} />
          </label>
          <label className="settings-row">
            <span>Verbose execution console</span>
            <Toggle checked={verbose} onChange={setVerbose} />
          </label>
          <ProgressIndicator value={localDrafts ? 72 : 36} showValue />
        </Surface>

        <Surface className="settings-card" material="glass-thin" tone="card" elevation="base">
          <div className="settings-card__head">
            <div>
              <p className="eyebrow">Evidence capture</p>
              <h3>Acceptance screenshots and traces</h3>
            </div>
            <StatusBadge tone={evidenceCapture ? 'info' : 'neutral'} shape="dot">
              {evidenceMode}
            </StatusBadge>
          </div>
          <label className="settings-row">
            <span>Auto-capture on capability completion</span>
            <Toggle checked={evidenceCapture} onChange={setEvidenceCapture} />
          </label>
          <SegmentedControl
            items={evidenceModes}
            value={evidenceMode}
            onValueChange={setEvidenceMode}
            ariaLabel="Evidence capture cadence"
            size="sm"
          />
        </Surface>
      </div>
    </div>
  );
}
