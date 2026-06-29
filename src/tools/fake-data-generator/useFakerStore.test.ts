import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFakerStore } from './useFakerStore';
import { GENERATORS } from './lib/generators';

describe('useFakerStore', () => {
  it('produit une sortie non vide et stable pour une graine fixée', () => {
    const { result } = renderHook(() => useFakerStore());
    act(() => result.current.setSeed('graine-1'));
    const out = result.current.output;
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
    expect(result.current.seed).toBe('graine-1');
  });

  it('change de générateur et réinitialise ses options', () => {
    const { result } = renderHook(() => useFakerStore());
    const other = GENERATORS[1];
    act(() => result.current.setGenerator(other.id));
    expect(result.current.generatorId).toBe(other.id);
    expect(result.current.generator.id).toBe(other.id);
  });

  it('ignore un générateur inconnu', () => {
    const { result } = renderHook(() => useFakerStore());
    const before = result.current.generatorId;
    act(() => result.current.setGenerator('inconnu'));
    expect(result.current.generatorId).toBe(before);
  });

  it('met à jour une option', () => {
    const { result } = renderHook(() => useFakerStore());
    const field = result.current.generator.fields[0];
    expect(field).toBeDefined();
    if (!field) return;
    const value =
      field.kind === 'number'
        ? field.max
        : field.kind === 'boolean'
          ? !field.default
          : field.default;
    act(() => result.current.setOption(field.key, value));
    expect(result.current.options[field.key]).toBe(value);
  });

  it('regenerate fait varier la sortie auto et reset remet à zéro', () => {
    const { result } = renderHook(() => useFakerStore());
    expect(typeof result.current.output).toBe('string');
    act(() => result.current.regenerate());
    expect(typeof result.current.output).toBe('string');
    act(() => result.current.setSeed('abc'));
    act(() => result.current.reset());
    expect(result.current.seed).toBe('');
  });
});
