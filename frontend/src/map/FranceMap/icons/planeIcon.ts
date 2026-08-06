// Silhouette d'avion 
export function createPlaneIcon(color: string, size = 96): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  ctx.beginPath();
  ctx.moveTo(0, -45 * s);
  ctx.lineTo(4 * s, -30 * s);
  ctx.lineTo(4 * s, -5 * s);
  ctx.lineTo(42 * s, 12 * s);
  ctx.lineTo(42 * s, 18 * s);
  ctx.lineTo(5 * s, 8 * s);
  ctx.lineTo(5 * s, 28 * s);
  ctx.lineTo(16 * s, 38 * s);
  ctx.lineTo(16 * s, 43 * s);
  ctx.lineTo(2 * s, 35 * s);
  ctx.lineTo(0, 45 * s);
  ctx.lineTo(-2 * s, 35 * s);
  ctx.lineTo(-16 * s, 43 * s);
  ctx.lineTo(-16 * s, 38 * s);
  ctx.lineTo(-5 * s, 28 * s);
  ctx.lineTo(-5 * s, 8 * s);
  ctx.lineTo(-42 * s, 18 * s);
  ctx.lineTo(-42 * s, 12 * s);
  ctx.lineTo(-4 * s, -5 * s);
  ctx.lineTo(-4 * s, -30 * s);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}
