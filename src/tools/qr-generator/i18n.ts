/**
 * Helper i18n local à l'outil QR.
 *
 * La couche domaine (`lib/payloads`, `lib/presets`) et les composants portés
 * référencent des clés courtes (`preview.alt`, `types.wifi.label`, `presets.ink`…).
 * Dans DevToolbox, toutes les chaînes de cet outil vivent sous `tools.qr.*` :
 * `useQrT` préfixe automatiquement, ce qui permet de garder les composants et le
 * registre de payloads inchangés par rapport à leur forme d'origine.
 */
import { useI18n } from '../../i18n/I18nProvider';

export function useQrT(): { t: (key: string) => string; lang: string } {
  const { t, lang } = useI18n();
  return { t: (key: string) => t(`tools.qr.${key}`), lang };
}
