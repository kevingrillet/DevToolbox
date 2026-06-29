/**
 * Store de l'encodeur/décodeur (pattern Command/Query).
 *
 * État : format sélectionné, sens (encode/décode pour les codecs), texte d'entrée.
 * Queries (dérivées, pures) : `codecResult` ou `jwtResult` selon le format.
 * Commands : changer de format/sens, saisir, intervertir, réinitialiser.
 *
 * Aucune persistance (conforme à la spec : l'outil démarre vierge à chaque visite).
 * Les composants de présentation ne contiennent aucune logique métier.
 */
import { useCallback, useMemo, useState } from 'react';
import { CODECS_BY_ID, FORMATS_BY_ID } from './lib/codecs';
import type { CodecResult } from './lib/types';
import { decodeJwt, type JwtResult } from './lib/jwt';

export type Direction = 'encode' | 'decode';

export interface EncoderStore {
  // état
  formatId: string;
  direction: Direction;
  input: string;
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
  swap: () => void;
  reset: () => void;
}

export function useEncoderStore(): EncoderStore {
  const [formatId, setFormatId] = useState('base64');
  const [direction, setDirectionState] = useState<Direction>('encode');
  const [input, setInputState] = useState('');

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
  const setInput = useCallback((value: string) => setInputState(value), []);
  const reset = useCallback(() => setInputState(''), []);

  // Intervertir : la sortie courante devient l'entrée, et le sens s'inverse — de
  // sorte que la nouvelle sortie reproduit l'entrée d'origine (aller-retour).
  const swap = useCallback(() => {
    const codec = CODECS_BY_ID.get(formatId);
    if (!codec) return; // JWT : pas d'interversion
    const result = direction === 'encode' ? codec.encode(input) : codec.decode(input);
    if (result.ok) {
      setInputState(result.value);
      setDirectionState((current) => (current === 'encode' ? 'decode' : 'encode'));
    }
  }, [formatId, direction, input]);

  return {
    formatId,
    direction,
    input,
    isJwt,
    codecResult,
    jwtResult,
    setFormat,
    setDirection,
    setInput,
    swap,
    reset,
  };
}
