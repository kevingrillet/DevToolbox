/**
 * Champ de couleur : sélecteur natif (`<input type="color">`) + saisie hex
 * synchronisés. Le champ hex passe en état invalide si la valeur n'est pas
 * analysable ; le sélecteur retombe alors sur du noir.
 */
import { cx } from '../../../lib/cx';
import { parseHex, toHex } from '../lib/color';

export interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const parsed = parseHex(value);
  const pickerValue = parsed ? toHex(parsed) : '#000000';

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-9 w-10 shrink-0 cursor-pointer rounded-control border bg-surface p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} (hex)`}
        spellCheck={false}
        className={cx(
          'h-9 w-28 rounded-control border bg-input px-2 font-mono text-sm text-fg',
          !parsed && 'border-danger',
        )}
      />
    </div>
  );
}
