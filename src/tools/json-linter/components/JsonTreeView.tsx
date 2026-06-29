/**
 * Affichage récursif de l'arbre JSON. Chaque conteneur (objet/tableau) a un
 * bouton de pliage (`aria-expanded`) ; chaque nœud est sélectionnable. Les nœuds
 * correspondant à la recherche sont surlignés, le nœud sélectionné est encadré.
 */
import { useI18n } from '../../../i18n/I18nProvider';
import { cx } from '../../../lib/cx';
import type { JsonType, TreeNode } from '../lib/tree';

export interface JsonTreeViewProps {
  node: TreeNode;
  depth?: number;
  isOpen: (path: string) => boolean;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
  matchSet: Set<string>;
  selected: string | null;
}

const VALUE_CLASS: Record<JsonType, string> = {
  string: 'text-success',
  number: 'text-accent-strong',
  boolean: 'text-accent-strong',
  null: 'text-fg-muted',
  array: 'text-fg-muted',
  object: 'text-fg-muted',
};

function ValueSpan({ node }: { node: TreeNode }) {
  return <span className={VALUE_CLASS[node.type]}>{JSON.stringify(node.raw)}</span>;
}

export function JsonTreeView({
  node,
  depth = 0,
  isOpen,
  onToggle,
  onSelect,
  matchSet,
  selected,
}: JsonTreeViewProps) {
  const { t } = useI18n();
  const open = isOpen(node.path);
  const isContainer = !node.primitive;
  const summary = node.type === 'array' ? `[${node.children.length}]` : `{${node.children.length}}`;

  return (
    <div>
      <div
        className={cx(
          'flex items-center gap-1 rounded px-1 py-0.5',
          matchSet.has(node.path) && 'bg-accent-soft',
          node.path === selected && 'outline outline-2 outline-accent-strong',
        )}
        style={{ marginLeft: depth * 14 }}
      >
        {isContainer ? (
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            aria-expanded={open}
            aria-label={node.keyLabel || '$'}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-fg-muted"
          >
            <span aria-hidden="true">{open ? '▾' : '▸'}</span>
          </button>
        ) : (
          <span className="inline-block w-5 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node.path)}
          className="flex min-w-0 items-baseline gap-2 text-left font-mono text-sm"
        >
          <span className="truncate">
            {node.keyLabel !== '' && <span className="font-medium text-fg">{node.keyLabel}: </span>}
            {node.primitive ? (
              <ValueSpan node={node} />
            ) : (
              <span className="text-fg-muted">{summary}</span>
            )}
          </span>
          <span className="shrink-0 text-xs text-fg-muted">
            {t(`tools.json.types.${node.type}`)}
          </span>
        </button>
      </div>

      {isContainer &&
        open &&
        node.children.map((child) => (
          <JsonTreeView
            key={child.path}
            node={child}
            depth={depth + 1}
            isOpen={isOpen}
            onToggle={onToggle}
            onSelect={onSelect}
            matchSet={matchSet}
            selected={selected}
          />
        ))}
    </div>
  );
}
