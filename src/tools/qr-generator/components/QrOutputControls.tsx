/**
 * Réglages du code : niveau de correction d'erreur, densité (version du QR) et
 * taille d'export. Composant présentationnel — l'état vit dans le store.
 *
 * La densité « Auto » laisse l'encodeur choisir la plus petite version qui
 * contient les données au niveau de correction donné (table de capacité standard) ;
 * on peut forcer une version plus dense, ou plus basse (au risque que les données
 * ne tiennent pas).
 */
import type { ErrorCorrectionLevel } from '../lib/qr';
import { useQrT } from '../i18n';
import { Hint } from './Hint';

const EC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
const VERSIONS = Array.from({ length: 40 }, (_, index) => index + 1);
const SELECT_CLASS =
  'w-full rounded-control border bg-input px-3 py-2 text-fg shadow-card transition focus:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent';

export interface QrOutputControlsProps {
  ecLevel: ErrorCorrectionLevel;
  onEcLevelChange: (level: ErrorCorrectionLevel) => void;
  /** Densité : 0 = automatique, 1–40 = version forcée. */
  density: number;
  onDensityChange: (density: number) => void;
  size: number;
  onSizeChange: (size: number) => void;
}

export function QrOutputControls({
  ecLevel,
  onEcLevelChange,
  density,
  onDensityChange,
  size,
  onSizeChange,
}: QrOutputControlsProps) {
  const { t } = useQrT();
  return (
    <div className="space-y-4">
      {/* Niveau de correction d'erreur */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-sm text-fg-muted">
          {t('preview.errorCorrectionLabel')}
          <Hint label={`${t('a11y.help')} – ${t('preview.errorCorrectionLabel')}`}>
            {t('preview.errorCorrectionHint')}
          </Hint>
        </div>
        <select
          value={ecLevel}
          onChange={(event) => onEcLevelChange(event.target.value as ErrorCorrectionLevel)}
          aria-label={t('preview.errorCorrectionLabel')}
          className={SELECT_CLASS}
        >
          {EC_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t(`errorCorrection.${level}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Densité (version du QR) */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-sm text-fg-muted">
          {t('output.densityLabel')}
          <Hint label={`${t('a11y.help')} – ${t('output.densityLabel')}`}>
            {t('output.densityHint')}
          </Hint>
        </div>
        <select
          value={density}
          onChange={(event) => onDensityChange(Number(event.target.value))}
          aria-label={t('output.densityLabel')}
          className={SELECT_CLASS}
        >
          <option value={0}>{t('output.densityAuto')}</option>
          {VERSIONS.map((version) => {
            const modules = 17 + 4 * version;
            return (
              <option key={version} value={version}>
                {t('output.versionPrefix')} {version} · {modules}×{modules}
              </option>
            );
          })}
        </select>
      </div>

      {/* Taille de l'image exportée */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm text-fg-muted">
          <span>{t('preview.size')}</span>
          <span className="font-mono text-xs">{size}&nbsp;px</span>
        </div>
        <input
          type="range"
          min={128}
          max={2048}
          step={64}
          value={size}
          onChange={(event) => onSizeChange(Number(event.target.value))}
          aria-label={t('preview.size')}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
