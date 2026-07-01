/**
 * Store du générateur de QR (pattern Command/Query).
 *
 * Tout l'état vit ici : type actif, valeurs PAR type (changer de type puis revenir
 * conserve la saisie), et le style du QR (couleurs, forme, correction, densité,
 * taille, logo) partagé entre la personnalisation et l'aperçu.
 *
 * Queries dérivées : `payload` (chaîne encodée), `errors` (validation de format) et
 * `ready` (formulaire complet ET valide → on ne génère le QR que dans ce cas).
 * Aucune persistance (cohérent avec « un outil démarre vierge »).
 */
import { useCallback, useMemo, useState } from 'react';
import {
  PAYLOAD_TYPES,
  getPayloadType,
  getErrors,
  isReady,
  type FieldErrors,
  type FieldValues,
  type PayloadType,
} from './lib/payloads';
import type { ErrorCorrectionLevel, ModuleShape, QrColors } from './lib/qr';

/** Construit l'état initial : les valeurs par défaut de chaque type. */
function buildInitialValues(): Record<string, FieldValues> {
  return Object.fromEntries(PAYLOAD_TYPES.map((type) => [type.id, { ...type.defaults }]));
}

export interface QrStore {
  activeId: string;
  activeType: PayloadType;
  values: FieldValues;
  colors: QrColors;
  shape: ModuleShape;
  ecLevel: ErrorCorrectionLevel;
  density: number;
  size: number;
  logo: string;
  payload: string;
  errors: FieldErrors;
  ready: boolean;
  setActiveId: (id: string) => void;
  setValue: (name: string, value: string | boolean) => void;
  setColors: (colors: QrColors) => void;
  setShape: (shape: ModuleShape) => void;
  setEcLevel: (level: ErrorCorrectionLevel) => void;
  setDensity: (density: number) => void;
  setSize: (size: number) => void;
  setLogo: (logo: string) => void;
}

export function useQrStore(): QrStore {
  const [activeId, setActiveId] = useState<string>(PAYLOAD_TYPES[0].id);
  const [valuesByType, setValuesByType] = useState<Record<string, FieldValues>>(buildInitialValues);

  // Style du QR, partagé entre la personnalisation et l'aperçu.
  const [colors, setColors] = useState<QrColors>({ dark: '#000000', light: '#ffffff' });
  const [shape, setShape] = useState<ModuleShape>('square');
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M');
  const [density, setDensity] = useState<number>(0); // 0 = automatique
  const [size, setSize] = useState<number>(512);
  const [logo, setLogo] = useState<string>('');

  // Un logo masque le centre du QR : on passe en correction « H » pour qu'il reste
  // scannable (sauf si l'utilisateur a déjà choisi un niveau élevé).
  const setLogoSafe = useCallback((next: string) => {
    setLogo(next);
    if (next) setEcLevel((current) => (current === 'L' || current === 'M' ? 'H' : current));
  }, []);

  const activeType = getPayloadType(activeId);
  const values = valuesByType[activeId];

  const setValue = useCallback(
    (name: string, value: string | boolean) => {
      setValuesByType((current) => ({
        ...current,
        [activeId]: { ...current[activeId], [name]: value },
      }));
    },
    [activeId],
  );

  // Le payload, les erreurs et l'état « prêt » sont dérivés des valeurs.
  const payload = useMemo(() => activeType.build(values), [activeType, values]);
  const errors = useMemo(() => getErrors(activeType, values), [activeType, values]);
  const ready = isReady(activeType, values) && Object.keys(errors).length === 0;

  return {
    activeId,
    activeType,
    values,
    colors,
    shape,
    ecLevel,
    density,
    size,
    logo,
    payload,
    errors,
    ready,
    setActiveId,
    setValue,
    setColors,
    setShape,
    setEcLevel,
    setDensity,
    setSize,
    setLogo: setLogoSafe,
  };
}
