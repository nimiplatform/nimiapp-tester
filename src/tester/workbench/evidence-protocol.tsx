import { Database, Workflow } from 'lucide-react';
import { Surface } from '@nimiplatform/kit/ui';

export type EvidenceProtocolProps = {
  source: string;
  producer: string;
  notes?: string[];
};

export function EvidenceProtocol({ source, producer, notes }: EvidenceProtocolProps) {
  return (
    <Surface className="evidence-protocol" material="glass-thin" tone="card" elevation="base">
      <ul className="evidence-protocol__pairs">
        <li className="evidence-protocol__pair">
          <Database size={14} aria-hidden="true" />
          <div className="evidence-protocol__pair-text">
            <strong>Source</strong>
            <span>{source}</span>
          </div>
        </li>
        <li className="evidence-protocol__pair">
          <Workflow size={14} aria-hidden="true" />
          <div className="evidence-protocol__pair-text">
            <strong>Producer</strong>
            <span>{producer}</span>
          </div>
        </li>
      </ul>
      {notes && notes.length > 0 ? (
        <ul className="evidence-protocol__notes">
          {notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      ) : null}
    </Surface>
  );
}
