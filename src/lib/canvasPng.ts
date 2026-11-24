const PNG = 'image/png';

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), PNG);
  });
}

export function canCopyPng(): boolean {
  return typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function';
}

export async function copyPng(blob: Promise<Blob>): Promise<void> {
  // La promesse permet d'initier l'écriture dans le geste utilisateur (Safari).
  await navigator.clipboard.write([new ClipboardItem({ [PNG]: blob })]);
}
