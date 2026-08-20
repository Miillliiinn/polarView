// Silhouette de bateau de plaisance
export function createPlaisanceIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Petite coque effilée et fine, type bateau à moteur privé
  ctx.beginPath();
  ctx.moveTo(0, -35 * s);
  ctx.lineTo(6 * s, -15 * s);
  ctx.lineTo(7 * s, 18 * s);
  ctx.lineTo(4 * s, 32 * s);
  ctx.lineTo(-4 * s, 32 * s);
  ctx.lineTo(-7 * s, 18 * s);
  ctx.lineTo(-6 * s, -15 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Petit pare-brise / console
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.moveTo(-4 * s, -4 * s);
  ctx.lineTo(4 * s, -4 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}