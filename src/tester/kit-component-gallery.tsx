import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Bell,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Copy,
  Cpu,
  FormInput,
  GalleryHorizontalEnd,
  Layers,
  MessageSquare,
  MoreHorizontal,
  MousePointerClick,
  PanelsTopLeft,
  PencilRuler,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  ToggleLeft,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  ActionMenu,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FieldShell,
  IconButton,
  InlineAlert,
  LoadingSkeleton,
  NimiTabs,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ProgressIndicator,
  ScrollArea,
  SegmentedControl,
  SelectField,
  Slider,
  StatusBadge,
  Surface,
  TextareaField,
  TextField,
  Toggle,
} from '@nimiplatform/kit/ui';

type GalleryCategoryId = 'actions' | 'inputs' | 'toggles' | 'status' | 'overlays' | 'surfaces' | 'states';

type GalleryCategory = {
  id: GalleryCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  count: number;
};

const galleryCategories: GalleryCategory[] = [
  { id: 'actions', label: 'Actions', description: 'Buttons, icon buttons, action menu.', icon: MousePointerClick, count: 4 },
  { id: 'inputs', label: 'Inputs', description: 'Text, textarea, select, field shell.', icon: FormInput, count: 4 },
  { id: 'toggles', label: 'Toggles & selection', description: 'Toggle, checkbox, slider, segmented, tabs.', icon: ToggleLeft, count: 5 },
  { id: 'status', label: 'Status & progress', description: 'Badges, alerts, progress, inline messages.', icon: BadgeCheck, count: 4 },
  { id: 'overlays', label: 'Overlays', description: 'Dialog, popover, menu surfaces.', icon: Layers, count: 3 },
  { id: 'surfaces', label: 'Surfaces', description: 'Glass materials, scroll, dense rows.', icon: PanelsTopLeft, count: 3 },
  { id: 'states', label: 'Empty & loading', description: 'Empty, loading skeleton, error states.', icon: AlertCircle, count: 3 },
];

type GalleryItemProps = {
  name: string;
  anatomy: string[];
  notes?: string;
  children: ReactNode;
};

function GalleryItem({ name, anatomy, notes, children }: GalleryItemProps) {
  return (
    <article className="gallery-item">
      <header className="gallery-item__head">
        <div className="gallery-item__title">
          <h4>{name}</h4>
          <span>kit public surface</span>
        </div>
        <ul className="gallery-item__anatomy" aria-label={`${name} anatomy`}>
          {anatomy.map((token) => <li key={token}>{token}</li>)}
        </ul>
      </header>
      <div className="gallery-item__canvas">{children}</div>
      {notes ? <p className="gallery-item__notes">{notes}</p> : null}
    </article>
  );
}

const densityModes = [
  { value: 'review', label: 'Review', icon: <ClipboardCheck size={13} /> },
  { value: 'author', label: 'Author', icon: <Code2 size={13} /> },
  { value: 'runtime', label: 'Runtime', icon: <Cpu size={13} /> },
];

function ActionsGroup() {
  return (
    <>
      <GalleryItem name="Button" anatomy={['primary', 'secondary', 'ghost', 'danger', 'loading']}>
        <div className="gallery-cluster">
          <Button tone="primary" leadingIcon={<Play size={14} />}>Run route</Button>
          <Button tone="secondary" leadingIcon={<RefreshCw size={14} />}>Refresh</Button>
          <Button tone="ghost" leadingIcon={<Copy size={14} />}>Copy trace</Button>
          <Button tone="danger" leadingIcon={<X size={14} />}>Stop</Button>
          <Button loading>Checking</Button>
        </div>
      </GalleryItem>
      <GalleryItem name="IconButton" anatomy={['ghost', 'primary', 'secondary', 'sm']}>
        <div className="gallery-cluster">
          <IconButton aria-label="Search routes" icon={<Search size={14} />} />
          <IconButton aria-label="Open settings" icon={<Settings size={14} />} />
          <IconButton aria-label="Add workflow" tone="primary" icon={<Plus size={14} />} />
          <IconButton aria-label="More actions" tone="secondary" icon={<MoreHorizontal size={14} />} />
        </div>
      </GalleryItem>
      <GalleryItem name="ActionMenu" anatomy={['default', 'danger', 'icon prefix']} notes="Menu items remain keyboard reachable and emit typed onSelect callbacks.">
        <ActionMenu
          ariaLabel="Gallery actions"
          items={[
            { id: 'copy', label: 'Copy request trace', icon: <Copy size={13} /> },
            { id: 'rerun', label: 'Run again', icon: <RefreshCw size={13} /> },
            { id: 'stop', label: 'Stop route', icon: <X size={13} />, tone: 'danger' },
          ]}
        />
      </GalleryItem>
    </>
  );
}

function InputsGroup() {
  return (
    <>
      <GalleryItem name="TextField" anatomy={['leading icon', 'placeholder', 'readonly']}>
        <FieldShell label="Route name" description="Stored as app-owned draft data.">
          <TextField defaultValue="Runtime readiness route" leading={<TerminalSquare size={14} />} />
        </FieldShell>
      </GalleryItem>
      <GalleryItem name="TextareaField" anatomy={['multiline', 'rows=4', 'autosize']}>
        <FieldShell label="Request body">
          <TextareaField
            rows={4}
            defaultValue="Validate the active Nimi App runtime route without app-local provider defaults."
          />
        </FieldShell>
      </GalleryItem>
      <GalleryItem name="SelectField" anatomy={['options', 'aria-label', 'controlled']}>
        <FieldShell label="Capability route">
          <SelectField
            defaultValue="text.generate"
            options={[
              { value: 'text.generate', label: 'Text generation' },
              { value: 'chat.stream', label: 'Chat stream' },
              { value: 'image.generate', label: 'Image generation' },
              { value: 'world.generate', label: 'World tour' },
            ]}
            aria-label="Capability route"
          />
        </FieldShell>
      </GalleryItem>
      <GalleryItem name="FieldShell" anatomy={['label', 'description', 'slot composition']}>
        <FieldShell
          label="Session token"
          description="Field shell composes any input control with consistent rhythm and a11y labels."
        >
          <TextField defaultValue="developer-local-device" />
        </FieldShell>
      </GalleryItem>
    </>
  );
}

function TogglesGroup() {
  const [trace, setTrace] = useState(true);
  const [guardrails, setGuardrails] = useState(true);
  const [batch, setBatch] = useState(62);
  const [density, setDensity] = useState('review');
  const [tab, setTab] = useState('request');
  return (
    <>
      <GalleryItem name="Toggle" anatomy={['switch', 'controlled', 'aria-label inherited']}>
        <div className="gallery-form-row">
          <span>Trace Runtime calls</span>
          <Toggle checked={trace} onChange={setTrace} />
        </div>
      </GalleryItem>
      <GalleryItem name="Checkbox" anatomy={['label', 'checked', 'onChange event']}>
        <Checkbox
          checked={guardrails}
          onChange={(event) => setGuardrails(event.currentTarget.checked)}
          label="Fail closed on missing SDK surface"
        />
      </GalleryItem>
      <GalleryItem name="Slider" anatomy={['min/max', 'showValue', 'aria-label']}>
        <Slider
          min={1}
          max={100}
          value={batch}
          onChange={(event) => setBatch(Number(event.currentTarget.value))}
          showValue
          aria-label="Batch size"
        />
      </GalleryItem>
      <GalleryItem name="SegmentedControl" anatomy={['items', 'icon', 'size=sm']}>
        <SegmentedControl items={densityModes} value={density} onValueChange={setDensity} ariaLabel="Density" size="sm" />
      </GalleryItem>
      <GalleryItem name="NimiTabs" anatomy={['items', 'controlled value', 'disabled tab']}>
        <NimiTabs
          items={[
            { value: 'request', label: 'Request' },
            { value: 'diagnostics', label: 'Diagnostics' },
            { value: 'artifacts', label: 'Artifacts', disabled: true },
          ]}
          value={tab}
          onValueChange={setTab}
          ariaLabel="Tabs"
        />
      </GalleryItem>
    </>
  );
}

function StatusGroup() {
  return (
    <>
      <GalleryItem name="StatusBadge" anatomy={['success', 'warning', 'danger', 'info']}>
        <div className="gallery-cluster">
          <StatusBadge tone="success" shape="dot">session ready</StatusBadge>
          <StatusBadge tone="warning" shape="dot">sdk gap</StatusBadge>
          <StatusBadge tone="danger" shape="outline">blocked</StatusBadge>
          <StatusBadge tone="info">developer</StatusBadge>
        </div>
      </GalleryItem>
      <GalleryItem name="ProgressIndicator" anatomy={['value 0-100', 'showValue', 'inline']}>
        <ProgressIndicator value={72} showValue />
      </GalleryItem>
      <GalleryItem name="InlineAlert" anatomy={['info', 'warning', 'icon slot']}>
        <InlineAlert tone="info" icon={<Bell size={14} />}>
          <div className="runtime-alert-copy">
            <strong>Runtime-bound surface</strong>
            <span>Execution proof comes from SDK calls or typed unavailable states.</span>
          </div>
        </InlineAlert>
        <InlineAlert tone="warning" icon={<AlertTriangle size={14} />}>
          <div className="runtime-alert-copy">
            <strong>Missing admitted SDK method</strong>
            <span>The workflow can render controls, but cannot claim execution readiness.</span>
          </div>
        </InlineAlert>
      </GalleryItem>
      <GalleryItem name="Badge cluster" anatomy={['dot shape', 'outline shape', 'composition']}>
        <div className="gallery-cluster">
          <StatusBadge tone="neutral" shape="dot">queued</StatusBadge>
          <StatusBadge tone="info" shape="dot">streaming</StatusBadge>
          <StatusBadge tone="success" shape="outline">complete</StatusBadge>
        </div>
      </GalleryItem>
    </>
  );
}

function OverlaysGroup() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <GalleryItem name="Dialog" anatomy={['header', 'body', 'footer', 'controlled open']}>
        <Button tone="primary" leadingIcon={<GalleryHorizontalEnd size={14} />} onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onClose={() => setDialogOpen(false)} dataTestId="nimi-tester-gallery-dialog">
            <DialogHeader>
              <DialogTitle>Runtime admission check</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="gallery-dialog-copy">This dialog is rendered by kit primitives and does not bypass Runtime or SDK admission.</p>
            </DialogBody>
            <DialogFooter className="gallery-dialog-footer">
              <Button tone="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button tone="primary" onClick={() => setDialogOpen(false)}>Acknowledge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GalleryItem>
      <GalleryItem name="Popover" anatomy={['trigger', 'content', 'asChild composition']}>
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="secondary" trailingIcon={<ChevronDown size={14} />}>Route details</Button>
          </PopoverTrigger>
          <PopoverContent className="gallery-popover">
            <strong>Runtime route contract</strong>
            <span>Capability, prompt, diagnostics, and typed unavailable state travel together.</span>
          </PopoverContent>
        </Popover>
      </GalleryItem>
      <GalleryItem name="Menu surface" anatomy={['action menu', 'badge', 'icon trigger']}>
        <Surface className="gallery-menu-preview" material="glass-thin" tone="panel">
          <div className="gallery-menu-preview__top">
            <StatusBadge tone="neutral">route tools</StatusBadge>
            <IconButton aria-label="Open menu" icon={<MoreHorizontal size={14} />} />
          </div>
          <ActionMenu
            ariaLabel="Route tools"
            items={[
              { id: 'inspect', label: 'Inspect payload', icon: <Search size={13} /> },
              { id: 'settings', label: 'Open settings', icon: <Settings size={13} /> },
              { id: 'clear', label: 'Clear draft', icon: <X size={13} />, tone: 'danger' },
            ]}
          />
        </Surface>
      </GalleryItem>
    </>
  );
}

function SurfacesGroup() {
  const rows = Array.from({ length: 9 }, (_, index) => ({
    id: `trace-${index + 1}`,
    label: `Trace ${index + 1}`,
    status: index % 3 === 0 ? 'typed unavailable' : index % 3 === 1 ? 'queued' : 'ready',
  }));
  return (
    <>
      <GalleryItem name="Surface" anatomy={['glass-thin', 'glass-regular', 'glass-thick overlay']}>
        <div className="gallery-surface-row">
          <Surface material="glass-thin" tone="card" className="gallery-mini-surface">
            <Sparkles size={16} />
            <strong>Thin glass</strong>
          </Surface>
          <Surface material="glass-regular" tone="panel" className="gallery-mini-surface">
            <BadgeCheck size={16} />
            <strong>Regular</strong>
          </Surface>
          <Surface material="glass-thick" tone="overlay" elevation="floating" className="gallery-mini-surface">
            <SlidersHorizontal size={16} />
            <strong>Overlay</strong>
          </Surface>
        </div>
      </GalleryItem>
      <GalleryItem name="ScrollArea" anatomy={['viewport', 'sticky size', 'dense rows']}>
        <ScrollArea className="gallery-scroll-area" viewportClassName="gallery-scroll-area__viewport" contentClassName="gallery-scroll-list">
          {rows.map((row) => (
            <div key={row.id} className="gallery-scroll-row">
              <MessageSquare size={13} />
              <span>{row.label}</span>
              <StatusBadge tone={row.status === 'ready' ? 'success' : row.status === 'queued' ? 'info' : 'warning'}>{row.status}</StatusBadge>
            </div>
          ))}
        </ScrollArea>
      </GalleryItem>
      <GalleryItem name="Dense card" anatomy={['heading', 'metric row', 'inline action']}>
        <Surface material="glass-thin" tone="card" className="gallery-mini-card">
          <div>
            <p className="eyebrow">Active sessions</p>
            <strong>3 routes ready</strong>
          </div>
          <PencilRuler size={16} />
        </Surface>
      </GalleryItem>
    </>
  );
}

function StatesGroup() {
  return (
    <>
      <GalleryItem name="EmptyState" anatomy={['icon', 'title', 'description', 'optional action']}>
        <EmptyState
          icon={<Boxes size={18} />}
          title="No captured artifacts"
          description="Run a real capability or resolve a typed blocker before this list fills."
          action={<Button size="sm" tone="secondary" leadingIcon={<RefreshCw size={13} />}>Refresh</Button>}
        />
      </GalleryItem>
      <GalleryItem name="LoadingSkeleton" anatomy={['lines', 'shimmer', 'rhythm match']}>
        <LoadingSkeleton lines={4} />
      </GalleryItem>
      <GalleryItem name="Error state" anatomy={['icon', 'title', 'reason']} notes="Built from kit primitives; surfaces typed reasons instead of swallowing failures.">
        <Surface className="gallery-error-state" material="glass-thin" tone="card">
          <AlertTriangle size={16} />
          <div>
            <strong>Runtime projection blocked</strong>
            <span>Third-party session projection is not exposed by this SDK/runtime pair.</span>
          </div>
        </Surface>
      </GalleryItem>
    </>
  );
}

const categoryGroups: Record<GalleryCategoryId, () => ReactNode> = {
  actions: ActionsGroup,
  inputs: InputsGroup,
  toggles: TogglesGroup,
  status: StatusGroup,
  overlays: OverlaysGroup,
  surfaces: SurfacesGroup,
  states: StatesGroup,
};

export function KitComponentGallery() {
  const [category, setCategory] = useState<GalleryCategoryId>('actions');
  const totalCount = useMemo(() => galleryCategories.reduce((sum, item) => sum + item.count, 0), []);
  const active = galleryCategories.find((item) => item.id === category) ?? galleryCategories[0];
  const Renderer = categoryGroups[active.id];

  return (
    <section className="kit-gallery" data-testid="nimi-tester-kit-gallery">
      <header className="section-header">
        <div>
          <p className="eyebrow">Kit Components</p>
          <h2>Component & workflow primitives</h2>
          <p>Every control on this page is imported from reviewed Nimi Kit public surfaces and composed inside app-owned routes.</p>
        </div>
        <div className="kit-gallery__chips">
          <StatusBadge tone="info" shape="dot">kit public surface</StatusBadge>
          <StatusBadge tone="neutral">{totalCount} primitives</StatusBadge>
        </div>
      </header>
      <div className="kit-gallery__layout">
        <nav className="kit-gallery__rail" aria-label="Component categories">
          {galleryCategories.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                className={isActive ? 'kit-gallery__rail-item kit-gallery__rail-item--active' : 'kit-gallery__rail-item'}
                onClick={() => setCategory(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="kit-gallery__rail-icon" aria-hidden="true">
                  <Icon size={14} />
                </span>
                <span className="kit-gallery__rail-text">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
                <span className="kit-gallery__rail-count">{item.count}</span>
              </button>
            );
          })}
        </nav>
        <div className="kit-gallery__canvas">
          <header className="kit-gallery__canvas-head">
            <div>
              <p className="eyebrow">{active.label}</p>
              <h3>{active.description}</h3>
            </div>
            <StatusBadge tone="neutral">{active.count} components</StatusBadge>
          </header>
          <div className="kit-gallery__items">
            <Renderer />
          </div>
        </div>
      </div>
    </section>
  );
}
