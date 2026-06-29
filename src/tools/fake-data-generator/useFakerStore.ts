/**
 * Store du générateur de données factices (pattern Command/Query).
 *
 * État : générateur courant, ses options, la graine, et un `nonce` (incrémenté
 * par « Régénérer »). Query : `output`, dérivé purement via le générateur et un
 * RNG construit à partir de la graine — ou, si elle est vide, du `nonce` (`auto-N`),
 * ce qui garde la sortie stable entre deux rendus tout en permettant de varier sur
 * demande. Aucune persistance.
 */
import { useCallback, useMemo, useState } from 'react';
import { GENERATORS, GENERATORS_BY_ID } from './lib/generators';
import { defaultOptions, type FakerGenerator, type FakerOptions } from './lib/types';
import { createRng } from './lib/rng';

const FIRST = GENERATORS[0];

export interface FakerStore {
  generatorId: string;
  generator: FakerGenerator;
  options: FakerOptions;
  seed: string;
  output: string;
  setGenerator: (id: string) => void;
  setOption: (key: string, value: string | number | boolean) => void;
  setSeed: (seed: string) => void;
  regenerate: () => void;
  reset: () => void;
}

export function useFakerStore(): FakerStore {
  const [generatorId, setGeneratorId] = useState(FIRST.id);
  const [options, setOptions] = useState<FakerOptions>(() => defaultOptions(FIRST));
  const [seed, setSeed] = useState('');
  const [nonce, setNonce] = useState(0);

  const generator = GENERATORS_BY_ID.get(generatorId) ?? FIRST;

  const output = useMemo(() => {
    const effectiveSeed = seed.trim() !== '' ? seed.trim() : `auto-${nonce}`;
    return generator.generate(options, { rng: createRng(effectiveSeed) });
  }, [generator, options, seed, nonce]);

  const setGenerator = useCallback((id: string) => {
    const next = GENERATORS_BY_ID.get(id);
    if (!next) return;
    setGeneratorId(id);
    setOptions(defaultOptions(next));
  }, []);

  const setOption = useCallback((key: string, value: string | number | boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const regenerate = useCallback(() => setNonce((n) => n + 1), []);

  const reset = useCallback(() => {
    setOptions(defaultOptions(generator));
    setSeed('');
    setNonce(0);
  }, [generator]);

  return {
    generatorId,
    generator,
    options,
    seed,
    output,
    setGenerator,
    setOption,
    setSeed,
    regenerate,
    reset,
  };
}
