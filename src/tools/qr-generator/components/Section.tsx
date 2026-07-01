/**
 * Carte dépliable (accordéon) accessible, utilisée pour structurer la colonne de
 * gauche en sections « Contenu » / « Logo » / « Couleur » / « Forme ».
 *
 * L'en-tête est un vrai <button> avec `aria-expanded` ; le contenu est masqué
 * (non rendu) quand la section est repliée.
 */
import { useId, useState, type ReactNode } from 'react';

export interface SectionProps {
  /** Titre de la section. */
  title: string;
  /** Sous-titre optionnel (gris, à droite du titre). */
  subtitle?: string;
  /** Numéro/étiquette affiché dans la pastille à gauche. */
  badge?: ReactNode;
  /** Section ouverte par défaut ? */
  defaultOpen?: boolean;
  /** Niveau du titre porté par l'en-tête (hiérarchie RGAA 9.1). Défaut : 2. */
  headingLevel?: 2 | 3 | 4;
  children: ReactNode;
}

export function Section({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  headingLevel = 2,
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  // L'en-tête est un vrai titre (h2/h3/h4) contenant le bouton accordéon : le
  // titre structure la page, le bouton porte l'interaction (aria-expanded).
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    // Pas d'`overflow-hidden` : les bulles d'aide (`Hint`) doivent pouvoir
    // dépasser de la carte. Les coins restent nets car le bouton d'en-tête est
    // arrondi pour épouser la carte (haut toujours, bas quand la section est repliée).
    <section className="rounded-card border bg-surface shadow-card">
      <Heading className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center gap-3 rounded-t-card px-4 py-3.5 text-left text-sm font-semibold text-fg transition hover:bg-subtle ${
            open ? '' : 'rounded-b-card'
          }`}
        >
          {badge != null && (
            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-strong">
              {badge}
            </span>
          )}
          <span className="flex-1">
            {title}
            {subtitle && <span className="ml-2 font-normal text-fg-muted">{subtitle}</span>}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Heading>
      {open && (
        <div id={panelId} className="px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </section>
  );
}
