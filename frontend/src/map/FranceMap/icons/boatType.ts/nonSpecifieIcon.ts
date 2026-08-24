// Silhouette pour type de navire non spécifié
export function createNonSpecifieIcon(color: string, size = 63): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const s = size / 100;

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.arc(0, 0, 28 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}