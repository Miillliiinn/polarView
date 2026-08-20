// Silhouette de vedette de police
export function createPoliceIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque rapide et fine
  ctx.beginPath();
  ctx.moveTo(0, -36 * s);
  ctx.lineTo(6 * s, -18 * s);
  ctx.lineTo(7 * s, 25 * s);
  ctx.lineTo(-7 * s, 25 * s);
  ctx.lineTo(-6 * s, -18 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rampe de gyrophares (barre lumineuse) sur le pont avant
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-4 * s, -4 * s, 8 * s, 2.5 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}