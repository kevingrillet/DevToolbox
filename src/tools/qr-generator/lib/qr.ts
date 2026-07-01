/**
 * Adaptateur autour de la librairie `qr-code-styling` (pattern Adapter).
 *
 * Tout le reste de l'outil passe par ce module pour générer/télécharger un QR.
 * `qr-code-styling` permet, en plus des couleurs, de styliser la FORME des modules
 * (carré, points, arrondi) et d'exporter en PNG (canvas) ou SVG.
 *
 * On expose :
 *  - `toStylingOptions` : transforme NOS options en options de la lib (fonction pure,
 *    testable sans DOM) ;
 *  - `createQr` : crée une instance prête à être `append`/`update` dans le DOM ;
 *  - `downloadQr` : exporte le QR dans un fichier (PNG/SVG) à la taille voulue.
 *
 * L'aperçu à l'écran est rendu en `<canvas>` (type par défaut) afin que le clic
 * droit « Copier l'image » du navigateur reste disponible.
 */
import QRCodeStyling, {
  type Options,
  type DotType,
  type CornerSquareType,
  type TypeNumber,
} from 'qr-code-styling';

/** Niveau de correction d'erreur (plus haut = plus robuste mais plus dense). */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** Forme des modules proposée dans l'UI (vocabulaire métier, indépendant de la lib). */
export type ModuleShape = 'square' | 'dots' | 'rounded';

export interface QrColors {
  /** Couleur des modules (premier plan). */
  dark: string;
  /** Couleur du fond. */
  light: string;
}

export interface QrRenderOptions {
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** Marge (quiet zone) en pixels. */
  margin?: number;
  /** Largeur/hauteur du rendu en pixels. */
  width?: number;
  colors?: QrColors;
  /** Forme des modules. */
  shape?: ModuleShape;
  /**
   * Densité = version du QR (1 à 40, soit 21×21 à 177×177 modules).
   * `0` (défaut) = automatique : la plus petite version qui contient les données
   * au niveau de correction choisi (table de capacité standard ISO/IEC 18004).
   */
  typeNumber?: number;
  /**
   * Logo à incruster au centre (data URL ou URL d'image). Masque une partie des
   * modules : prévoir un niveau de correction élevé (Q/H) pour rester scannable.
   */
  image?: string;
}

const DEFAULT_DARK = '#000000';
const DEFAULT_LIGHT = '#ffffff';

/** Correspondance forme métier → type de module `qr-code-styling`. */
const SHAPE_TO_DOTS: Record<ModuleShape, DotType> = {
  square: 'square',
  dots: 'dots',
  rounded: 'extra-rounded',
};

/** Correspondance forme métier → type des « yeux » (carrés de positionnement). */
const SHAPE_TO_CORNERS: Record<ModuleShape, CornerSquareType> = {
  square: 'square',
  dots: 'dot',
  rounded: 'extra-rounded',
};

/**
 * Transforme nos options en options `qr-code-styling`. Fonction PURE (aucun accès
 * DOM) : c'est le cœur testable de l'adaptateur.
 */
export function toStylingOptions(text: string, options: QrRenderOptions = {}): Options {
  const size = options.width ?? 256;
  const dark = options.colors?.dark ?? DEFAULT_DARK;
  const light = options.colors?.light ?? DEFAULT_LIGHT;
  const shape = options.shape ?? 'square';
  return {
    type: 'canvas',
    width: size,
    height: size,
    margin: options.margin ?? 8,
    data: text,
    image: options.image,
    imageOptions: { imageSize: 0.35, margin: 4, hideBackgroundDots: true },
    qrOptions: {
      errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
      typeNumber: (options.typeNumber ?? 0) as TypeNumber,
    },
    dotsOptions: { type: SHAPE_TO_DOTS[shape], color: dark },
    cornersSquareOptions: { type: SHAPE_TO_CORNERS[shape], color: dark },
    cornersDotOptions: { color: dark },
    backgroundOptions: { color: light },
  };
}

/** Crée une instance prête à `append(container)` puis `update(...)` pour l'aperçu. */
export function createQr(text: string, options?: QrRenderOptions): QRCodeStyling {
  return new QRCodeStyling(toStylingOptions(text, options));
}

/**
 * Exporte le QR dans un fichier. `extension` détermine le format ; la même
 * instance sait produire un PNG (canvas) ou un SVG.
 */
export async function downloadQr(
  text: string,
  filename: string,
  extension: 'png' | 'svg',
  options?: QrRenderOptions,
): Promise<void> {
  const qr = createQr(text, options);
  await qr.download({ name: filename, extension });
}
