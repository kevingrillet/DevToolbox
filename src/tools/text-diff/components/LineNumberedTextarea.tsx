/**
 * Zone de saisie avec gouttière de numéros de ligne, synchronisée au défilement.
 *
 * Tool-local (pas dans le design system : ce besoin est propre au comparateur).
 * Le retour à la ligne automatique est désactivé (`wrap="off"`) afin qu'une ligne
 * source = une ligne visuelle : sans ça, les numéros ne pourraient pas s'aligner
 * (on ignore où le navigateur coupe une ligne enroulée). La gouttière reflète donc
 * la numérotation logique, cohérente avec le diff « par ligne ».
 *
 * Gouttière et textarea partagent EXACTEMENT la même police, taille et hauteur de
 * ligne (`font-mono text-sm leading-6`) + le même `py-2` : c'est ce qui garantit
 * l'alignement vertical des numéros sur les lignes.
 */
import { useId, useRef, type UIEvent } from 'react';

export interface LineNumberedTextareaProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function LineNumberedTextarea({
  label,
  value,
  placeholder,
  onChange,
  rows = 8,
}: LineNumberedTextareaProps) {
  const id = useId();
  const gutterRef = useRef<HTMLDivElement>(null);
  // Nombre de lignes logiques (au moins 1, même vide).
  const lineCount = value === '' ? 1 : value.split('\n').length;

  // La gouttière suit le défilement vertical du textarea (le défilement
  // horizontal n'affecte qu'elle : la gouttière n'a pas de contenu débordant).
  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-control border bg-surface focus-within:ring-2 focus-within:ring-accent">
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none overflow-hidden border-r bg-subtle px-2 py-2 text-right font-mono text-sm leading-6 text-fg-muted tabular-nums"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onScroll={handleScroll}
          rows={rows}
          wrap="off"
          spellCheck={false}
          className="flex-1 resize-y overflow-auto bg-transparent px-3 py-2 font-mono text-sm leading-6 text-fg outline-none placeholder:text-fg-muted"
        />
      </div>
    </div>
  );
}
