import { canCopyPng, canvasToPng, copyPng } from '../../../lib/canvasPng';
import { INPUT_LIMITS, isInputTooLarge } from '../../../lib/inputLimits';

const PADDING = 14;
const MAX_DIMENSION = 16_000;
const MAX_PIXELS = 16_000_000;

interface Run {
  text: string;
  color: string;
}

interface PositionedRun extends Run {
  x: number;
}

export class CodeImageSizeError extends Error {}

/** Place les segments colorés dans les lignes logiques, tabulations comprises. */
export function layoutCodeLines(runs: Run[], measure: (text: string) => number, tabSize: number) {
  const firstLine: PositionedRun[] = [];
  const lines = [firstLine];
  const tabWidth = tabSize * measure(' ');
  let line = firstLine;
  let x = 0;
  let width = 0;

  for (const { text, color } of runs) {
    for (const part of text.split(/([\n\t])/)) {
      if (part === '\n') {
        width = Math.max(width, x);
        line = [];
        lines.push(line);
        x = 0;
      } else if (part === '\t') {
        x = (Math.floor(x / tabWidth) + 1) * tabWidth;
      } else if (part !== '') {
        line.push({ text: part, color, x });
        x += measure(part);
      }
    }
  }

  return { lines, width: Math.max(width, x) };
}

function readRuns(editor: HTMLElement, source: string, color: string): Run[] {
  const highlighted = editor.querySelector('.syntax-editor-highlight code');
  if (highlighted?.textContent !== source) return [{ text: source, color }];

  const walker = editor.ownerDocument.createTreeWalker(highlighted, NodeFilter.SHOW_TEXT);
  const runs: Run[] = [];
  let node = walker.nextNode();
  while (node) {
    if (node.textContent) {
      const textColor = node.parentElement ? getComputedStyle(node.parentElement).color : color;
      const previous = runs.at(-1);
      if (previous?.color === textColor) previous.text += node.textContent;
      else runs.push({ text: node.textContent, color: textColor });
    }
    node = walker.nextNode();
  }
  return runs;
}

function fitsCanvas(width: number, height: number): boolean {
  return width <= MAX_DIMENSION && height <= MAX_DIMENSION && width * height <= MAX_PIXELS;
}

function renderCodeImage(editor: HTMLElement, value: string): HTMLCanvasElement {
  if (isInputTooLarge(value, INPUT_LIMITS.syntaxHighlight)) throw new CodeImageSizeError();
  const source = value.replace(/\r\n?/g, '\n');
  const style = getComputedStyle(editor);
  const canvas = editor.ownerDocument.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');

  const font = `${style.fontSize} ${style.fontFamily}`;
  const lineHeight = Number.parseFloat(style.lineHeight);
  context.font = font;
  const measure = (text: string) => context.measureText(text).width;
  const { lines, width } = layoutCodeLines(
    readRuns(editor, source, style.color),
    measure,
    Number.parseFloat(style.tabSize),
  );
  const numberWidth = Math.ceil(measure(String(lines.length)));
  const codeX = 3 * PADDING + numberWidth;
  const imageWidth = Math.ceil(codeX + width + PADDING);
  const imageHeight = Math.ceil(2 * PADDING + lines.length * lineHeight);
  if (!fitsCanvas(imageWidth, imageHeight)) throw new CodeImageSizeError();
  const scale = fitsCanvas(imageWidth * 2, imageHeight * 2) ? 2 : 1;
  canvas.width = imageWidth * scale;
  canvas.height = imageHeight * scale;
  context.scale(scale, scale);

  const roots = getComputedStyle(editor.ownerDocument.documentElement);
  context.fillStyle = roots.getPropertyValue('--color-canvas').trim();
  context.fillRect(0, 0, imageWidth, imageHeight);
  context.fillStyle = style.backgroundColor;
  context.fillRect(0, 0, imageWidth, imageHeight);

  const gutter = editor.querySelector('.syntax-editor-gutter');
  const gutterStyle = gutter ? getComputedStyle(gutter) : style;
  context.fillStyle = gutterStyle.backgroundColor;
  context.fillRect(0, 0, codeX - PADDING, imageHeight);
  context.fillStyle = gutterStyle.borderInlineEndColor;
  context.fillRect(codeX - PADDING, 0, 1, imageHeight);

  context.font = font;
  context.textBaseline = 'middle';
  lines.forEach((line, index) => {
    const y = PADDING + (index + 0.5) * lineHeight;
    context.fillStyle = gutterStyle.color;
    context.textAlign = 'right';
    context.fillText(String(index + 1), PADDING + numberWidth, y);
    context.textAlign = 'left';
    for (const segment of line) {
      context.fillStyle = segment.color;
      context.fillText(segment.text, codeX + segment.x, y);
    }
  });
  return canvas;
}

export async function copyCodeImage(
  editor: HTMLElement,
  source: string,
): Promise<'copied' | 'downloaded'> {
  const blob = canvasToPng(renderCodeImage(editor, source));
  if (canCopyPng()) {
    try {
      await copyPng(blob);
      return 'copied';
    } catch {
      // Le navigateur ou ses permissions peuvent bloquer l'écriture d'images.
    }
  }

  const url = URL.createObjectURL(await blob);
  const link = editor.ownerDocument.createElement('a');
  link.href = url;
  link.download = 'devtoolbox-code.png';
  editor.ownerDocument.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return 'downloaded';
}
