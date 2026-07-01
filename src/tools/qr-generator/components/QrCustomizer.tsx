/**
 * Contrôles de personnalisation du QR : couleurs (palettes + pickers) et forme
 * des modules. Composants présentationnels : ils reçoivent l'état et remontent
 * les changements ; l'état vit dans le store.
 */
import type { ModuleShape, QrColors } from '../lib/qr';
import { COLOR_PRESETS } from '../lib/presets';
import { useQrT } from '../i18n';

/* ------------------------------- Couleurs -------------------------------- */

export interface ColorControlsProps {
  colors: QrColors;
  onChange: (colors: QrColors) => void;
}

export function ColorControls({ colors, onChange }: ColorControlsProps) {
  const { t } = useQrT();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => {
          const active = preset.dark === colors.dark && preset.light === colors.light;
          return (
            <button
              key={preset.labelKey}
              type="button"
              title={t(preset.labelKey)}
              aria-label={t(preset.labelKey)}
              aria-pressed={active}
              onClick={() => onChange({ dark: preset.dark, light: preset.light })}
              className={`relative h-9 w-9 overflow-hidden rounded-control border transition ${
                active
                  ? 'border-accent-strong ring-2 ring-accent-strong ring-offset-1 ring-offset-surface'
                  : 'border-line'
              }`}
            >
              <span className="absolute inset-0" style={{ background: preset.light }} />
              <span
                className="absolute inset-0"
                style={{ background: preset.dark, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="color"
            value={colors.dark}
            onChange={(event) => onChange({ ...colors, dark: event.target.value })}
            aria-label={t('preview.foregroundColor')}
            className="h-8 w-8 cursor-pointer rounded-sm border bg-transparent"
          />
          {t('preview.foregroundColor')}
        </label>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="color"
            value={colors.light}
            onChange={(event) => onChange({ ...colors, light: event.target.value })}
            aria-label={t('preview.backgroundColor')}
            className="h-8 w-8 cursor-pointer rounded-sm border bg-transparent"
          />
          {t('preview.backgroundColor')}
        </label>
      </div>
    </div>
  );
}

/* -------------------------------- Forme ---------------------------------- */

const SHAPES: { id: ModuleShape; labelKey: string; round: string }[] = [
  { id: 'square', labelKey: 'shape.square', round: '0' },
  { id: 'dots', labelKey: 'shape.dots', round: '9999px' },
  { id: 'rounded', labelKey: 'shape.rounded', round: '3px' },
];

export interface ShapeControlsProps {
  shape: ModuleShape;
  onChange: (shape: ModuleShape) => void;
}

export function ShapeControls({ shape, onChange }: ShapeControlsProps) {
  const { t } = useQrT();
  return (
    <div className="flex gap-2">
      {SHAPES.map((option) => {
        const active = option.id === shape;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`flex flex-1 flex-col items-center gap-2 rounded-control border px-2 py-3 text-xs font-semibold transition ${
              active ? 'border-accent bg-accent text-accent-fg' : 'bg-subtle text-fg hover:bg-input'
            }`}
          >
            <span aria-hidden="true" className="grid h-6 w-6 grid-cols-3 grid-rows-3 gap-px">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index} className="bg-current" style={{ borderRadius: option.round }} />
              ))}
            </span>
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
