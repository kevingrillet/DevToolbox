/**
 * Page du générateur de QR code. Présentation pure : sélecteur de type, formulaire
 * dynamique (« Contenu »), personnalisation (couleur, forme, logo, réglages avancés)
 * et aperçu + export. Tout l'état vit dans `useQrStore` ; le rendu/encodage et
 * l'export PNG/SVG sont gérés par `QrPreview` via l'adaptateur `qr-code-styling`.
 */
import { useQrT } from './i18n';
import { useQrStore } from './useQrStore';
import { PAYLOAD_TYPES } from './lib/payloads';
import { TypeSelector } from './components/TypeSelector';
import { QrForm } from './components/QrForm';
import { Section } from './components/Section';
import { ColorControls, ShapeControls } from './components/QrCustomizer';
import { LogoControls } from './components/LogoControls';
import { QrOutputControls } from './components/QrOutputControls';
import { QrPreview } from './components/QrPreview';

export default function QrGeneratorPage() {
  const { t } = useQrT();
  const store = useQrStore();

  return (
    <section aria-labelledby="qr-title">
      <h1 id="qr-title" className="text-2xl font-bold">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t(store.activeType.descriptionKey)}</p>

      <div className="mt-6">
        <TypeSelector
          types={PAYLOAD_TYPES}
          activeId={store.activeId}
          onChange={store.setActiveId}
        />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_300px]">
        {/* Colonne gauche : configuration */}
        <div className="space-y-3">
          <Section title={t('sections.content')} badge={1} defaultOpen>
            <QrForm
              type={store.activeType}
              values={store.values}
              onChange={store.setValue}
              errors={store.errors}
            />
          </Section>

          <h2 className="px-1 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-fg-muted">
            {t('sections.customization')}
          </h2>

          <Section title={t('sections.color')} badge={2} headingLevel={3} defaultOpen>
            <ColorControls colors={store.colors} onChange={store.setColors} />
          </Section>

          <Section title={t('sections.shape')} badge={3} headingLevel={3}>
            <ShapeControls shape={store.shape} onChange={store.setShape} />
          </Section>

          <Section title={t('sections.logo')} badge={4} headingLevel={3}>
            <LogoControls logo={store.logo} onChange={store.setLogo} />
          </Section>

          <Section title={t('sections.output')} badge={5} headingLevel={3}>
            <QrOutputControls
              ecLevel={store.ecLevel}
              onEcLevelChange={store.setEcLevel}
              density={store.density}
              onDensityChange={store.setDensity}
              size={store.size}
              onSizeChange={store.setSize}
            />
          </Section>
        </div>

        {/* Colonne droite : aperçu + export */}
        <aside>
          <div className="md:sticky md:top-6">
            <QrPreview
              text={store.payload}
              ready={store.ready}
              filenameBase={`qrcode-${store.activeId}`}
              description={t(store.activeType.labelKey)}
              colors={store.colors}
              shape={store.shape}
              ecLevel={store.ecLevel}
              density={store.density}
              size={store.size}
              image={store.logo}
            />
          </div>
        </aside>
      </div>

      <p className="mt-8 text-center text-xs text-fg-muted">{t('privacy')}</p>
    </section>
  );
}
