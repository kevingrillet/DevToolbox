/**
 * Payload "Géolocalisation" — ouvre une position GPS dans l'application de cartes.
 * Format : geo:<latitude>,<longitude>
 */
export interface GeoData {
  latitude: string;
  longitude: string;
}

export function buildGeo({ latitude, longitude }: GeoData): string {
  return `geo:${latitude.trim()},${longitude.trim()}`;
}
