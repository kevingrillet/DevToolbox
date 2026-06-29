/**
 * Registre des générateurs de données factices. Ajouter un générateur (noms,
 * emails, dates…) = importer un plugin et l'ajouter ici — l'UI s'adapte seule
 * via les champs déclarés (`FakerField`).
 */
import type { FakerGenerator } from '../types';
import { loremGenerator } from './loremIpsum';
import { uuidGenerator } from './uuid';
import { personGenerator } from './person';
import { numberGenerator } from './number';

export const GENERATORS: FakerGenerator[] = [
  loremGenerator,
  uuidGenerator,
  personGenerator,
  numberGenerator,
];

export const GENERATORS_BY_ID = new Map<string, FakerGenerator>(
  GENERATORS.map((generator) => [generator.id, generator]),
);
