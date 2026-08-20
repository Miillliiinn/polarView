// Silhouette générique "autre type de navire"
export function createAutreIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque neutre, ni fine ni large, sans superstructure marquée
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);
  ctx.lineTo(7 * s, -18 * s);
  ctx.lineTo(8 * s, 26 * s);
  ctx.lineTo(-8 * s, 26 * s);
  ctx.lineTo(-7 * s, -18 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}