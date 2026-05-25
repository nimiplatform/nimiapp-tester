import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function listSourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(next);
    return /\.(ts|tsx)$/.test(entry.name) ? [next] : [];
  });
}

test('tester workbench is app-owned and rejects Desktop private imports', () => {
  const sources = listSourceFiles(path.join(root, 'src')).map((filePath) => readFileSync(filePath, 'utf8')).join('\n');
  assert.match(sources, /TesterWorkbench/);
  assert.match(sources, /KitComponentGallery/);
  assert.match(sources, /typed unavailable/i);
  assert.doesNotMatch(sources, /from ['"]@renderer\//);
  assert.doesNotMatch(sources, /from ['"]@runtime\//);
  assert.doesNotMatch(sources, /getDesktopAIConfigService/);
  assert.doesNotMatch(sources, /runtime-config-profile-library/);
  assert.doesNotMatch(sources, /mock.*success/i);
  assert.doesNotMatch(sources, /pseudo/i);
});

test('tester kit gallery covers required component families', () => {
  const gallery = read('src/tester/kit-component-gallery.tsx');
  for (const required of [
    'Button',
    'IconButton',
    'TextField',
    'TextareaField',
    'SelectField',
    'Toggle',
    'NimiTabs',
    'Slider',
    'ProgressIndicator',
    'InlineAlert',
    'Dialog',
    'Popover',
    'ActionMenu',
    'StatusBadge',
    'Surface',
    'ScrollArea',
    'EmptyState',
    'LoadingSkeleton',
  ]) {
    assert.match(gallery, new RegExp(`\\b${required}\\b`));
  }
  assert.match(gallery, /Runtime projection blocked/);
});

test('tester UI Recipes stays scenario-first', () => {
  const gallery = read('src/tester/kit-component-gallery.tsx');
  assert.match(gallery, /const surfaceScenarios: SurfaceScenario\[] = \[/);
  for (const scenario of [
    'AI request panel',
    'Runtime result surface',
    'SDK blocker state',
    'Evidence action row',
    'Settings preference',
    'Artifact gallery',
    'Runtime trace inspector',
  ]) {
    assert.match(gallery, new RegExp(scenario));
  }
  for (const requiredCopy of [
    'Contract & Imports',
    'Composition steps',
    'ready',
    'loading',
    'blocked',
    'unavailable',
    'Open App Lab',
    'Open AI Capabilities',
  ]) {
    assert.match(gallery, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(gallery, /Pick a family, then a recipe/);
  assert.match(gallery, /Surface Scenario Rail/);
  assert.match(gallery, /Recipe Composer \/ Preview/);
});

test('tester Runs page is a capability evidence ledger', () => {
  const sectionRuns = read('src/tester/workbench/section-runs.tsx');
  const historyList = read('src/tester/workbench/runs-history-list.tsx');

  for (const requiredCopy of [
    'Capability run evidence ledger',
    'Review app-owned run records, runtime results, local fixtures, and boundary observations without claiming missing artifacts.',
    'total records',
    'runtime results',
    'typed blockers/unavailable',
    'local fixtures',
    'Capability coverage',
    'Selected record evidence detail',
    'Record source',
    'Runtime result',
    'Artifact',
    'Trace',
    'Boundary',
    'Retention: last 40 per capability',
    'app-owned Tauri storage',
    'Open App Lab',
    'Open AI Capabilities',
  ]) {
    assert.match(sectionRuns, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(sectionRuns, /tester_run_history_load\/save/);
  assert.match(sectionRuns, /World Tour viewer fixture; not a runtime artifact/);
  assert.match(sectionRuns, /not captured; current run record has no trace metadata/);
  assert.match(sectionRuns, /local-fixtures/);
  assert.match(historyList, /getTesterRunStatusLabel/);
  assert.doesNotMatch(sectionRuns, /Run lane/);
  assert.doesNotMatch(sectionRuns, /AI Testing → Run lane/);
});

test('tester Artifacts page is a real artifact inventory', () => {
  const sectionArtifacts = read('src/tester/workbench/section-artifacts.tsx');
  const imageHistory = read('src/tester/tester-image-history.ts');
  const workbench = read('src/tester/tester-workbench.tsx');

  for (const requiredCopy of [
    'Artifact inventory',
    'Inspect real runtime media outputs and local fixture references without creating placeholder artifacts.',
    'total artifacts',
    'runtime media',
    'local fixtures',
    'trace not captured',
    'Artifact source',
    'Linked run',
    'tester_image_history_load/save',
    '$TMPDIR/nimiapp-tester/tester-image-history.json',
    'strict boundary active / no REST bypass',
    'Only real Runtime/SDK artifact records persisted',
    'World Tour local fixture is not runtime artifact',
    'World Tour local fixture lives outside runtime artifact inventory',
    'No placeholder media is created here',
    'Open Runs',
  ]) {
    assert.match(sectionArtifacts, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(imageHistory, /runId\?: string/);
  assert.match(imageHistory, /kind: 'runtime-media'/);
  assert.match(imageHistory, /artifactCount\?: number/);
  assert.match(imageHistory, /traceState\?: 'captured' \| 'not-captured'/);
  assert.match(imageHistory, /records\.slice\(0, 80\)/);
  assert.match(workbench, /result\.output\.kind === 'artifacts'/);
  assert.match(workbench, /result\.output\.artifactCount > 0/);
  assert.match(workbench, /result\.capabilityId !== 'world\.generate'/);
  assert.match(workbench, /appendTesterImageHistoryRecord/);
  assert.doesNotMatch(sectionArtifacts, /fake thumbnail/i);
});

test('tester run history labels local fixtures distinctly from runtime results', () => {
  const history = read('src/tester/tester-history.ts');
  assert.match(history, /if \(status === 'ready'\) return 'runtime ready'/);
  assert.match(history, /if \(status === 'unavailable'\) return 'sdk unavailable'/);
  assert.match(history, /return 'local fixture'/);
  assert.match(history, /status === 'local-fixture'\) return 'info'/);
});

test('tester app-owned Tauri commands are registered in standalone shell', () => {
  const main = read('src-tauri/src/main.rs');
  assert.match(main, /tester_run_history_load/);
  assert.match(main, /tester_image_history_save/);
  assert.match(main, /open_world_tour_window/);
  assert.match(main, /claim_world_tour_viewer_launch/);
});

test('tester scaffold boundary expands beyond the product route', () => {
  const lock = JSON.parse(read('.nimi/app-scaffold/lock.json'));
  assert.ok(lock.managedFileTaxonomy.appOwnedProductCode.includes('src/tester/tester-workbench.tsx'));
  assert.ok(lock.managedFileTaxonomy.appOwnedProductCode.includes('src-tauri/src/tester_storage.rs'));
  assert.ok(lock.managedFileTaxonomy.appOwnedProductCode.includes('test/tester-contract.test.mjs'));
});
