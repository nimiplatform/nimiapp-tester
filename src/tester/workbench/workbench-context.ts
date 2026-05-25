export type WorkbenchSectionId =
  | 'ai-testing'
  | 'kit-components'
  | 'runs'
  | 'artifacts'
  | 'diagnostics'
  | 'settings';

export type WorkbenchSection = {
  id: WorkbenchSectionId;
  label: string;
  group: 'workbench' | 'evidence' | 'app';
  description: string;
};

export const workbenchSections: WorkbenchSection[] = [
  {
    id: 'ai-testing',
    label: 'AI Testing',
    group: 'workbench',
    description: 'Runtime capability cockpit and request lanes.',
  },
  {
    id: 'kit-components',
    label: 'Kit Components',
    group: 'workbench',
    description: 'Reviewed Nimi Kit primitives for third-party apps.',
  },
  {
    id: 'runs',
    label: 'Runs',
    group: 'evidence',
    description: 'Persisted capability run history.',
  },
  {
    id: 'artifacts',
    label: 'Artifacts',
    group: 'evidence',
    description: 'Image, audio, and world artifacts captured by lanes.',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    group: 'evidence',
    description: 'Runtime projection, scheduling owner, provider catalog.',
  },
  {
    id: 'settings',
    label: 'Settings',
    group: 'app',
    description: 'Local drafts, evidence capture, developer toggles.',
  },
];
