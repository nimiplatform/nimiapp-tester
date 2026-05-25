import {
  AudioLines,
  Compass,
  Image as ImageIcon,
  Mic,
  MessageSquareText,
  Sparkles,
  TextCursorInput,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge } from '@nimiplatform/kit/ui';
import {
  testerCapabilities,
  type TesterCapability,
  type TesterCapabilityId,
} from '../tester-capabilities.js';

const capabilityIcons: Record<TesterCapabilityId, LucideIcon> = {
  'text.generate': Sparkles,
  'chat.stream': MessageSquareText,
  'text.embed': TextCursorInput,
  'image.generate': ImageIcon,
  'video.generate': Video,
  'audio.synthesize': AudioLines,
  'audio.transcribe': Mic,
  'speech.bundle': AudioLines,
  'world.generate': Compass,
};

const groupLabels: Record<TesterCapability['group'], string> = {
  text: 'Text',
  media: 'Media',
  audio: 'Audio',
  world: 'World',
};

type CapabilityMatrixProps = {
  activeId: TesterCapabilityId;
  onSelect: (id: TesterCapabilityId) => void;
};

function executionTone(execution: TesterCapability['execution']) {
  if (execution === 'runtime-sdk') return 'success' as const;
  if (execution === 'standalone-tauri') return 'info' as const;
  return 'warning' as const;
}

function executionLabel(execution: TesterCapability['execution']) {
  if (execution === 'runtime-sdk') return 'runtime sdk';
  if (execution === 'standalone-tauri') return 'standalone tauri';
  return 'typed unavailable';
}

export function CapabilityMatrix({ activeId, onSelect }: CapabilityMatrixProps) {
  return (
    <div className="capability-matrix" data-testid="nimi-tester-capability-matrix" role="list">
      {testerCapabilities.map((capability) => {
        const Icon = capabilityIcons[capability.id];
        const active = capability.id === activeId;
        return (
          <button
            key={capability.id}
            type="button"
            role="listitem"
            className={active ? 'capability-tile capability-tile--active' : 'capability-tile'}
            onClick={() => onSelect(capability.id)}
            aria-pressed={active}
          >
            <div className="capability-tile__row">
              <span className="capability-tile__icon" aria-hidden="true">
                <Icon size={14} />
              </span>
              <span className="capability-tile__label">{capability.label}</span>
              <StatusBadge tone={executionTone(capability.execution)} shape="dot">
                {executionLabel(capability.execution)}
              </StatusBadge>
            </div>
            <p className="capability-tile__summary">{capability.summary}</p>
            <div className="capability-tile__meta">
              <span>{groupLabels[capability.group]}</span>
              <span>·</span>
              <span>{capability.surface}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
