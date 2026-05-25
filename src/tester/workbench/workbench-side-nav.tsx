import {
  AppWindow,
  Boxes,
  FileBarChart2,
  FlaskConical,
  Gauge,
  PackageOpen,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { workbenchSections, type WorkbenchSection, type WorkbenchSectionId } from './workbench-context.js';

const sectionIcons: Record<WorkbenchSectionId, LucideIcon> = {
  'ai-testing': FlaskConical,
  'kit-components': Boxes,
  runs: FileBarChart2,
  artifacts: PackageOpen,
  diagnostics: Gauge,
  settings: Settings,
};

const groupTitles: Record<WorkbenchSection['group'], string> = {
  workbench: 'Workbench',
  evidence: 'Evidence',
  app: 'App',
};

type WorkbenchSideNavProps = {
  activeId: WorkbenchSectionId;
  onSelect: (id: WorkbenchSectionId) => void;
  appId: string;
  appVersion: string;
};

function groupSections(items: WorkbenchSection[]) {
  const groups: Array<{ group: WorkbenchSection['group']; items: WorkbenchSection[] }> = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.group === item.group) {
      last.items.push(item);
    } else {
      groups.push({ group: item.group, items: [item] });
    }
  }
  return groups;
}

export function WorkbenchSideNav({ activeId, onSelect, appId, appVersion }: WorkbenchSideNavProps) {
  const groups = groupSections(workbenchSections);
  return (
    <aside className="workbench-side-nav" aria-label="Nimi tester workspace navigation">
      <div className="workbench-side-nav__brand">
        <span className="workbench-side-nav__brand-mark" aria-hidden="true">
          <AppWindow size={16} />
        </span>
        <div>
          <strong>Nimi Tester</strong>
          <span>{appId}</span>
        </div>
      </div>
      <nav className="workbench-side-nav__groups">
        {groups.map((group) => (
          <div key={group.group} className="workbench-side-nav__group">
            <p className="workbench-side-nav__group-title">{groupTitles[group.group]}</p>
            <ul>
              {group.items.map((item) => {
                const Icon = sectionIcons[item.id];
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={active ? 'workbench-side-nav__item workbench-side-nav__item--active' : 'workbench-side-nav__item'}
                      onClick={() => onSelect(item.id)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span className="workbench-side-nav__item-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="workbench-side-nav__footer">
        <span>Build {appVersion}</span>
        <span>developer-only</span>
      </div>
    </aside>
  );
}
