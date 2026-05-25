import { useCallback, useEffect, useMemo, useState } from 'react';
import './tester-workbench.css';
import { getTesterCapability, type TesterCapabilityId } from './tester-capabilities.js';
import { appendTesterRunHistory, loadTesterRunHistory, type TesterRunHistory } from './tester-history.js';
import { loadTesterAIConfigSummary, type TesterAIConfigSummary } from './tester-ai-config.js';
import { inspectRuntimeReadiness, type TesterCapabilityRunResult } from './tester-runtime.js';
import { testerTestIds } from './tester-test-ids.js';
import { appId, scaffoldProfile } from '../shell/auth/runtime-platform.js';
import { WorkbenchSideNav } from './workbench/workbench-side-nav.js';
import { WorkbenchCommandBar } from './workbench/workbench-command-bar.js';
import { ReadinessBand } from './workbench/readiness-band.js';
import { SectionAITesting } from './workbench/section-ai-testing.js';
import { SectionRuns } from './workbench/section-runs.js';
import { SectionArtifacts } from './workbench/section-artifacts.js';
import { SectionDiagnostics } from './workbench/section-diagnostics.js';
import { SectionSettings } from './workbench/section-settings.js';
import type { WorkbenchSectionId } from './workbench/workbench-context.js';
import { KitComponentGallery } from './kit-component-gallery.js';

const APP_VERSION = '0.1.0-dev';
const initialCapabilityId: TesterCapabilityId = 'text.generate';

type TesterWorkbenchProps = {
  title: string;
};

function makeRecordId() {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function TesterWorkbench(_props: TesterWorkbenchProps) {
  const [section, setSection] = useState<WorkbenchSectionId>('ai-testing');
  const [activeCapabilityId, setActiveCapabilityId] = useState<TesterCapabilityId>(initialCapabilityId);
  const [summary, setSummary] = useState<TesterAIConfigSummary | null>(null);
  const [history, setHistory] = useState<TesterRunHistory | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TesterCapabilityRunResult | null>(null);
  const [checking, setChecking] = useState(false);

  const capability = useMemo(() => getTesterCapability(activeCapabilityId), [activeCapabilityId]);

  const refreshHistory = useCallback(async () => {
    try {
      const next = await loadTesterRunHistory();
      setHistory(next);
      setHistoryError(null);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : String(error || 'History load failed.'));
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const next = await loadTesterAIConfigSummary();
      setSummary(next);
    } catch (error) {
      setSummary({
        runtime: {
          status: 'unavailable',
          mode: 'unknown',
          detail: error instanceof Error ? error.message : String(error || 'Runtime inspection failed.'),
        },
        schedulingOwner: 'runtime',
        providerCatalogSurface: 'runtimeAdmin.listProviderCatalog',
        appLocalProviderDefaults: false,
      });
    }
  }, []);

  useEffect(() => {
    void refreshSummary();
    void refreshHistory();
  }, [refreshSummary, refreshHistory]);

  const handleCapabilityResult = useCallback(
    async (result: TesterCapabilityRunResult, prompt: string) => {
      setLastResult(result);
      try {
        const next = await appendTesterRunHistory({
          id: makeRecordId(),
          capabilityId: result.capabilityId,
          prompt,
          status: result.ok ? 'ready' : 'unavailable',
          message: result.message,
          createdAt: new Date().toISOString(),
        });
        setHistory(next);
        setHistoryError(null);
      } catch (error) {
        setHistoryError(error instanceof Error ? error.message : String(error || 'History persistence failed.'));
      }
    },
    [],
  );

  const handleRunCheck = useCallback(async () => {
    setChecking(true);
    try {
      const inspection = await inspectRuntimeReadiness();
      setSummary({
        runtime: inspection,
        schedulingOwner: 'runtime',
        providerCatalogSurface: 'runtimeAdmin.listProviderCatalog',
        appLocalProviderDefaults: false,
      });
      await refreshHistory();
    } finally {
      setChecking(false);
    }
  }, [refreshHistory]);

  const handleCaptureEvidence = useCallback(() => {
    if (typeof window === 'undefined') return;
    void window.print();
  }, []);

  const handleSelectCapability = useCallback((id: TesterCapabilityId) => {
    setActiveCapabilityId(id);
    if (section !== 'ai-testing') {
      setSection('ai-testing');
    }
  }, [section]);

  return (
    <main className="workbench" data-testid={testerTestIds.root}>
      <WorkbenchSideNav
        activeId={section}
        onSelect={setSection}
        appId={appId}
        appVersion={APP_VERSION}
      />
      <div className="workbench__main">
        <WorkbenchCommandBar
          appId={appId}
          scaffoldProfile={scaffoldProfile}
          runtime={summary?.runtime ?? null}
          busy={checking}
          onRunCheck={handleRunCheck}
          onCaptureEvidence={handleCaptureEvidence}
        />
        <ReadinessBand summary={summary} evidenceCapture="disabled" />
        <div className="workbench__content">
          {section === 'ai-testing' ? (
            <SectionAITesting
              activeId={activeCapabilityId}
              onSelect={handleSelectCapability}
              capability={capability}
              onResult={handleCapabilityResult}
              summary={summary}
              history={history}
              lastResult={lastResult}
              historyError={historyError}
              onOpenKitComponents={() => setSection('kit-components')}
            />
          ) : null}
          {section === 'kit-components' ? <KitComponentGallery /> : null}
          {section === 'runs' ? <SectionRuns history={history} /> : null}
          {section === 'artifacts' ? <SectionArtifacts /> : null}
          {section === 'diagnostics' ? <SectionDiagnostics summary={summary} /> : null}
          {section === 'settings' ? <SectionSettings /> : null}
        </div>
      </div>
    </main>
  );
}
