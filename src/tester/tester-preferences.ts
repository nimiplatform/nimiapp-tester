export const TESTER_PREFERENCES_STORAGE_KEY = 'nimiapp-tester:workbench-preferences:v1';
export const TESTER_PREFERENCES_SCHEMA_VERSION = 1;

export type TesterEvidenceCaptureMode = 'manual' | 'after-run';

export type TesterPreferences = {
  schemaVersion: typeof TESTER_PREFERENCES_SCHEMA_VERSION;
  draftPersistence: boolean;
  verboseConsole: boolean;
  evidenceCaptureMode: TesterEvidenceCaptureMode;
};

export type TesterPreferenceStoreState =
  | 'ready'
  | 'defaulted'
  | 'corrupt'
  | 'unavailable'
  | 'write-error'
  | 'reset';

export type TesterPreferenceStoreStatus = {
  state: TesterPreferenceStoreState;
  storageKey: typeof TESTER_PREFERENCES_STORAGE_KEY;
  message: string;
  error?: string;
};

type PreferenceLoadResult = {
  preferences: TesterPreferences;
  status: TesterPreferenceStoreStatus;
};

function defaultStatus(state: TesterPreferenceStoreState, message: string, error?: string): TesterPreferenceStoreStatus {
  return {
    state,
    storageKey: TESTER_PREFERENCES_STORAGE_KEY,
    message,
    error,
  };
}

export function defaultTesterPreferences(): TesterPreferences {
  return {
    schemaVersion: TESTER_PREFERENCES_SCHEMA_VERSION,
    draftPersistence: true,
    verboseConsole: false,
    evidenceCaptureMode: 'manual',
  };
}

function storageUnavailableResult(error?: string): PreferenceLoadResult {
  return {
    preferences: defaultTesterPreferences(),
    status: defaultStatus(
      'unavailable',
      'Local preference storage is unavailable; defaults are active and controls are read-only.',
      error,
    ),
  };
}

function getLocalPreferenceStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

function isEvidenceCaptureMode(value: unknown): value is TesterEvidenceCaptureMode {
  return value === 'manual' || value === 'after-run';
}

function parseTesterPreferences(raw: string): TesterPreferences {
  const parsed = JSON.parse(raw) as Partial<TesterPreferences>;
  if (
    parsed.schemaVersion !== TESTER_PREFERENCES_SCHEMA_VERSION
    || typeof parsed.draftPersistence !== 'boolean'
    || typeof parsed.verboseConsole !== 'boolean'
    || !isEvidenceCaptureMode(parsed.evidenceCaptureMode)
  ) {
    throw new Error('Stored preference schema is invalid.');
  }
  return {
    schemaVersion: TESTER_PREFERENCES_SCHEMA_VERSION,
    draftPersistence: parsed.draftPersistence,
    verboseConsole: parsed.verboseConsole,
    evidenceCaptureMode: parsed.evidenceCaptureMode,
  };
}

export function loadTesterPreferences(storage: Storage | null = getLocalPreferenceStorage()): PreferenceLoadResult {
  if (!storage) return storageUnavailableResult();

  try {
    const raw = storage.getItem(TESTER_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return {
        preferences: defaultTesterPreferences(),
        status: defaultStatus('defaulted', 'No saved preferences found; defaults are active.'),
      };
    }
    return {
      preferences: parseTesterPreferences(raw),
      status: defaultStatus('ready', 'Local preference store loaded.'),
    };
  } catch (error) {
    return {
      preferences: defaultTesterPreferences(),
      status: defaultStatus(
        'corrupt',
        'Saved preferences could not be trusted; defaults are active until a valid write succeeds.',
        error instanceof Error ? error.message : String(error || 'Unknown preference load error.'),
      ),
    };
  }
}

export function saveTesterPreferences(
  preferences: TesterPreferences,
  storage: Storage | null = getLocalPreferenceStorage(),
): PreferenceLoadResult {
  if (!storage) return storageUnavailableResult();

  const normalized: TesterPreferences = {
    schemaVersion: TESTER_PREFERENCES_SCHEMA_VERSION,
    draftPersistence: Boolean(preferences.draftPersistence),
    verboseConsole: Boolean(preferences.verboseConsole),
    evidenceCaptureMode: isEvidenceCaptureMode(preferences.evidenceCaptureMode)
      ? preferences.evidenceCaptureMode
      : 'manual',
  };

  try {
    storage.setItem(TESTER_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
    return {
      preferences: normalized,
      status: defaultStatus('ready', 'Local preference store saved.'),
    };
  } catch (error) {
    return {
      preferences: defaultTesterPreferences(),
      status: defaultStatus(
        'write-error',
        'Preference write failed; defaults are active until storage accepts a valid write.',
        error instanceof Error ? error.message : String(error || 'Unknown preference write error.'),
      ),
    };
  }
}

export function resetTesterPreferences(storage: Storage | null = getLocalPreferenceStorage()): PreferenceLoadResult {
  if (!storage) return storageUnavailableResult();

  try {
    storage.removeItem(TESTER_PREFERENCES_STORAGE_KEY);
    return {
      preferences: defaultTesterPreferences(),
      status: defaultStatus('reset', 'Local preferences reset. Run and artifact evidence was not changed.'),
    };
  } catch (error) {
    return {
      preferences: defaultTesterPreferences(),
      status: defaultStatus(
        'write-error',
        'Preference reset failed; run and artifact evidence was not changed.',
        error instanceof Error ? error.message : String(error || 'Unknown preference reset error.'),
      ),
    };
  }
}
