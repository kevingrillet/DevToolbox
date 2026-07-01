/**
 * Payload "Téléphone" — déclenche un appel vers le numéro indiqué.
 * Format : tel:<number>
 */
export function buildTel(number: string): string {
  return `tel:${number.trim()}`;
}
