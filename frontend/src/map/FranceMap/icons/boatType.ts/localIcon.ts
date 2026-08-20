// Silhouette de navire local (trafic local)
export function createLocalIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque simple, générique, sans détail particulier
  ctx.beginPath();
  ctx.moveTo(0, -30 * s);
  ctx.lineTo(6 * s, -16 * s);
  ctx.lineTo(7 * s, 25 * s);
  ctx.lineTo(-7 * s, 25 * s);
  ctx.lineTo(-6 * s, -16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}