/**
 * Payload "SMS" — ouvre l'application de messages avec un numéro et un message
 * éventuellement pré-rempli.
 *
 * Format : SMSTO:<number>:<message>  (le plus largement reconnu par les scanners).
 * Sans message : SMSTO:<number>
 */
export interface SmsData {
  number: string;
  message: string;
}

export function buildSms({ number, message }: SmsData): string {
  const trimmedNumber = number.trim();
  return message.trim() !== '' ? `SMSTO:${trimmedNumber}:${message}` : `SMSTO:${trimmedNumber}`;
}
