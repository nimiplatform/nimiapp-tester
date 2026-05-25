import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

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

let behaviorBuildDir = null;

function buildBehaviorModules() {
  if (behaviorBuildDir) return behaviorBuildDir;
  mkdirSync(path.join(root, '.tmp'), { recursive: true });
  behaviorBuildDir = mkdtempSync(path.join(root, '.tmp', 'behavior-'));
  execFileSync('pnpm', [
    'exec',
    'tsc',
    '--outDir',
    behaviorBuildDir,
    '--rootDir',
    'src',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--target',
    'ES2022',
    '--jsx',
    'react-jsx',
    '--skipLibCheck',
    'true',
    '--types',
    'node',
    '--noEmit',
    'false',
    'src/tester/tester-runtime-invokers.ts',
    'src/tester/tester-ai-config-store.ts',
  ], {
    cwd: root,
    stdio: 'pipe',
  });
  return behaviorBuildDir;
}

async function importBehaviorModule(relativePath) {
  const buildDir = buildBehaviorModules();
  return import(pathToFileURL(path.join(buildDir, relativePath)).href);
}

test.after(() => {
  if (behaviorBuildDir) {
    rmSync(behaviorBuildDir, { recursive: true, force: true });
  }
});

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
    'legacy/unknown stored record',
    'not captured / unknown from stored record',
    'Open Runs',
  ]) {
    assert.match(sectionArtifacts, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(imageHistory, /runId\?: string/);
  assert.match(imageHistory, /kind\?: 'runtime-media'/);
  assert.match(imageHistory, /artifactCount\?: number/);
  assert.match(imageHistory, /traceState\?: 'captured' \| 'not-captured'/);
  assert.match(imageHistory, /records\.slice\(0, 80\)/);
  assert.match(workbench, /shouldPersistTesterArtifactRecord\(result\)/);
  assert.match(workbench, /appendTesterImageHistoryRecord/);
  assert.doesNotMatch(imageHistory, /kind: record\.kind \|\| 'runtime-media'/);
  assert.doesNotMatch(sectionArtifacts, /artifactCount \|\| 1/);
  assert.doesNotMatch(sectionArtifacts, /fake thumbnail/i);
});

test('tester diagnostics page is a contract and trace inspector', () => {
  const diagnostics = read('src/tester/workbench/section-diagnostics.tsx');
  const workbench = read('src/tester/tester-workbench.tsx');

  for (const requiredCopy of [
    'Contract & trace inspector',
    'Runtime Trace',
    'Boundary Checks',
    'Transport/projection, provider catalog, last trace availability, run/artifact linkage, and storage command provenance.',
    'Import boundaries, SDK admission, no REST bypass, app-owned storage/viewer commands, and fail-closed rules.',
    'trace availability',
    'no trace metadata in persisted records',
    'tester_run_history_load/save',
    'tester_image_history_load/save',
    'World Tour local fixture',
    'no REST bypass',
    'storage commands',
    'SDK Admission Matrix Strip',
    'tauri-only local fixture, not runtime generation',
  ]) {
    assert.match(diagnostics, new RegExp(requiredCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(workbench, /section=\{section\}/);
  assert.match(workbench, /history=\{history\}/);
  assert.match(workbench, /lastResult=\{lastResult\}/);
  assert.doesNotMatch(diagnostics, /mock.*success/i);
  assert.doesNotMatch(diagnostics, /pseudo/i);
});

test('tester run history labels local fixtures distinctly from runtime results', () => {
  const history = read('src/tester/tester-history.ts');
  assert.match(history, /if \(status === 'ready'\) return 'runtime ready'/);
  assert.match(history, /if \(status === 'unavailable'\) return 'sdk unavailable'/);
  assert.match(history, /return 'local fixture'/);
  assert.match(history, /status === 'local-fixture'\) return 'info'/);
});

test('tester App Lab imports and applies real SDK AIProfiles through Kit AIConfig', () => {
  const store = read('src/tester/tester-ai-config-store.ts');
  const panel = read('src/tester/workbench/app-lab-ai-config-panel.tsx');

  for (const required of [
    'AIProfile',
    'AIConfig',
    'createAppAIScopeRef',
    'createEmptyAIConfig',
    'validateAIProfile',
    'applyAIProfileToConfig',
    'computeAIConfigDiff',
    'computeAIConfigVersion',
    'importTesterAIProfileJson',
    'TESTER_AI_PROFILE_LIBRARY_STORAGE_KEY',
    'previewApply',
    'apply(scopeRef',
    'saveTesterAIConfig',
  ]) {
    assert.match(store, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const required of [
    'ModelConfigAiModelHub',
    'useModelConfigProfileController',
    'defaultModelConfigProfileCopy',
    'Import AIProfile JSON',
    'createTesterRuntimeModelPickerProvider',
    "runtime.status !== 'ready'",
  ]) {
    assert.match(panel, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('tester LLM invokers consume AIConfig bindings and fail closed without binding', () => {
  const invokers = read('src/tester/tester-runtime-invokers.ts');
  const unavailable = read('src/tester/tester-unavailable.ts');
  const llmInvokers = invokers.slice(
    invokers.indexOf('async function invokeTextGenerate'),
    invokers.indexOf('function summariseArtifact'),
  );

  assert.doesNotMatch(llmInvokers, /model:\s*['"]auto['"]/);
  assert.match(unavailable, /ai-config-binding-missing/);
  assert.match(invokers, /resolveTesterLLMBinding/);
  assert.match(invokers, /text\.generate' \|\| capabilityId === 'chat\.stream'/);
  assert.match(invokers, /capabilityId === 'text\.embed'/);
  assert.match(invokers, /Runtime invocation failed closed before request dispatch/);
  assert.match(invokers, /routeInput/);
  assert.match(invokers, /connectorId: connectorId \|\| undefined/);
  assert.match(invokers, /route: binding\.source === 'cloud' \? 'cloud' : 'local'/);
  assert.match(invokers, /aiConfigScopeKind/);
  assert.match(invokers, /aiConfigProfileId/);
  assert.match(invokers, /aiConfigBindingCapabilityId/);
  assert.match(invokers, /aiConfigBindingModel/);
  assert.match(invokers, /aiConfigHash/);
});

test('tester LLM binding resolver fails closed for missing and malformed bindings', async () => {
  const invokers = await importBehaviorModule('tester/tester-runtime-invokers.js');
  const store = await importBehaviorModule('tester/tester-ai-config-store.js');
  const scopeRef = store.createTesterAppLabAIScopeRef();

  const missing = invokers.resolveTesterLLMBinding('text.generate', {
    scopeRef,
    capabilities: { selectedBindings: {}, localProfileRefs: {}, selectedParams: {} },
    profileOrigin: null,
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, 'ai-config-binding-missing');

  const malformedProfile = store.importTesterAIProfileJson(JSON.stringify({
    profileId: 'malformed',
    title: 'Malformed',
    description: '',
    tags: [],
    capabilities: {
      'text.generate': {
        binding: {
          source: 'remote',
          connectorId: 42,
          model: '',
        },
      },
    },
  }));
  assert.equal(malformedProfile.ok, false);
  assert.match(malformedProfile.message, /binding validation failed/i);

  assert.throws(() => store.saveTesterAIConfig({
    scopeRef,
    capabilities: {
      selectedBindings: {
        'text.generate': {
          source: 'remote',
          connectorId: '',
          model: 'bad',
        },
      },
      localProfileRefs: {},
      selectedParams: {},
    },
    profileOrigin: null,
  }), /AIConfig binding validation failed/);
});

test('tester LLM invoker dispatches configured AIConfig route payload', async () => {
  const invokers = await importBehaviorModule('tester/tester-runtime-invokers.js');
  const store = await importBehaviorModule('tester/tester-ai-config-store.js');
  const scopeRef = store.createTesterAppLabAIScopeRef();
  store.saveTesterAIConfig({
    scopeRef,
    capabilities: {
      selectedBindings: {
        'text.generate': {
          source: 'cloud',
          connectorId: 'runtime-connector',
          model: 'runtime-model',
          modelLabel: 'Runtime Model',
        },
        'text.embed': {
          source: 'local',
          connectorId: '',
          model: 'embedding-model',
        },
      },
      localProfileRefs: {},
      selectedParams: {},
    },
    profileOrigin: {
      profileId: 'behavior-profile',
      title: 'Behavior Profile',
      appliedAt: '2026-05-26T00:00:00.000Z',
    },
  });

  const captured = [];
  const client = {
    runtime: {
      ai: {
        text: {
          async generate(input) {
            captured.push({ surface: 'generate', input });
            return {
              text: 'ok',
              finishReason: 'stop',
              usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
              trace: { traceId: 'trace-1', modelResolved: input.model, routeDecision: input.route },
            };
          },
          async stream(input) {
            captured.push({ surface: 'stream', input });
            return {
              stream: (async function* stream() {
                yield { type: 'delta', text: 'o' };
                yield {
                  type: 'finish',
                  finishReason: 'stop',
                  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
                  trace: { traceId: 'trace-2', modelResolved: input.model, routeDecision: input.route },
                };
              })(),
            };
          },
        },
        embedding: {
          async generate(input) {
            captured.push({ surface: 'embed', input });
            return {
              vectors: [[0.1, 0.2]],
              usage: { totalTokens: 1 },
              trace: { traceId: 'trace-3', modelResolved: input.model, routeDecision: input.route },
            };
          },
        },
      },
    },
  };

  const textResult = await invokers.invokeTesterCapability(client, 'text.generate', {
    prompt: 'Hello runtime',
    scenarioId: 'behavior',
  });
  assert.equal(textResult.ok, true);

  const streamResult = await invokers.invokeTesterCapability(client, 'chat.stream', {
    prompt: 'Hello stream',
    scenarioId: 'behavior',
  });
  assert.equal(streamResult.ok, true);

  const embedResult = await invokers.invokeTesterCapability(client, 'text.embed', {
    prompt: 'Hello embed',
    scenarioId: 'behavior',
  });
  assert.equal(embedResult.ok, true);

  assert.deepEqual(captured.map((entry) => entry.surface), ['generate', 'stream', 'embed']);
  assert.equal(captured[0].input.model, 'runtime-model');
  assert.equal(captured[0].input.connectorId, 'runtime-connector');
  assert.equal(captured[0].input.route, 'cloud');
  assert.equal(captured[0].input.metadata.aiConfigProfileId, 'behavior-profile');
  assert.equal(captured[0].input.metadata.aiConfigBindingCapabilityId, 'text.generate');
  assert.equal(captured[1].input.model, 'runtime-model');
  assert.equal(captured[1].input.connectorId, 'runtime-connector');
  assert.equal(captured[1].input.route, 'cloud');
  assert.equal(captured[2].input.model, 'embedding-model');
  assert.equal(captured[2].input.connectorId, undefined);
  assert.equal(captured[2].input.route, 'local');
  assert.equal(captured[2].input.metadata.aiConfigBindingCapabilityId, 'text.embed');
});

test('tester model picker catalog uses runtimeAdmin connector surfaces only', () => {
  const provider = read('src/tester/tester-runtime-model-provider.ts');
  const summary = read('src/tester/tester-ai-config.ts');

  assert.match(provider, /runtimeAdmin\.listConnectors/);
  assert.match(provider, /runtimeAdmin\.listConnectorModels/);
  assert.match(provider, /requireRuntimeClient/);
  assert.match(provider, /model catalog failed closed/);
  assert.doesNotMatch(provider, /openai|anthropic|gemini|gpt-4|claude|mock.*success/i);
  assert.match(summary, /runtimeAdmin\.listConnectors\/listConnectorModels/);
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
