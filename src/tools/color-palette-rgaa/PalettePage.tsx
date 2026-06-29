/**
 * Page du générateur de palette RGAA.
 *
 * Présentation pure : palette éditable, vérificateur de contraste (aperçu réel +
 * ratio chiffré + badges de conformité AA/AAA pour texte normal et grand texte),
 * suggestions de couleur de texte applicables, et export CSS / JSON / Tailwind.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { Textarea } from '../../components/ui/Textarea';
import { CopyButton } from '../../components/ui/CopyButton';
import { ColorField } from './components/ColorField';
import { useColorPaletteStore } from './useColorPaletteStore';
import type { Level } from './lib/wcag';

function levelVariant(level: Level): 'success' | 'accent' | 'danger' {
  if (level === 'AAA') return 'success';
  if (level === 'AA') return 'accent';
  return 'danger';
}

export default function PalettePage() {
  const { t } = useI18n();
  const store = useColorPaletteStore();

  const conformity = (level: Level) =>
    level === 'fail' ? t('tools.palette.conformity.fail') : t(`tools.palette.conformity.${level}`);

  const colorOptions = store.colors.map((hex, index) => ({
    value: String(index),
    label: `${index + 1} · ${hex}`,
  }));

  return (
    <section aria-labelledby="palette-title">
      <h1 id="palette-title" className="text-2xl font-bold">
        {t('tools.palette.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.palette.description')}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Palette éditable */}
        <Panel title={t('tools.palette.paletteTitle')}>
          <ul className="flex flex-col gap-2">
            {store.colors.map((hex, index) => (
              <li key={index} className="flex items-center gap-2">
                <ColorField
                  label={`${t('tools.palette.paletteTitle')} ${index + 1}`}
                  value={hex}
                  onChange={(next) => store.setColor(index, next)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => store.removeColor(index)}
                  disabled={store.colors.length <= 1}
                  aria-label={`${t('tools.palette.remove')} ${index + 1}`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={store.addColor}>
              + {t('tools.palette.addColor')}
            </Button>
          </div>
        </Panel>

        {/* Vérificateur de contraste */}
        <Panel title={t('tools.palette.contrastTitle')}>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label={t('tools.palette.foreground')}
              value={String(store.fgIndex)}
              onChange={(v) => store.setFgIndex(Number(v))}
              options={colorOptions}
            />
            <Select
              label={t('tools.palette.background')}
              value={String(store.bgIndex)}
              onChange={(v) => store.setBgIndex(Number(v))}
              options={colorOptions}
            />
            <Button variant="secondary" onClick={store.swap}>
              ⇄ {t('tools.palette.swap')}
            </Button>
          </div>

          <div className="mt-3">
            <Select
              label={t('tools.palette.textSize')}
              value={store.textSize}
              onChange={(v) => store.setTextSize(v as 'normal' | 'large')}
              options={[
                { value: 'normal', label: t('tools.palette.sizeNormal') },
                { value: 'large', label: t('tools.palette.sizeLarge') },
              ]}
            />
          </div>

          {/* Aperçu réel */}
          <div
            className="mt-4 rounded-card border p-6"
            style={{ backgroundColor: store.bgHex, color: store.fgHex }}
          >
            <p className="text-base">{t('tools.palette.sample')}</p>
            <p className="text-2xl font-bold">{t('tools.palette.sample')}</p>
          </div>

          <p className="mt-3 text-sm">
            <span className="text-fg-muted">{t('tools.palette.ratioLabel')} </span>
            <span className="font-mono font-bold">
              {store.ratio != null ? `${store.ratio.toFixed(2)}:1` : '—'}
            </span>
          </p>

          <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <dt className="text-fg-muted">{t('tools.palette.rowNormal')}</dt>
            <dd>
              {store.levelNormal && (
                <Badge variant={levelVariant(store.levelNormal)}>
                  {conformity(store.levelNormal)}
                </Badge>
              )}
            </dd>
            <dt className="text-fg-muted">{t('tools.palette.rowLarge')}</dt>
            <dd>
              {store.levelLarge && (
                <Badge variant={levelVariant(store.levelLarge)}>
                  {conformity(store.levelLarge)}
                </Badge>
              )}
            </dd>
          </dl>
        </Panel>

        {/* Suggestions */}
        <Panel title={t('tools.palette.suggestionsTitle')}>
          <p className="mb-3 text-sm text-fg-muted">{t('tools.palette.suggestionHint')}</p>
          <div className="flex flex-col gap-3">
            <SuggestionRow
              hex={store.suggestions.aa}
              label={t('tools.palette.applyAa')}
              impossible={t('tools.palette.impossible')}
              onApply={store.applySuggestion}
            />
            <SuggestionRow
              hex={store.suggestions.aaa}
              label={t('tools.palette.applyAaa')}
              impossible={t('tools.palette.impossible')}
              onApply={store.applySuggestion}
            />
          </div>
        </Panel>

        {/* Export */}
        <Panel title={t('tools.palette.exportTitle')}>
          <Select
            label={t('tools.palette.format')}
            value={store.exportFormat}
            onChange={(v) => store.setExportFormat(v as 'css' | 'json' | 'tailwind')}
            options={[
              { value: 'css', label: t('tools.palette.formats.css') },
              { value: 'json', label: t('tools.palette.formats.json') },
              { value: 'tailwind', label: t('tools.palette.formats.tailwind') },
            ]}
          />
          <div className="mt-3">
            <Textarea
              label={t('tools.palette.exportTitle')}
              value={store.exportText}
              readOnly
              rows={8}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <CopyButton
              value={store.exportText}
              label={t('tools.palette.copy')}
              copiedLabel={t('tools.palette.copied')}
            />
          </div>
        </Panel>
      </div>
    </section>
  );
}

function SuggestionRow({
  hex,
  label,
  impossible,
  onApply,
}: {
  hex: string | null;
  label: string;
  impossible: string;
  onApply: (hex: string) => void;
}) {
  if (!hex) return <p className="text-sm text-danger">{impossible}</p>;
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="inline-block h-6 w-6 shrink-0 rounded-control border"
        style={{ backgroundColor: hex }}
      />
      <code className="font-mono text-sm text-fg">{hex}</code>
      <Button size="sm" variant="secondary" onClick={() => onApply(hex)}>
        {label}
      </Button>
    </div>
  );
}
