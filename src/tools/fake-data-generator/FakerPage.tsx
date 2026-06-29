/**
 * Page du générateur de données factices.
 *
 * Présentation pure et **pilotée par les champs** : pour chaque `FakerField` du
 * générateur courant, on rend le contrôle adapté (nombre / booléen / liste). Un
 * nouveau générateur n'a donc rien à modifier ici.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { GENERATORS } from './lib/generators';
import { useFakerStore } from './useFakerStore';

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export default function FakerPage() {
  const { t } = useI18n();
  const store = useFakerStore();
  const generatorOptions = GENERATORS.map((g) => ({ value: g.id, label: t(g.labelKey) }));

  return (
    <section aria-labelledby="faker-title">
      <h1 id="faker-title" className="text-2xl font-bold">
        {t('tools.faker.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.faker.description')}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Select
            label={t('tools.faker.generator')}
            value={store.generatorId}
            onChange={store.setGenerator}
            options={generatorOptions}
          />

          {store.generator.fields.map((field) => {
            if (field.kind === 'number') {
              return (
                <Input
                  key={field.key}
                  type="number"
                  label={t(field.labelKey)}
                  min={field.min}
                  max={field.max}
                  value={String(store.options[field.key] ?? field.default)}
                  onChange={(event) =>
                    store.setOption(
                      field.key,
                      clamp(Number.parseInt(event.target.value, 10), field.min, field.max),
                    )
                  }
                />
              );
            }
            if (field.kind === 'boolean') {
              return (
                <Checkbox
                  key={field.key}
                  label={t(field.labelKey)}
                  checked={Boolean(store.options[field.key])}
                  onChange={(checked) => store.setOption(field.key, checked)}
                />
              );
            }
            return (
              <Select
                key={field.key}
                label={t(field.labelKey)}
                value={String(store.options[field.key])}
                onChange={(value) => store.setOption(field.key, value)}
                options={field.options.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
              />
            );
          })}

          <Input
            label={t('tools.faker.seed')}
            placeholder={t('tools.faker.seedPlaceholder')}
            hint={t('tools.faker.seedHint')}
            value={store.seed}
            onChange={(event) => store.setSeed(event.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={store.regenerate}>{t('tools.faker.regenerate')}</Button>
            <Button variant="ghost" onClick={store.reset}>
              {t('tools.faker.reset')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Textarea label={t('tools.faker.output')} value={store.output} readOnly rows={14} />
          <div className="flex justify-end">
            <CopyButton
              value={store.output}
              label={t('tools.faker.copy')}
              copiedLabel={t('tools.faker.copied')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
