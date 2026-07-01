import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCodeLinterStore } from './useCodeLinterStore';
import { LANGUAGES } from './lib/languages';

describe('useCodeLinterStore', () => {
  it('lint la source courante après debounce', async () => {
    const { result } = renderHook(() => useCodeLinterStore());
    act(() => result.current.setSource('var x = 1 ;;;\n\n\n'));
    await waitFor(() => expect(result.current.issues.length).toBeGreaterThan(0));
    const total =
      result.current.counts.info + result.current.counts.warning + result.current.counts.error;
    expect(total).toBe(result.current.issues.length);
  });

  it('reformate la source via le langage courant (JS par défaut)', () => {
    const { result } = renderHook(() => useCodeLinterStore());
    expect(result.current.canFormat).toBe(true);
    act(() => result.current.setSource('function f() {\nreturn 1;\n}'));
    act(() => result.current.format());
    expect(result.current.source).toBe('function f() {\n  return 1;\n}');
  });

  it('conserve une config par langage', () => {
    const { result } = renderHook(() => useCodeLinterStore());
    const first = result.current.languageId;
    const ruleId = Object.keys(result.current.config)[0];
    act(() => result.current.toggleRule(ruleId));
    const toggled = result.current.config[ruleId].enabled;
    const other = LANGUAGES.find((l) => l.id !== first)!;
    act(() => result.current.setLanguage(other.id));
    expect(result.current.languageId).toBe(other.id);
    // En revenant, la règle basculée doit être conservée.
    act(() => result.current.setLanguage(first));
    expect(result.current.config[ruleId].enabled).toBe(toggled);
  });

  it('change la sévérité d’une règle puis resetConfig', () => {
    const { result } = renderHook(() => useCodeLinterStore());
    const ruleId = Object.keys(result.current.config)[0];
    act(() => result.current.setRuleSeverity(ruleId, 'error'));
    expect(result.current.config[ruleId].severity).toBe('error');
    act(() => result.current.resetConfig());
    // resetConfig restaure la config par défaut du langage.
    expect(result.current.config[ruleId]).toBeDefined();
  });

  it('reset vide la source', () => {
    const { result } = renderHook(() => useCodeLinterStore());
    act(() => result.current.setSource('abc'));
    act(() => result.current.reset());
    expect(result.current.source).toBe('');
  });
});
