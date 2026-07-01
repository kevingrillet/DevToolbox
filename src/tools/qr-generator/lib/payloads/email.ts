/**
 * Payload "Email" — ouvre le client mail avec un destinataire, et éventuellement
 * un sujet et un corps pré-remplis.
 *
 * Format : mailto:<addr>?subject=<...>&body=<...>
 * Les paramètres sont encodés (encodeURIComponent → espaces en %20, conforme RFC 6068).
 */
export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export function buildEmail({ to, subject, body }: EmailData): string {
  const params: string[] = [];
  if (subject.trim() !== '') params.push(`subject=${encodeURIComponent(subject)}`);
  if (body.trim() !== '') params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${to.trim()}${query}`;
}
