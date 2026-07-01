/**
 * Payload "WiFi" — permet de se connecter à un réseau en scannant le QR.
 *
 * Format standard (reconnu par Android/iOS) :
 *   WIFI:T:<WPA|WEP|nopass>;S:<ssid>;P:<password>;H:<true>;;
 *
 * Les caractères spéciaux `\ ; , : "` doivent être échappés par un antislash,
 * sinon ils casseraient la structure du champ.
 */
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

/** Échappe les caractères réservés du format WIFI:. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function buildWifi({ ssid, password, encryption, hidden }: WifiData): string {
  const parts = [`T:${encryption}`, `S:${escapeWifi(ssid)}`];
  // Pas de mot de passe pour un réseau ouvert (nopass).
  if (encryption !== 'nopass' && password !== '') {
    parts.push(`P:${escapeWifi(password)}`);
  }
  if (hidden) {
    parts.push('H:true');
  }
  return `WIFI:${parts.join(';')};;`;
}
