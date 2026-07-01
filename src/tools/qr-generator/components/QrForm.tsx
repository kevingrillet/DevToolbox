/**
 * Formulaire dynamique : rend les champs décrits par le type de contenu actif.
 *
 * Le composant ne connaît AUCUN type de QR en particulier — il se contente
 * d'afficher la liste `type.fields` et de remonter les changements via `onChange`.
 * Ajouter un nouveau type dans le registre suffit à le rendre éditable ici.
 */
import type { FieldDef, FieldErrors, FieldValues, PayloadType } from '../lib/payloads';
import { useQrT } from '../i18n';

export interface QrFormProps {
  type: PayloadType;
  values: FieldValues;
  onChange: (name: string, value: string | boolean) => void;
  /** Erreurs de validation par champ (clé i18n), affichées sous le contrôle concerné. */
  errors?: FieldErrors;
}

/** Classes communes aux champs texte/select pour rester cohérent. */
const INPUT_CLASS =
  'w-full rounded-control border bg-input px-3 py-2 text-fg shadow-card transition focus:border-accent-strong focus:outline-hidden focus:ring-2 focus:ring-accent-strong';

/** Classes ajoutées à un champ en erreur (bordure + anneau de focus). */
const INVALID_CLASS = 'border-danger focus:border-danger focus:ring-danger';

function FieldControl({
  field,
  value,
  onChange,
  invalid = false,
  describedBy,
}: {
  field: FieldDef;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const { t } = useQrT();
  const id = `field-${field.name}`;
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined;
  // Attributs d'accessibilité partagés par les contrôles « en erreur ».
  const a11y = invalid ? { 'aria-invalid': true, 'aria-describedby': describedBy } : {};
  const inputClass = invalid ? `${INPUT_CLASS} ${INVALID_CLASS}` : INPUT_CLASS;

  if (field.type === 'textarea') {
    return (
      <textarea
        id={id}
        rows={3}
        className={inputClass}
        placeholder={placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        {...a11y}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        id={id}
        className={inputClass}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        {...a11y}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <input
        id={id}
        type="checkbox"
        className="h-5 w-5 rounded-sm border bg-input accent-accent focus:ring-accent-strong"
        checked={value === true}
        onChange={(event) => onChange(event.target.checked)}
        {...a11y}
      />
    );
  }

  // Champs texte simples : text, password, tel, email, url, number.
  return (
    <input
      id={id}
      type={field.type}
      className={inputClass}
      placeholder={placeholder}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      {...a11y}
    />
  );
}

export function QrForm({ type, values, onChange, errors = {} }: QrFormProps) {
  const { t } = useQrT();
  const fields = type.fields.map((field) => {
    const id = `field-${field.name}`;
    const errorId = `${id}-error`;
    const value = values[field.name] ?? (field.type === 'checkbox' ? false : '');
    const errorKey = errors[field.name];

    // Les cases à cocher s'affichent en ligne (case + libellé à droite).
    if (field.type === 'checkbox') {
      return (
        <div key={field.name} className="flex items-center gap-2">
          <FieldControl field={field} value={value} onChange={(v) => onChange(field.name, v)} />
          <label htmlFor={id} className="text-sm text-fg">
            {t(field.labelKey)}
          </label>
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium text-fg">
          {t(field.labelKey)}
          {field.required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
        <FieldControl
          field={field}
          value={value}
          onChange={(v) => onChange(field.name, v)}
          invalid={Boolean(errorKey)}
          describedBy={errorKey ? errorId : undefined}
        />
        {errorKey && (
          <p id={errorId} role="alert" className="text-sm text-danger">
            {t(errorKey)}
          </p>
        )}
      </div>
    );
  });

  // Les types à plusieurs champs forment un ensemble cohérent : on les regroupe
  // dans un <fieldset> (RGAA 11.5). La <legend> est masquée visuellement (le type
  // est déjà indiqué par l'onglet actif et le titre de section) mais reste
  // annoncée par les lecteurs d'écran.
  return (
    <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
      {type.fields.length > 1 ? (
        <fieldset className="m-0 min-w-0 space-y-4 border-0 p-0">
          <legend className="sr-only">{t(type.labelKey)}</legend>
          {fields}
        </fieldset>
      ) : (
        fields
      )}
    </form>
  );
}
