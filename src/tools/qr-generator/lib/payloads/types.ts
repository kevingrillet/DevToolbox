/**
 * Types partagés de la couche "payloads".
 *
 * Un *payload* est la chaîne de caractères qui sera réellement encodée dans le QR
 * code. Chaque type de contenu (texte, WiFi, vCard…) expose :
 *  - la liste de ses champs de formulaire (`fields`) — utilisée par l'UI pour se
 *    générer dynamiquement (pattern Registry/Factory) ;
 *  - des valeurs par défaut (`defaults`) ;
 *  - une fonction pure `build(values)` qui transforme les valeurs en chaîne QR
 *    (pattern Strategy).
 *
 * Aucune dépendance à React ici : cette couche est testable unitairement seule.
 */

/** Types de champ supportés par le formulaire dynamique. */
export type FieldType =
  'text' | 'textarea' | 'password' | 'tel' | 'email' | 'url' | 'number' | 'checkbox' | 'select';

/** Option d'un champ de type `select`. */
export interface FieldOption {
  value: string;
  /** Clé i18n du libellé de l'option. */
  labelKey: string;
}

/**
 * Description d'un champ de formulaire, consommée par le composant `QrForm`.
 * Les textes affichés ne sont pas stockés ici mais référencés par des clés i18n
 * (résolues via `useQrT().t`), ce qui découple le registre de la langue.
 */
export interface FieldDef {
  /** Clé de la valeur dans l'objet de valeurs du formulaire. */
  name: string;
  /** Clé i18n du libellé affiché à l'utilisateur. */
  labelKey: string;
  /** Type de contrôle à rendre. */
  type: FieldType;
  /** Clé i18n du texte d'aide (placeholder), si présent. */
  placeholderKey?: string;
  /** Si vrai, le champ doit être renseigné pour générer le QR. */
  required?: boolean;
  /** Options disponibles pour un champ `select`. */
  options?: FieldOption[];
}

/**
 * Valeurs du formulaire : une map clé → valeur.
 * Les champs `checkbox` produisent un booléen, tous les autres une chaîne.
 */
export type FieldValues = Record<string, string | boolean>;

/**
 * Erreurs de validation : nom de champ → clé i18n du message d'erreur.
 * Un objet vide signifie « aucune erreur ».
 */
export type FieldErrors = Record<string, string>;

/** Définition complète d'un type de contenu QR (entrée du registre). */
export interface PayloadType {
  /** Identifiant stable (utilisé dans l'URL/état). */
  id: string;
  /** Clé i18n du libellé affiché dans le sélecteur de type. */
  labelKey: string;
  /** Clé i18n de la courte description du type de contenu. */
  descriptionKey: string;
  /** Champs de formulaire à afficher. */
  fields: FieldDef[];
  /** Valeurs initiales du formulaire. */
  defaults: FieldValues;
  /** Construit la chaîne à encoder à partir des valeurs du formulaire. */
  build: (values: FieldValues) => string;
  /**
   * Validation optionnelle du *format* des valeurs saisies. Ne contrôle PAS la
   * présence des champs requis (rôle de `isReady`) : un champ vide ne doit jamais
   * produire d'erreur ici. Retourne les erreurs par champ (objet vide si tout va bien).
   */
  validate?: (values: FieldValues) => FieldErrors;
}

/** Récupère une valeur texte depuis l'objet de valeurs (sécurisé). */
export function readString(values: FieldValues, key: string): string {
  const value = values[key];
  return typeof value === 'string' ? value : '';
}

/** Récupère une valeur booléenne depuis l'objet de valeurs (sécurisé). */
export function readBoolean(values: FieldValues, key: string): boolean {
  return values[key] === true;
}
