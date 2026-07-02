/**
 * Garde-fous de taille (fonctions PURES, testables sans DOM).
 *
 * Deux limites indépendantes que l'UI vérifie AVANT de déléguer au moteur
 * `qr-code-styling`, afin d'afficher un message i18n clair plutôt qu'une erreur
 * technique brute (ou un rendu illisible) :
 *
 *  1. la CAPACITÉ du QR : un QR a une contenance maximale (version 40) qui dépend
 *     du niveau de correction d'erreur choisi. Au-delà, l'encodage échoue ;
 *  2. le POIDS du logo importé : au-delà d'un seuil raisonnable, la data URL
 *     alourdit inutilement le QR (et le rendu) — on refuse l'import.
 */
import type { ErrorCorrectionLevel } from './qr';

/**
 * Capacité maximale en OCTETS (mode binaire, version 40) par niveau de correction.
 * Source : table de capacité ISO/IEC 18004 (byte mode, version 40). Plus la
 * correction est haute, moins il reste de place pour les données.
 */
export const MAX_QR_BYTES: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

/** Longueur du contenu en octets UTF-8 (un caractère non-ASCII pèse plusieurs octets). */
export function qrByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Indique si le contenu dépasse la capacité d'un QR au niveau de correction donné.
 * L'UI s'en sert pour afficher un message clair au lieu de laisser le moteur échouer.
 */
export function exceedsQrCapacity(text: string, ecLevel: ErrorCorrectionLevel): boolean {
  return qrByteLength(text) > MAX_QR_BYTES[ecLevel];
}

/** Poids maximal accepté pour un logo importé : 1 Mio. */
export const MAX_LOGO_BYTES = 1024 * 1024;

/** Indique si un fichier logo (taille en octets) dépasse le seuil autorisé. */
export function isLogoTooLarge(bytes: number): boolean {
  return bytes > MAX_LOGO_BYTES;
}
