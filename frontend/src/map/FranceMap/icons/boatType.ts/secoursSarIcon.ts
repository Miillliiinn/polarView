// Silhouette de navire de secours / SAR (recherche et sauvetage)
export function createSecoursSarIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Petite coque robuste (canot de sauvetage)
  ctx.beginPath();
  ctx.moveTo(0, -34 * s);
  ctx.lineTo(7 * s, -16 * s);
  ctx.lineTo(8 * s, 24 * s);
  ctx.lineTo(-8 * s, 24 * s);
  ctx.lineTo(-7 * s, -16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Croix de secours au centre
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-1.8 * s, -8 * s, 3.6 * s, 16 * s);
  ctx.rect(-8 * s, -1.8 * s, 16 * s, 3.6 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}