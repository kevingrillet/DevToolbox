/**
 * Store de l'encodeur/décodeur (pattern Command/Query).
 *
 * État : format sélectionné, sens (encode/décode pour les codecs), texte d'entrée.
 * Queries (dérivées, pures) : `codecResult` ou `jwtResult` selon le format.
 * Commands : changer de format/sens, saisir, intervertir, réinitialiser.
 *
 * L'entrée peut être conservée en cache (toggle opt-in, désactivé par défaut) :
 * l'outil reste vierge au premier chargement, conformément à la philosophie du
 * projet. Les composants de présentation ne contiennent aucune logique métier.
 */
import { useCallback, useMemo, useState } from 'react';
import { CODECS_BY_ID, FORMATS_BY_ID } from './lib/codecs';
import type { CodecResult } from './lib/types';
import { decodeJwt, type JwtResult } from './lib/jwt';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';

export type Direction = 'encode' | 'decode';

export interface EncoderStore {
  // état
  formatId: string;
  direction: Direction;
  input: string;
  cacheEnabled: boolean;
  // dérivés
  isJwt: boolean;
  /** Résultat codec (null si le format courant est le JWT). */
  codecResult: CodecResult | null;
  /** Résultat JWT (null si le format courant est un codec). */
  jwtResult: JwtResult | null;
  // commands
  setFormat: (id: string) => void;
  setDirection: (direction: Direction) => void;
  setInput: (value: string) => void;
  setCacheEnabled: (value: boolean) => void;
  swap: () => void;
  reset: () => void;
}

export function useEncoderStore(): EncoderStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:encoder:cache');
  const [formatId, setFormatId] = useState('base64');
  const [direction, setDirectionState] = useState<Direction>('encode');
  const [input, setInput] = useCachedState('devtools:encoder:input', cacheEnabled);

  const isJwt = FORMATS_BY_ID.get(formatId)?.kind === 'jwt';

  const codecResult = useMemo<CodecResult | null>(() => {
    if (isJwt) return null;
    const codec = CODECS_BY_ID.get(formatId);
    if (!codec) return null;
    return direction === 'encode' ? codec.encode(input) : codec.decode(input);
  }, [isJwt, formatId, direction, input]);

  const jwtResult = useMemo<JwtResult | null>(
    () => (isJwt ? decodeJwt(input) : null),
    [isJwt, input],
  );

  const setFormat = useCallback((id: string) => setFormatId(id), []);
  const setDirection = useCallback((next: Direction) => setDirectionState(next), []);
  const reset = useCallback(() => setInput(''), [setInput]);

  // Intervertir : la sortie courante devient l'entrée, et le sens s'inverse — de
  // sorte que la nouvelle sortie reproduit l'entrée d'origine (aller-retour).
  const swap = useCallback(() => {
    const codec = CODECS_BY_ID.get(formatId);
    if (!codec) return; // JWT : pas d'interversion
    const result = direction === 'encode' ? codec.encode(input) : codec.decode(input);
    if (result.ok) {
      setInput(result.value);
      setDirectionState((current) => (current === 'encode' ? 'decode' : 'encode'));
    }
  }, [formatId, direction, input, setInput]);

  return {
    formatId,
    direction,
    input,
    cacheEnabled,
    isJwt,
    codecResult,
    jwtResult,
    setFormat,
    setDirection,
    setInput,
    setCacheEnabled,
    swap,
    reset,
  };
}
