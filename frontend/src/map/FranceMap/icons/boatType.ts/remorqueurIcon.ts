// Silhouette de remorqueur
export function createRemorqueurIcon(color: string, size = 96): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque courte, trapue, large maître-bau
  ctx.beginPath();
  ctx.moveTo(0, -30 * s);
  ctx.lineTo(12 * s, -14 * s);
  ctx.lineTo(14 * s, 12 * s);
  ctx.lineTo(9 * s, 30 * s);
  ctx.lineTo(-9 * s, 30 * s);
  ctx.lineTo(-14 * s, 12 * s);
  ctx.lineTo(-12 * s, -14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Timonerie centrale surélevée
  ctx.beginPath();
  ctx.rect(-6 * s, -6 * s, 12 * s, 14 * s);
  ctx.fill();
  ctx.stroke();

  // Cheminée
  ctx.beginPath();
  ctx.rect(-3 * s, 10 * s, 6 * s, 8 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}