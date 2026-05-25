import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Boxes,
  ChevronDown,
  CircleAlert,
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
  ShieldCheck,
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

type Boundary = 'do' | 'dont';

type RecipeUsage = {
  intent: string;
  imports: string[];
  boundaries: Array<{ kind: Boundary; copy: string }>;
};

type Recipe = {
  id: string;
  name: string;
  variants: string[];
  anatomy: string[];
  preview: ReactNode;
  usage: RecipeUsage;
};

type FamilyId = 'actions' | 'inputs' | 'toggles' | 'feedback' | 'overlays' | 'surfaces' | 'states';

type Family = {
  id: FamilyId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const families: Family[] = [
  { id: 'actions', label: 'Actions', description: 'Buttons, icon buttons, action menus.', icon: MousePointerClick },
  { id: 'inputs', label: 'Inputs', description: 'TextField, TextareaField, SelectField, FieldShell.', icon: FormInput },
  { id: 'toggles', label: 'Toggles & selection', description: 'Toggle, Checkbox, Slider, SegmentedControl, NimiTabs.', icon: ToggleLeft },
  { id: 'feedback', label: 'Status & progress', description: 'StatusBadge, InlineAlert, ProgressIndicator.', icon: CircleAlert },
  { id: 'overlays', label: 'Overlays', description: 'Dialog, Popover, ActionMenu surface.', icon: Layers },
  { id: 'surfaces', label: 'Surfaces', description: 'Surface materials, ScrollArea, dense rows.', icon: PanelsTopLeft },
  { id: 'states', label: 'Empty / loading / error', description: 'EmptyState, LoadingSkeleton, fail-closed error surface.', icon: AlertCircle },
];

const recipes: Record<FamilyId, Recipe[]> = {
  actions: [
    {
      id: 'button',
      name: 'Button',
      variants: ['primary', 'secondary', 'ghost', 'danger', 'loading'],
      anatomy: ['tone', 'size', 'leadingIcon', 'trailingIcon', 'loading'],
      preview: (
        <div className="recipe-cluster">
          <Button tone="primary" leadingIcon={<Play size={14} />}>Run lane</Button>
          <Button tone="secondary" leadingIcon={<RefreshCw size={14} />}>Refresh</Button>
          <Button tone="ghost" leadingIcon={<Copy size={14} />}>Copy trace</Button>
          <Button tone="danger" leadingIcon={<X size={14} />}>Stop</Button>
          <Button loading>Checking</Button>
        </div>
      ),
      usage: {
        intent: 'Primary call-to-action inside cockpit panels; never wrap with custom shells.',
        imports: ['Button from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Pair the icon and label so the action reads on every density.' },
          { kind: 'dont', copy: 'Do not stack two primary buttons next to each other in the same row.' },
        ],
      },
    },
    {
      id: 'icon-button',
      name: 'IconButton',
      variants: ['ghost', 'primary', 'secondary', 'sm/md'],
      anatomy: ['icon', 'tone', 'size', 'aria-label'],
      preview: (
        <div className="recipe-cluster">
          <IconButton aria-label="Search routes" icon={<Search size={14} />} />
          <IconButton aria-label="Open settings" icon={<Settings size={14} />} />
          <IconButton aria-label="Add workflow" tone="primary" icon={<Plus size={14} />} />
          <IconButton aria-label="More" tone="secondary" icon={<MoreHorizontal size={14} />} />
        </div>
      ),
      usage: {
        intent: 'Compact actions in toolbars and table rows where labels would crowd the layout.',
        imports: ['IconButton from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Always set aria-label so screen readers can announce the action.' },
          { kind: 'dont', copy: 'Never use IconButton as the only primary submit affordance.' },
        ],
      },
    },
    {
      id: 'action-menu',
      name: 'ActionMenu',
      variants: ['default', 'danger', 'icon prefix'],
      anatomy: ['items', 'ariaLabel', 'onSelect'],
      preview: (
        <ActionMenu
          ariaLabel="Recipe actions"
          items={[
            { id: 'copy', label: 'Copy request trace', icon: <Copy size={13} /> },
            { id: 'rerun', label: 'Run again', icon: <RefreshCw size={13} /> },
            { id: 'stop', label: 'Stop lane', icon: <X size={13} />, tone: 'danger' },
          ]}
        />
      ),
      usage: {
        intent: 'Inline overflow actions next to a header or row; keyboard reachable by default.',
        imports: ['ActionMenu from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Use the danger tone to mark destructive entries (stop/clear).' },
          { kind: 'dont', copy: 'Do not nest menus inside menus — use a Dialog if you need depth.' },
        ],
      },
    },
  ],
  inputs: [
    {
      id: 'text-field',
      name: 'TextField',
      variants: ['default', 'leading icon', 'readonly'],
      anatomy: ['leading', 'placeholder', 'value', 'onChange'],
      preview: (
        <FieldShell label="Route name" description="Stored as app-owned draft data.">
          <TextField defaultValue="Runtime readiness route" leading={<TerminalSquare size={14} />} />
        </FieldShell>
      ),
      usage: {
        intent: 'Single-line input for scenario names, labels, or identifiers.',
        imports: ['TextField, FieldShell from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Wrap in FieldShell to inherit label + description rhythm.' },
          { kind: 'dont', copy: 'Avoid raw <input> elements — they bypass theme tokens.' },
        ],
      },
    },
    {
      id: 'textarea-field',
      name: 'TextareaField',
      variants: ['multiline', 'rows=4', 'controlled'],
      anatomy: ['rows', 'value', 'onChange'],
      preview: (
        <FieldShell label="Request body">
          <TextareaField rows={4} defaultValue="Validate the active Nimi App runtime route without app-local provider defaults." />
        </FieldShell>
      ),
      usage: {
        intent: 'Scenario prompts, structured request payloads, multi-line config.',
        imports: ['TextareaField, FieldShell from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Default rows to 4 in cockpit panels to fit two scroll lines.' },
          { kind: 'dont', copy: 'Do not stretch a single textarea past 8 rows; switch to a Dialog instead.' },
        ],
      },
    },
    {
      id: 'select-field',
      name: 'SelectField',
      variants: ['options', 'controlled', 'aria-label'],
      anatomy: ['options', 'value', 'onValueChange'],
      preview: (
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
      ),
      usage: {
        intent: 'Pick from a closed set of admitted lanes or providers.',
        imports: ['SelectField, FieldShell from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Provide aria-label even when nested in a FieldShell.' },
          { kind: 'dont', copy: 'Do not use SelectField for free-text — use TextField instead.' },
        ],
      },
    },
    {
      id: 'field-shell',
      name: 'FieldShell',
      variants: ['label only', 'label + description', 'slot composition'],
      anatomy: ['label', 'description', 'children'],
      preview: (
        <FieldShell label="Session token" description="FieldShell wraps any input control with consistent rhythm and a11y labels.">
          <TextField defaultValue="developer-local-device" />
        </FieldShell>
      ),
      usage: {
        intent: 'Shared label/description/error slot for every input primitive.',
        imports: ['FieldShell from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Use the description slot for guidance, not for errors.' },
          { kind: 'dont', copy: 'Do not build custom label markup that bypasses FieldShell.' },
        ],
      },
    },
  ],
  toggles: [
    {
      id: 'toggle',
      name: 'Toggle',
      variants: ['controlled', 'disabled'],
      anatomy: ['checked', 'onChange(boolean)'],
      preview: <TogglePreview />,
      usage: {
        intent: 'Binary switches for runtime-bound features (tracing, verbose console).',
        imports: ['Toggle from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Pair the toggle with a label that names the bound capability.' },
          { kind: 'dont', copy: 'Do not use Toggle for ternary state — switch to SegmentedControl.' },
        ],
      },
    },
    {
      id: 'checkbox',
      name: 'Checkbox',
      variants: ['label', 'checked', 'disabled'],
      anatomy: ['label', 'checked', 'onChange'],
      preview: <CheckboxPreview />,
      usage: {
        intent: 'Persistent settings that survive sessions (fail-closed guardrails).',
        imports: ['Checkbox from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Always render the label inline; do not hide it as a tooltip.' },
          { kind: 'dont', copy: 'Do not use Checkbox for runtime mutations — use a Button.' },
        ],
      },
    },
    {
      id: 'slider',
      name: 'Slider',
      variants: ['showValue', 'aria-label', 'min/max'],
      anatomy: ['min', 'max', 'value', 'onChange'],
      preview: <SliderPreview />,
      usage: {
        intent: 'Numeric ranges where the precise value can be derived from position.',
        imports: ['Slider from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Pair with a numeric readout when the range exceeds 0–100.' },
          { kind: 'dont', copy: 'Do not use a slider for discrete options — use SegmentedControl.' },
        ],
      },
    },
    {
      id: 'segmented-control',
      name: 'SegmentedControl',
      variants: ['icon prefix', 'size=sm'],
      anatomy: ['items', 'value', 'onValueChange'],
      preview: <SegmentedPreview />,
      usage: {
        intent: 'Pick one of 2–4 mutually exclusive options inline.',
        imports: ['SegmentedControl from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Keep labels under 12 chars so the segments do not wrap.' },
          { kind: 'dont', copy: 'Do not exceed 5 segments — switch to a SelectField.' },
        ],
      },
    },
    {
      id: 'nimi-tabs',
      name: 'NimiTabs',
      variants: ['controlled value', 'disabled tab'],
      anatomy: ['items', 'value', 'onValueChange'],
      preview: <TabsPreview />,
      usage: {
        intent: 'Section navigation inside a card or panel.',
        imports: ['NimiTabs from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Mark not-yet-admitted tabs disabled instead of hiding them.' },
          { kind: 'dont', copy: 'Do not nest NimiTabs inside another tab strip.' },
        ],
      },
    },
  ],
  feedback: [
    {
      id: 'status-badge',
      name: 'StatusBadge',
      variants: ['success', 'warning', 'danger', 'info', 'dot', 'outline'],
      anatomy: ['tone', 'shape'],
      preview: (
        <div className="recipe-cluster">
          <StatusBadge tone="success" shape="dot">session ready</StatusBadge>
          <StatusBadge tone="warning" shape="dot">sdk gap</StatusBadge>
          <StatusBadge tone="danger" shape="outline">blocked</StatusBadge>
          <StatusBadge tone="info">developer</StatusBadge>
        </div>
      ),
      usage: {
        intent: 'Convey contract state inline next to identifiers and surface names.',
        imports: ['StatusBadge from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Use the dot shape for live status; reserve outline for snapshot state.' },
          { kind: 'dont', copy: 'Do not stack three badges side-by-side; promote to an InlineAlert.' },
        ],
      },
    },
    {
      id: 'progress',
      name: 'ProgressIndicator',
      variants: ['showValue', 'inline'],
      anatomy: ['value', 'showValue'],
      preview: <ProgressIndicator value={72} showValue />,
      usage: {
        intent: 'Surface real progress derived from runtime state (never decorative).',
        imports: ['ProgressIndicator from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Only render a value if it is bound to a real running task.' },
          { kind: 'dont', copy: 'Do not animate a fake progress bar to mask unreadiness.' },
        ],
      },
    },
    {
      id: 'inline-alert',
      name: 'InlineAlert',
      variants: ['info', 'warning', 'icon slot'],
      anatomy: ['tone', 'icon', 'children'],
      preview: (
        <div className="recipe-cluster recipe-cluster--stack">
          <InlineAlert tone="info" icon={<Bell size={14} />}>
            <div className="runtime-alert-copy">
              <strong>Runtime-bound surface</strong>
              <span>Execution proof comes from SDK calls or typed unavailable states.</span>
            </div>
          </InlineAlert>
          <InlineAlert tone="warning" icon={<AlertTriangle size={14} />}>
            <div className="runtime-alert-copy">
              <strong>Missing admitted SDK method</strong>
              <span>The workflow can render controls but cannot claim execution readiness.</span>
            </div>
          </InlineAlert>
        </div>
      ),
      usage: {
        intent: 'Long-form contract messages that need narrative + headline.',
        imports: ['InlineAlert from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Surface typed reasons; cite the SDK method or admission gap directly.' },
          { kind: 'dont', copy: 'Do not collapse the headline into the body — readers scan the strong tag.' },
        ],
      },
    },
  ],
  overlays: [
    {
      id: 'dialog',
      name: 'Dialog',
      variants: ['header', 'body', 'footer', 'controlled open'],
      anatomy: ['open', 'onOpenChange'],
      preview: <DialogPreview />,
      usage: {
        intent: 'Modal flows that interrupt the cockpit when an admission decision is required.',
        imports: ['Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Always render a primary action that resolves the modal.' },
          { kind: 'dont', copy: 'Do not nest dialogs; chain step screens inside the body instead.' },
        ],
      },
    },
    {
      id: 'popover',
      name: 'Popover',
      variants: ['trigger', 'content', 'asChild composition'],
      anatomy: ['trigger', 'content'],
      preview: (
        <Popover>
          <PopoverTrigger asChild>
            <Button tone="secondary" trailingIcon={<ChevronDown size={14} />}>Route details</Button>
          </PopoverTrigger>
          <PopoverContent className="recipe-popover">
            <strong>Runtime route contract</strong>
            <span>Capability, prompt, diagnostics, and typed unavailable state travel together.</span>
          </PopoverContent>
        </Popover>
      ),
      usage: {
        intent: 'Compact context-helpers anchored to a control without a full modal.',
        imports: ['Popover, PopoverTrigger, PopoverContent from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Use the asChild trigger so the kit Button keeps its tone tokens.' },
          { kind: 'dont', copy: 'Do not place form inputs inside a Popover — use a Dialog.' },
        ],
      },
    },
    {
      id: 'menu-surface',
      name: 'ActionMenu surface',
      variants: ['inside Surface', 'sticky in panel'],
      anatomy: ['Surface', 'ActionMenu'],
      preview: (
        <Surface className="recipe-menu" material="glass-thin" tone="panel">
          <div className="recipe-menu__top">
            <StatusBadge tone="neutral">lane tools</StatusBadge>
            <IconButton aria-label="Open menu" icon={<MoreHorizontal size={14} />} />
          </div>
          <ActionMenu
            ariaLabel="Lane tools"
            items={[
              { id: 'inspect', label: 'Inspect payload', icon: <Search size={13} /> },
              { id: 'settings', label: 'Open settings', icon: <Settings size={13} /> },
              { id: 'clear', label: 'Clear draft', icon: <X size={13} />, tone: 'danger' },
            ]}
          />
        </Surface>
      ),
      usage: {
        intent: 'Composite recipe: anchor an ActionMenu in a Surface with a status header.',
        imports: ['Surface, ActionMenu, IconButton, StatusBadge from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Cap the menu with a status row so users see context before tapping.' },
          { kind: 'dont', copy: 'Do not duplicate the menu items in the surface body.' },
        ],
      },
    },
  ],
  surfaces: [
    {
      id: 'surface-materials',
      name: 'Surface materials',
      variants: ['glass-thin', 'glass-regular', 'glass-thick overlay'],
      anatomy: ['material', 'tone', 'elevation'],
      preview: (
        <div className="recipe-surface-row">
          <Surface material="glass-thin" tone="card" className="recipe-mini-surface">
            <Sparkles size={16} />
            <strong>Thin glass</strong>
          </Surface>
          <Surface material="glass-regular" tone="panel" className="recipe-mini-surface">
            <ShieldCheck size={16} />
            <strong>Regular</strong>
          </Surface>
          <Surface material="glass-thick" tone="overlay" elevation="floating" className="recipe-mini-surface">
            <SlidersHorizontal size={16} />
            <strong>Overlay</strong>
          </Surface>
        </div>
      ),
      usage: {
        intent: 'Compose layered panels using kit material tokens — never custom box-shadow stacks.',
        imports: ['Surface from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Pick thin glass for inline cards, overlay for modals + menus.' },
          { kind: 'dont', copy: 'Do not nest more than two glass surfaces in the same column.' },
        ],
      },
    },
    {
      id: 'scroll-area',
      name: 'ScrollArea',
      variants: ['viewport', 'sticky size', 'dense rows'],
      anatomy: ['viewportClassName', 'contentClassName'],
      preview: <ScrollAreaPreview />,
      usage: {
        intent: 'Long lists (runs, artifacts, traces) inside fixed-height panels.',
        imports: ['ScrollArea from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Set an explicit height so the scrollbar appears predictably.' },
          { kind: 'dont', copy: 'Do not wrap an already-scrolling element in a ScrollArea.' },
        ],
      },
    },
    {
      id: 'dense-card',
      name: 'Dense card',
      variants: ['heading', 'metric row', 'inline action'],
      anatomy: ['Surface', 'eyebrow', 'metric'],
      preview: (
        <Surface material="glass-thin" tone="card" className="recipe-dense-card">
          <div>
            <p className="eyebrow">Active sessions</p>
            <strong>3 lanes ready</strong>
          </div>
          <PencilRuler size={16} />
        </Surface>
      ),
      usage: {
        intent: 'Inline KPI tile pattern; compose with Surface + eyebrow + metric.',
        imports: ['Surface from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Show the actual count from runtime state, not a placeholder.' },
          { kind: 'dont', copy: 'Do not chart with custom canvases inside a dense card.' },
        ],
      },
    },
  ],
  states: [
    {
      id: 'empty-state',
      name: 'EmptyState',
      variants: ['icon', 'title', 'description', 'optional action'],
      anatomy: ['icon', 'title', 'description', 'action'],
      preview: (
        <EmptyState
          icon={<Boxes size={18} />}
          title="No captured artifacts"
          description="Run a real capability or resolve a typed blocker before this list fills."
          action={<Button size="sm" tone="secondary" leadingIcon={<RefreshCw size={13} />}>Refresh</Button>}
        />
      ),
      usage: {
        intent: 'Tell the developer exactly which action populates the surface.',
        imports: ['EmptyState, Button from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Name the action and the source store that will fill the surface.' },
          { kind: 'dont', copy: 'Do not show synthetic placeholder rows under the empty state.' },
        ],
      },
    },
    {
      id: 'loading-skeleton',
      name: 'LoadingSkeleton',
      variants: ['lines', 'shimmer', 'rhythm match'],
      anatomy: ['lines'],
      preview: <LoadingSkeleton lines={4} />,
      usage: {
        intent: 'Mirror the destination layout while real data is in flight.',
        imports: ['LoadingSkeleton from @nimiplatform/kit/ui'],
        boundaries: [
          { kind: 'do', copy: 'Match the skeleton line count to the eventual content rhythm.' },
          { kind: 'dont', copy: 'Do not show a skeleton when the call has already failed — surface an error.' },
        ],
      },
    },
    {
      id: 'error-surface',
      name: 'Runtime projection blocked',
      variants: ['icon', 'title', 'reason'],
      anatomy: ['Surface', 'AlertTriangle', 'typed reason'],
      preview: (
        <Surface className="recipe-error-state" material="glass-thin" tone="card">
          <AlertTriangle size={16} />
          <div>
            <strong>Runtime projection blocked</strong>
            <span>Third-party session projection is not exposed by this SDK/runtime pair.</span>
          </div>
        </Surface>
      ),
      usage: {
        intent: 'Fail-closed surface for typed runtime/SDK gaps.',
        imports: ['Surface from @nimiplatform/kit/ui', 'AlertTriangle icon'],
        boundaries: [
          { kind: 'do', copy: 'Quote the typed reason verbatim from the SDK error.' },
          { kind: 'dont', copy: 'Do not retry silently — escalate the typed reason to the developer.' },
        ],
      },
    },
  ],
};

function TogglePreview() {
  const [value, setValue] = useState(true);
  return (
    <div className="recipe-form-row">
      <span>Trace runtime calls</span>
      <Toggle checked={value} onChange={setValue} />
    </div>
  );
}

function CheckboxPreview() {
  const [value, setValue] = useState(true);
  return (
    <Checkbox
      checked={value}
      onChange={(event) => setValue(event.currentTarget.checked)}
      label="Fail closed on missing SDK surface"
    />
  );
}

function SliderPreview() {
  const [value, setValue] = useState(62);
  return (
    <Slider min={1} max={100} value={value} onChange={(event) => setValue(Number(event.currentTarget.value))} showValue aria-label="Batch size" />
  );
}

function SegmentedPreview() {
  const [value, setValue] = useState('review');
  return (
    <SegmentedControl
      items={[
        { value: 'review', label: 'Review', icon: <ClipboardCheck size={13} /> },
        { value: 'author', label: 'Author', icon: <Code2 size={13} /> },
        { value: 'runtime', label: 'Runtime', icon: <Cpu size={13} /> },
      ]}
      value={value}
      onValueChange={setValue}
      ariaLabel="Density"
      size="sm"
    />
  );
}

function TabsPreview() {
  const [value, setValue] = useState('request');
  return (
    <NimiTabs
      items={[
        { value: 'request', label: 'Request' },
        { value: 'diagnostics', label: 'Diagnostics' },
        { value: 'artifacts', label: 'Artifacts', disabled: true },
      ]}
      value={value}
      onValueChange={setValue}
      ariaLabel="Tabs"
    />
  );
}

function DialogPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button tone="primary" leadingIcon={<GalleryHorizontalEnd size={14} />} onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)} dataTestId="nimi-tester-recipe-dialog">
          <DialogHeader>
            <DialogTitle>Runtime admission check</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="recipe-dialog-copy">This dialog is rendered by kit primitives and does not bypass Runtime or SDK admission.</p>
          </DialogBody>
          <DialogFooter className="recipe-dialog-footer">
            <Button tone="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button tone="primary" onClick={() => setOpen(false)}>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ScrollAreaPreview() {
  const rows = Array.from({ length: 9 }, (_, index) => ({
    id: `trace-${index + 1}`,
    label: `Trace ${index + 1}`,
    status: index % 3 === 0 ? 'typed unavailable' : index % 3 === 1 ? 'queued' : 'ready',
  }));
  return (
    <ScrollArea className="recipe-scroll-area" viewportClassName="recipe-scroll-area__viewport" contentClassName="recipe-scroll-list">
      {rows.map((row) => (
        <div key={row.id} className="recipe-scroll-row">
          <MessageSquare size={13} />
          <span>{row.label}</span>
          <StatusBadge tone={row.status === 'ready' ? 'success' : row.status === 'queued' ? 'info' : 'warning'}>{row.status}</StatusBadge>
        </div>
      ))}
    </ScrollArea>
  );
}

function RecipeView({ recipe }: { recipe: Recipe }) {
  return (
    <article className="recipe">
      <header className="recipe__head">
        <div className="recipe__title">
          <h4>{recipe.name}</h4>
          <span>kit public surface</span>
        </div>
        <ul className="recipe__variants" aria-label={`${recipe.name} variants`}>
          {recipe.variants.map((variant) => <li key={variant}>{variant}</li>)}
        </ul>
      </header>
      <Surface className="recipe__preview" material="glass-thin" tone="card" elevation="base">
        {recipe.preview}
      </Surface>
      <section className="recipe__usage" aria-label={`${recipe.name} usage`}>
        <p className="recipe__intent">{recipe.usage.intent}</p>
        <div className="recipe__anatomy">
          <p className="eyebrow">Anatomy</p>
          <ul>
            {recipe.anatomy.map((token) => <li key={token}>{token}</li>)}
          </ul>
        </div>
        <div className="recipe__imports">
          <p className="eyebrow">Imports</p>
          <ul>
            {recipe.usage.imports.map((line) => <li key={line}><code>{line}</code></li>)}
          </ul>
        </div>
        <div className="recipe__boundaries">
          <p className="eyebrow">Boundary</p>
          <ul>
            {recipe.usage.boundaries.map((rule) => (
              <li key={rule.copy} className={`recipe__rule recipe__rule--${rule.kind}`}>
                <span className="recipe__rule-tag">{rule.kind === 'do' ? 'do' : "don't"}</span>
                <span>{rule.copy}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}

export function KitComponentGallery() {
  const [familyId, setFamilyId] = useState<FamilyId>('actions');
  const [recipeId, setRecipeId] = useState<string>(recipes.actions[0].id);

  const activeFamily = families.find((family) => family.id === familyId) || families[0];
  const familyRecipes = recipes[familyId] || [];
  const totalRecipes = useMemo(
    () => families.reduce((sum, family) => sum + (recipes[family.id]?.length || 0), 0),
    [],
  );
  const recipe = familyRecipes.find((item) => item.id === recipeId) || familyRecipes[0];

  function pickFamily(nextId: FamilyId) {
    setFamilyId(nextId);
    const first = recipes[nextId]?.[0];
    if (first) setRecipeId(first.id);
  }

  return (
    <section className="kit-gallery" data-testid="nimi-tester-kit-gallery">
      <header className="section-header section-header--compact">
        <div>
          <p className="eyebrow">Nimi Kit Component System</p>
          <h2>Recipe browser</h2>
          <p>Pick a family, then a recipe. Each card shows the live preview, anatomy, imports, and the boundary rules a third-party Nimi App must respect.</p>
        </div>
        <div className="kit-gallery__chips">
          <StatusBadge tone="info" shape="dot">kit public surface</StatusBadge>
          <StatusBadge tone="neutral">{totalRecipes} recipes</StatusBadge>
        </div>
      </header>
      <div className="recipe-browser">
        <nav className="recipe-browser__families" aria-label="Component families">
          {families.map((family) => {
            const Icon = family.icon;
            const isActive = family.id === familyId;
            const count = recipes[family.id]?.length || 0;
            return (
              <button
                key={family.id}
                type="button"
                className={isActive ? 'recipe-browser__family recipe-browser__family--active' : 'recipe-browser__family'}
                onClick={() => pickFamily(family.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="recipe-browser__family-icon" aria-hidden="true">
                  <Icon size={14} />
                </span>
                <span className="recipe-browser__family-text">
                  <strong>{family.label}</strong>
                  <span>{family.description}</span>
                </span>
                <span className="recipe-browser__family-count">{count}</span>
              </button>
            );
          })}
        </nav>
        <div className="recipe-browser__list" aria-label={`${activeFamily.label} recipes`}>
          <p className="eyebrow">{activeFamily.label}</p>
          <ul>
            {familyRecipes.map((item) => {
              const isActive = item.id === recipe?.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={isActive ? 'recipe-browser__row recipe-browser__row--active' : 'recipe-browser__row'}
                    onClick={() => setRecipeId(item.id)}
                  >
                    <span>{item.name}</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="recipe-browser__detail">
          {recipe ? <RecipeView recipe={recipe} /> : null}
        </div>
      </div>
    </section>
  );
}
