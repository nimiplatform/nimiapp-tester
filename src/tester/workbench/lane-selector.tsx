import {
  AudioLines,
  Compass,
  Image as ImageIcon,
  MessageSquareText,
  Mic,
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

const laneIcons: Record<TesterCapabilityId, LucideIcon> = {
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

const laneGroupOrder: Array<TesterCapability['group']> = ['text', 'media', 'audio', 'world'];
const laneGroupLabels: Record<TesterCapability['group'], string> = {
  text: 'Text & chat',
  media: 'Media',
  audio: 'Audio',
  world: 'World',
};

type LaneSelectorProps = {
  activeId: TesterCapabilityId;
  onSelect: (id: TesterCapabilityId) => void;
};

function executionTone(execution: TesterCapability['execution']) {
  if (execution === 'runtime-sdk') return 'success' as const;
  if (execution === 'standalone-tauri') return 'info' as const;
  return 'warning' as const;
}

function executionLabel(execution: TesterCapability['execution']) {
  if (execution === 'runtime-sdk') return 'admitted';
  if (execution === 'standalone-tauri') return 'tauri';
  return 'sdk gap';
}

export function LaneSelector({ activeId, onSelect }: LaneSelectorProps) {
  const byGroup = laneGroupOrder
    .map((group) => ({
      group,
      lanes: testerCapabilities.filter((lane) => lane.group === group),
    }))
    .filter((bucket) => bucket.lanes.length > 0);

  return (
    <nav className="lane-selector" aria-label="Capability lanes" data-testid="nimi-tester-lane-selector">
      {byGroup.map((bucket) => (
        <div key={bucket.group} className="lane-selector__group">
          <p className="lane-selector__group-title">{laneGroupLabels[bucket.group]}</p>
          <ul>
            {bucket.lanes.map((lane) => {
              const Icon = laneIcons[lane.id];
              const active = lane.id === activeId;
              return (
                <li key={lane.id}>
                  <button
                    type="button"
                    className={active ? 'lane-selector__item lane-selector__item--active' : 'lane-selector__item'}
                    onClick={() => onSelect(lane.id)}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="lane-selector__icon" aria-hidden="true">
                      <Icon size={13} />
                    </span>
                    <span className="lane-selector__label" title={lane.label}>{lane.label}</span>
                    <StatusBadge tone={executionTone(lane.execution)} shape="dot">
                      {executionLabel(lane.execution)}
                    </StatusBadge>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
