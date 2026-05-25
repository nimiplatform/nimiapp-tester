import { Surface } from '@nimiplatform/kit/ui';
import type { TesterCapability } from '../tester-capabilities.js';
import type { TesterCapabilityRunResult } from '../tester-runtime.js';
import { TextGeneratePanel } from '../panels/text-generate-panel.js';
import { TextEmbedPanel } from '../panels/text-embed-panel.js';
import { ChatPanel } from '../panels/chat-panel.js';
import { ImagePanel } from '../panels/image-panel.js';
import { AudioPanel } from '../panels/audio-panel.js';
import { VideoPanel } from '../panels/video-panel.js';
import { SpeechBundlePanel } from '../panels/speech-bundle-panel.js';
import { WorldTourPanel } from '../panels/world-tour-panel.js';

type CapabilityDetailProps = {
  capability: TesterCapability;
  onResult: (result: TesterCapabilityRunResult, prompt: string) => void | Promise<void>;
};

export function CapabilityDetail({ capability, onResult }: CapabilityDetailProps) {
  const props = { capability, onResult };
  const id = capability.id;
  const panel =
    id === 'text.generate' ? <TextGeneratePanel {...props} />
    : id === 'chat.stream' ? <ChatPanel {...props} />
    : id === 'text.embed' ? <TextEmbedPanel {...props} />
    : id === 'image.generate' ? <ImagePanel {...props} />
    : id === 'video.generate' ? <VideoPanel {...props} />
    : id === 'audio.synthesize' || id === 'audio.transcribe' ? <AudioPanel {...props} />
    : id === 'speech.bundle' ? <SpeechBundlePanel {...props} />
    : <WorldTourPanel {...props} />;

  return (
    <Surface className="capability-detail" material="glass-thin" tone="panel" elevation="base">
      {panel}
    </Surface>
  );
}
