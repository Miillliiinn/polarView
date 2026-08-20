// Silhouette pour type de navire non spécifié (convention AIS : cercle)
export function createNonSpecifieIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Cercle neutre : différencie visuellement "non spécifié" du losange "inconnu"
  ctx.beginPath();
  ctx.arc(0, 0, 26 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}