/**
 * Sélecteur du type de contenu QR.
 * Se génère à partir du registre des types (`PAYLOAD_TYPES`) : aucun type n'est
 * codé en dur ici.
 *
 * Implémente le motif ARIA « radiogroup » (sélection unique parmi N) : c'est plus
 * fidèle au comportement réel — choisir UN type de contenu — que des « tabs », qui
 * impliqueraient des panneaux (`tabpanel`) associés. `role="radiogroup"` +
 * `role="radio"` + `aria-checked`, avec navigation clavier « roving tabindex »
 * (seul le bouton actif est tabbable ; ←/→/↑/↓ et Début/Fin déplacent la sélection).
 */
import { useRef } from 'react';
import type { PayloadType } from '../lib/payloads';
import { useQrT } from '../i18n';

export interface TypeSelectorProps {
  types: PayloadType[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TypeSelector({ types, activeId, onChange }: TypeSelectorProps) {
  const { t } = useQrT();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = types.findIndex((type) => type.id === activeId);

  // Active l'onglet à l'index donné (avec bouclage) et lui donne le focus :
  // activation « automatique » (le contenu suit le focus), recommandée ici.
  const focusTab = (index: number) => {
    const count = types.length;
    const next = (index + count) % count;
    onChange(types[next].id);
    tabsRef.current[next]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(types.length - 1);
        break;
    }
  };

  return (
    <div role="radiogroup" aria-label={t('a11y.contentType')} className="flex flex-wrap gap-2">
      {types.map((type, index) => {
        const isActive = type.id === activeId;
        return (
          <button
            key={type.id}
            ref={(element) => {
              tabsRef.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            // Roving tabindex : seul l'onglet actif (ou le 1er à défaut) est tabbable.
            tabIndex={isActive || (activeIndex === -1 && index === 0) ? 0 : -1}
            onClick={() => onChange(type.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={
              // min-w uniforme + texte centré et insécable : les onglets gardent une
              // largeur stable d'une langue à l'autre, tout en tenant sur une seule
              // ligne (la rangée ne déborde pas de la largeur du conteneur).
              'min-w-20 whitespace-nowrap rounded-control border px-3 py-1.5 text-center text-sm font-medium transition ' +
              (isActive
                ? 'border-accent bg-accent text-accent-fg shadow-btn'
                : 'bg-subtle text-fg-muted hover:text-fg')
            }
          >
            {t(type.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
