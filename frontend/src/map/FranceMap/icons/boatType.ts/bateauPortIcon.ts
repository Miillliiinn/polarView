// Silhouette de bateau de service portuaire
export function createBateauPortIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Petite coque utilitaire, trapue et carrée
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.lineTo(9 * s, -16 * s);
  ctx.lineTo(10 * s, 22 * s);
  ctx.lineTo(-10 * s, 22 * s);
  ctx.lineTo(-9 * s, -16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Petite cabine centrale
  ctx.beginPath();
  ctx.rect(-4 * s, -4 * s, 8 * s, 10 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}