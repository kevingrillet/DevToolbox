/**
 * Suggestion de couleurs de texte accessibles : ajuste une couleur d'avant-plan
 * vers le noir ou le blanc (celui qui contraste le mieux avec le fond) jusqu'à
 * atteindre un rapport de contraste cible.
 *
 * Le contraste le long du mélange `fg → extrême` n'est PAS globalement monotone
 * (si `fg` et l'extrême sont de part et d'autre du fond, il plonge vers 1 puis
 * remonte). Mais comme on n'entre dans la recherche qu'après avoir écarté le cas
 * « `fg` déjà conforme », le contraste de départ est sous la cible : l'ensemble
 * des mélanges atteignant la cible est alors un unique intervalle haut
 * `[t*, 1]`, et une recherche binaire trouve bien le mélange minimal `t*`.
 */
import { contrastRatio, mix, type RGB } from './color';

const BLACK: RGB = { r: 0, g: 0, b: 0 };
const WHITE: RGB = { r: 255, g: 255, b: 255 };

/**
 * Renvoie une variante de `fg` atteignant `targetRatio` sur le fond `bg`, ou null
 * si c'est impossible même à l'extrême (noir/blanc). Renvoie `fg` inchangé s'il
 * est déjà conforme.
 */
export function suggestForeground(fg: RGB, bg: RGB, targetRatio: number): RGB | null {
  // Direction qui augmente le contraste : l'extrême (noir ou blanc) qui contraste
  // le mieux avec le fond. Le choisir par le seuil de luminance 0.5 serait faux —
  // pour des fonds intermédiaires, le meilleur extrême n'est pas toujours celui-là.
  const extreme = bestBwText(bg);
  if (contrastRatio(extreme, bg) < targetRatio) return null;
  if (contrastRatio(fg, bg) >= targetRatio) return fg;

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mix(fg, extreme, mid), bg) >= targetRatio) hi = mid;
    else lo = mid;
  }
  return mix(fg, extreme, hi);
}

/** Renvoie noir ou blanc, selon celui qui contraste le mieux avec `bg`. */
export function bestBwText(bg: RGB): RGB {
  return contrastRatio(WHITE, bg) >= contrastRatio(BLACK, bg) ? WHITE : BLACK;
}
