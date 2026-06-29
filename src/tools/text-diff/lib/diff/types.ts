/**
 * Types partagés du diff. Les trois granularités (caractère / mot / ligne)
 * produisent toutes un `DiffOp[]`, ce qui permet d'avoir un composant d'affichage
 * unique (`DiffView`) indépendant de l'algorithme.
 */
export type DiffOpType = 'equal' | 'insert' | 'delete';

export interface DiffOp {
  type: DiffOpType;
  value: string;
}

export type Granularity = 'char' | 'word' | 'line';

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}
