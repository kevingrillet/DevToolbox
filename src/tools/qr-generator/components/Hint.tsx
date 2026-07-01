/**
 * Petite bulle d'aide (« ? ») affichée au survol et au focus clavier.
 *
 * Accessibilité :
 *  - le déclencheur est un vrai <button> (atteignable au clavier) ;
 *  - `aria-describedby` relie le bouton au texte de la bulle, qui est donc
 *    annoncé par les lecteurs d'écran (et pas seulement le `label`) ;
 *  - la bulle apparaît au focus/survol et se ferme avec Échap (WCAG 1.4.13 :
 *    contenu au survol/focus « dismissible »).
 *
 * `label` est l'étiquette accessible du bouton ; le texte d'aide est passé en
 * enfant. Couleurs via tokens de thème uniquement (lisible dans les 8 combinaisons).
 */
import { useId, useState, type ReactNode } from 'react';

export interface HintProps {
  label: string;
  children: ReactNode;
}

export function Hint({ label, children }: HintProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border text-[10px] font-bold leading-none text-fg-muted"
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-card border bg-surface p-3 text-left text-xs font-normal leading-relaxed text-fg shadow-card transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </span>
    </span>
  );
}
