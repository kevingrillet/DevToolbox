/**
 * Payload "vCard" — carte de contact. Scanner le QR propose d'ajouter le contact.
 *
 * On génère une vCard version 3.0 (la plus universellement supportée).
 * Les champs optionnels vides sont omis. Les caractères réservés (`\ , ; \n`)
 * sont échappés conformément à la RFC 6350. Les lignes sont séparées par CRLF.
 */
export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}

/** Échappe les caractères réservés d'une valeur vCard. */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildVCard(data: VCardData): string {
  const e = escapeVCard;
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  // N (nom structuré) : Nom;Prénom;;; — FN (nom affiché) en complément.
  lines.push(`N:${e(data.lastName)};${e(data.firstName)};;;`);
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  lines.push(`FN:${e(fullName)}`);

  if (data.organization.trim() !== '') lines.push(`ORG:${e(data.organization)}`);
  if (data.title.trim() !== '') lines.push(`TITLE:${e(data.title)}`);
  if (data.phone.trim() !== '') lines.push(`TEL;TYPE=CELL:${e(data.phone)}`);
  if (data.email.trim() !== '') lines.push(`EMAIL:${e(data.email)}`);
  if (data.url.trim() !== '') lines.push(`URL:${e(data.url)}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
