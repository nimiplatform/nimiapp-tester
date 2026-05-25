import { ArrowRight, Boxes, Layers, MousePointerClick, PanelsTopLeft, ToggleLeft, type LucideIcon } from 'lucide-react';
import { Button, StatusBadge, Surface } from '@nimiplatform/kit/ui';

type KitFamily = {
  id: string;
  label: string;
  icon: LucideIcon;
  primitives: string[];
};

const families: KitFamily[] = [
  { id: 'actions', label: 'Actions', icon: MousePointerClick, primitives: ['Button', 'IconButton', 'ActionMenu'] },
  { id: 'inputs', label: 'Inputs', icon: Layers, primitives: ['TextField', 'TextareaField', 'SelectField', 'FieldShell'] },
  { id: 'toggles', label: 'Toggles', icon: ToggleLeft, primitives: ['Toggle', 'Checkbox', 'Slider', 'SegmentedControl', 'NimiTabs'] },
  { id: 'overlays', label: 'Overlays', icon: Boxes, primitives: ['Dialog', 'Popover', 'ActionMenu surface'] },
  { id: 'surfaces', label: 'Surfaces', icon: PanelsTopLeft, primitives: ['Surface materials', 'ScrollArea', 'Dense rows'] },
];

type KitSystemSummaryProps = {
  onOpen: () => void;
};

export function KitSystemSummary({ onOpen }: KitSystemSummaryProps) {
  const total = families.reduce((sum, family) => sum + family.primitives.length, 0);
  return (
    <Surface className="kit-summary" material="glass-thin" tone="card" elevation="base" data-testid="nimi-tester-kit-summary">
      <header className="kit-summary__head">
        <div>
          <p className="eyebrow">Nimi Kit Component System</p>
          <h3>Reviewed primitives for third-party apps</h3>
        </div>
        <StatusBadge tone="info" shape="dot">{total} primitives</StatusBadge>
      </header>
      <p className="kit-summary__copy">
        Every interaction in this workbench is composed from <code>@nimiplatform/kit/ui</code>. Use the recipe browser to copy
        admission-safe patterns into your own Nimi App without recreating shells.
      </p>
      <ul className="kit-summary__families">
        {families.map((family) => {
          const Icon = family.icon;
          return (
            <li key={family.id} className="kit-summary__family">
              <span className="kit-summary__family-icon" aria-hidden="true">
                <Icon size={13} />
              </span>
              <span className="kit-summary__family-text">
                <strong>{family.label}</strong>
                <span>{family.primitives.join(' · ')}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <Button type="button" tone="secondary" size="sm" onClick={onOpen} trailingIcon={<ArrowRight size={13} />}>
        Open recipe browser
      </Button>
    </Surface>
  );
}
