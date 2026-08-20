// Silhouette de voilier
export function createVoilierIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque fine, effilée à l'avant et à l'arrière
  ctx.beginPath();
  ctx.moveTo(0, -40 * s);
  ctx.lineTo(4.5 * s, -18 * s);
  ctx.lineTo(4.5 * s, 30 * s);
  ctx.lineTo(0, 42 * s);
  ctx.lineTo(-4.5 * s, 30 * s);
  ctx.lineTo(-4.5 * s, -18 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Grand-voile (triangle asymétrique, donne le "gonflé" de la voile)
  ctx.beginPath();
  ctx.moveTo(0, -34 * s);
  ctx.lineTo(16 * s, 18 * s);
  ctx.lineTo(0, 22 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mât
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.moveTo(0, -34 * s);
  ctx.lineTo(0, 22 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}