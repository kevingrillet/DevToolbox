/**
 * Page de l'outil Encodeur / Décodeur.
 *
 * Composant de présentation : il câble le `useEncoderStore` (état + commands +
 * queries) aux composants du design system. Aucune logique métier ici. La sortie
 * est dérivée en direct de l'entrée ; pour le JWT, on affiche la vue structurée
 * (`JwtView`) au lieu du panneau de sortie texte.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { FORMATS } from './lib/codecs';
import { useEncoderStore } from './useEncoderStore';
import { JwtView } from './components/JwtView';

export default function EncoderPage() {
  const { t } = useI18n();
  const store = useEncoderStore();
  const { codecResult, jwtResult, isJwt } = store;

  const formatOptions = FORMATS.map((format) => ({ value: format.id, label: t(format.labelKey) }));
  const directionOptions = [
    { value: 'encode', label: t('tools.encoder.encode') },
    { value: 'decode', label: t('tools.encoder.decode') },
  ];

  const outputValue = codecResult?.ok ? codecResult.value : '';
  const outputError = codecResult && !codecResult.ok ? t(codecResult.errorKey) : undefined;

  return (
    <section aria-labelledby="encoder-title">
      <h1 id="encoder-title" className="text-2xl font-bold">
        {t('tools.encoder.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.encoder.description')}</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Select
          label={t('tools.encoder.format')}
          value={store.formatId}
          onChange={store.setFormat}
          options={formatOptions}
        />
        {!isJwt && (
          <>
            <Select
              label={t('tools.encoder.direction')}
              value={store.direction}
              onChange={(value) => store.setDirection(value as 'encode' | 'decode')}
              options={directionOptions}
            />
            <Button variant="secondary" onClick={store.swap}>
              ⇄ {t('tools.encoder.swap')}
            </Button>
          </>
        )}
        <Button variant="ghost" onClick={store.reset}>
          {t('tools.encoder.reset')}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Textarea
          label={t('tools.encoder.input')}
          placeholder={t('tools.encoder.inputPlaceholder')}
          value={store.input}
          onChange={(event) => store.setInput(event.target.value)}
          rows={isJwt ? 6 : 10}
        />

        <div className="flex flex-col gap-2">
          {isJwt ? (
            jwtResult && <JwtView result={jwtResult} />
          ) : (
            <>
              <Textarea
                label={t('tools.encoder.output')}
                value={outputValue}
                error={outputError}
                readOnly
                rows={10}
              />
              <div className="flex justify-end">
                <CopyButton
                  value={outputValue}
                  label={t('tools.encoder.copy')}
                  copiedLabel={t('tools.encoder.copied')}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
