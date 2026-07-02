/**
 * Import d'un logo (image) à incruster au centre du QR.
 *
 * Le fichier choisi est lu en **data URL** (tout reste dans le navigateur, aucune
 * donnée envoyée) puis remonté via `onChange`. Le rendu et l'incrustation sont
 * gérés par l'adaptateur `qr` / `qr-code-styling`.
 */
import { useRef, useState, type ChangeEvent } from 'react';
import { isLogoTooLarge } from '../lib/limits';
import { useQrT } from '../i18n';

export interface LogoControlsProps {
  /** Logo courant (data URL), ou chaîne vide si aucun. */
  logo: string;
  onChange: (logo: string) => void;
}

export function LogoControls({ logo, onChange }: LogoControlsProps) {
  const { t } = useQrT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tooLarge, setTooLarge] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // On réinitialise la valeur pour pouvoir ré-importer le même fichier ensuite.
    event.target.value = '';
    if (!file) return;
    // Garde-fou de poids : un logo trop lourd alourdit inutilement le QR (data URL).
    if (isLogoTooLarge(file.size)) {
      setTooLarge(true);
      return;
    }
    setTooLarge(false);
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        aria-label={t('logo.upload')}
        className="sr-only"
      />

      {logo ? (
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt={t('logo.alt')}
            className="h-12 w-12 rounded-control border bg-surface object-contain p-1"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-control border px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-subtle"
          >
            {t('logo.upload')}
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-control px-3 py-1.5 text-sm font-medium text-fg-muted transition hover:text-fg"
          >
            {t('logo.remove')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-control border border-dashed px-4 py-3 text-sm font-medium text-fg-muted transition hover:bg-subtle"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
          </svg>
          {t('logo.upload')}
        </button>
      )}

      {tooLarge && (
        <p role="alert" className="text-xs text-danger">
          {t('logo.tooLarge')}
        </p>
      )}

      <p className="text-xs text-fg-muted">{t('logo.hint')}</p>
    </div>
  );
}
