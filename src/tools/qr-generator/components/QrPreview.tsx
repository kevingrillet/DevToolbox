/**
 * Aperçu du QR + téléchargements (PNG / SVG / copie presse-papier).
 *
 * L'aperçu est rendu en <canvas> par `qr-code-styling` (clic droit « Copier
 * l'image » disponible). Le conteneur reste monté en permanence — masqué tant que
 * le formulaire n'est pas exploitable (`ready === false`) — pour conserver
 * l'instance et son canvas. Un avertissement s'affiche si les couleurs choisies
 * compromettent la lisibilité (voir `contrast.ts`). Les réglages (correction,
 * densité, taille) vivent dans `QrOutputControls` (colonne de gauche).
 */
import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import {
  createQr,
  downloadQr,
  toStylingOptions,
  type ErrorCorrectionLevel,
  type ModuleShape,
  type QrColors,
} from '../lib/qr';
import { contrastStatus } from '../lib/contrast';
import { useQrT } from '../i18n';

export interface QrPreviewProps {
  /** Chaîne à encoder. */
  text: string;
  /** Le formulaire contient-il les informations minimales requises ? */
  ready: boolean;
  /** Préfixe du nom de fichier au téléchargement. */
  filenameBase?: string;
  /** Couleurs (modules / fond). */
  colors: QrColors;
  /** Forme des modules. */
  shape: ModuleShape;
  /** Niveau de correction d'erreur. */
  ecLevel: ErrorCorrectionLevel;
  /** Densité : 0 = automatique, 1–40 = version forcée. */
  density: number;
  /** Taille d'export en pixels. */
  size: number;
  /** Logo (data URL) à incruster au centre, ou chaîne vide. */
  image?: string;
  /** Libellé du type de contenu (ex. « WiFi »), ajouté au nom accessible du QR.
   *  On décrit le TYPE plutôt que la valeur encodée pour ne pas divulguer de
   *  donnée sensible (mot de passe WiFi…) à la synthèse vocale. */
  description?: string;
}

const PREVIEW_WIDTH = 240;

export function QrPreview({
  text,
  ready,
  filenameBase = 'qrcode',
  colors,
  shape,
  ecLevel,
  density,
  size,
  image,
  description,
}: QrPreviewProps) {
  const { t } = useQrT();
  const qrLabel = description ? `${t('preview.alt')} : ${description}` : t('preview.alt');
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [encodeError, setEncodeError] = useState(false);

  const { dark, light } = colors;
  const contrast = contrastStatus(dark, light);
  const contrastWarning =
    contrast === 'low'
      ? t('preview.contrastWarningLow')
      : contrast === 'inverted'
        ? t('preview.contrastWarningInverted')
        : null;

  const renderOptions = {
    colors: { dark, light },
    shape,
    errorCorrectionLevel: ecLevel,
    typeNumber: density,
    image: image || undefined,
  };

  // (Re)dessine l'aperçu lorsque le contenu ou le style change. Une densité forcée
  // trop basse pour les données fait échouer l'encodage : on le signale.
  useEffect(() => {
    if (!ready || !containerRef.current) return;
    try {
      const options = { ...renderOptions, width: PREVIEW_WIDTH };
      if (!qrRef.current) {
        qrRef.current = createQr(text, options);
        qrRef.current.append(containerRef.current);
      } else {
        qrRef.current.update(toStylingOptions(text, options));
      }
      // On doit enregistrer le résultat de l'encodage (échec si la densité forcée
      // est trop basse pour les données) — il n'est connu qu'après le rendu canvas.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEncodeError(false);
    } catch {
      setEncodeError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ready, dark, light, shape, ecLevel, density, image]);

  const flashCopyError = () => {
    setCopyError(true);
    window.setTimeout(() => setCopyError(false), 3000);
  };

  const handleCopy = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    // Firefox < 127 et navigateurs anciens n'exposent pas ClipboardItem / write
    // d'images : on bascule sur l'indication « clic droit » plutôt que d'échouer
    // en silence.
    if (!canvas || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      flashCopyError();
      return;
    }
    // Safari exige que le ClipboardItem soit construit SYNCHRONEMENT dans le
    // gestionnaire de clic (préservation du « user gesture ») : on lui passe une
    // *promesse* de blob plutôt que d'attendre le callback de toBlob.
    const blob = new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('toBlob a renvoyé null'))),
        'image/png',
      );
    });
    void navigator.clipboard
      .write([new ClipboardItem({ 'image/png': blob })])
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(flashCopyError);
  };

  const canExport = ready && !encodeError;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-[256px] w-[256px] items-center justify-center rounded-card border bg-surface p-2">
        <div
          ref={containerRef}
          data-testid="qr-canvas"
          role="img"
          aria-label={qrLabel}
          className={ready && !encodeError ? '' : 'hidden'}
        />
        {!ready && <p className="px-4 text-center text-sm text-fg-muted">{t('preview.prompt')}</p>}
        {ready && encodeError && (
          <p className="px-4 text-center text-sm text-danger">{t('preview.error')}</p>
        )}
      </div>

      {/* Confirmation de copie annoncée aux lecteurs d'écran (le texte du bouton
          change visuellement, mais ne serait pas annoncé sans région live). */}
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? t('preview.copied') : ''}
      </p>

      {contrastWarning && (
        <p role="alert" className="max-w-[256px] text-center text-sm text-warning">
          {contrastWarning}
        </p>
      )}

      {/* Lisibilité (statut de contraste) */}
      <p className="text-xs text-fg-muted">
        {contrast === 'ok' ? t('preview.readabilityOk') : t('preview.readabilityRisk')}
      </p>

      {/* Téléchargements */}
      <div className="grid w-full max-w-[256px] grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!canExport}
          onClick={() =>
            downloadQr(text, `${filenameBase}`, 'png', { ...renderOptions, width: size })
          }
          className="col-span-2 rounded-control bg-accent px-4 py-2 text-center text-sm font-medium text-accent-fg shadow-btn transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('preview.downloadPng')}
        </button>
        <button
          type="button"
          disabled={!canExport}
          onClick={() =>
            downloadQr(text, `${filenameBase}`, 'svg', { ...renderOptions, width: size })
          }
          className="rounded-control border border-accent-strong px-4 py-2 text-center text-sm font-medium text-accent-strong transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('preview.downloadSvg')}
        </button>
        <button
          type="button"
          disabled={!canExport}
          onClick={handleCopy}
          className="rounded-control border px-4 py-2 text-center text-sm font-medium text-fg transition hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? t('preview.copied') : t('preview.copy')}
        </button>
      </div>

      {copyError && (
        <p role="alert" className="max-w-[256px] text-center text-xs text-fg-muted">
          {t('preview.copyHint')}
        </p>
      )}
    </div>
  );
}
