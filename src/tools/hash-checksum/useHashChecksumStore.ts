/**
 * Store de l'outil Hash / Checksum (pattern Command/Query).
 *
 * Source = texte OU fichier (les deux s'excluent). Le hachage étant asynchrone
 * (`SubtleCrypto`), il est lancé par les commands (`setText`/`setFile`) — et non
 * dans un effet — puis les résultats sont déposés dans l'état. Un compteur de
 * requête (`requestId`) ignore les résultats périmés en cas de saisie rapide.
 * La comparaison avec un hash attendu est une query pure dérivée (`compareHash`).
 *
 * Aucune persistance (l'outil démarre vierge).
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { hashAll, type HashResult } from './lib/hash';
import { compareHash, type HashComparison } from './lib/compare';

const encoder = new TextEncoder();

export interface HashChecksumStore {
  text: string;
  fileName: string | null;
  fileSize: number | null;
  results: HashResult[] | null;
  computing: boolean;
  expected: string;
  comparison: HashComparison | null;
  setText: (text: string) => void;
  setFile: (file: File) => void;
  setExpected: (value: string) => void;
  reset: () => void;
}

export function useHashChecksumStore(): HashChecksumStore {
  const [text, setTextState] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [results, setResults] = useState<HashResult[] | null>(null);
  const [computing, setComputing] = useState(false);
  const [expected, setExpected] = useState('');
  const requestId = useRef(0);

  const runHash = useCallback((bytes: Uint8Array | null) => {
    const id = ++requestId.current;
    if (!bytes) {
      setResults(null);
      setComputing(false);
      return;
    }
    setComputing(true);
    hashAll(bytes)
      .then((res) => {
        if (id === requestId.current) {
          setResults(res);
          setComputing(false);
        }
      })
      .catch(() => {
        if (id === requestId.current) {
          setResults(null);
          setComputing(false);
        }
      });
  }, []);

  const setText = useCallback(
    (value: string) => {
      setTextState(value);
      setFileName(null);
      setFileSize(null);
      runHash(value ? encoder.encode(value) : null);
    },
    [runHash],
  );

  const setFile = useCallback(
    (file: File) => {
      void file.arrayBuffer().then((buffer) => {
        setTextState('');
        setFileName(file.name);
        setFileSize(file.size);
        runHash(new Uint8Array(buffer));
      });
    },
    [runHash],
  );

  const reset = useCallback(() => {
    setTextState('');
    setFileName(null);
    setFileSize(null);
    setExpected('');
    runHash(null);
  }, [runHash]);

  const comparison = useMemo<HashComparison | null>(
    () => (results ? compareHash(expected, results) : null),
    [expected, results],
  );

  return {
    text,
    fileName,
    fileSize,
    results,
    computing,
    expected,
    comparison,
    setText,
    setFile,
    setExpected,
    reset,
  };
}
