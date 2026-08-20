// Silhouette de navire anti-pollution
export function createAntiPollutionIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque robuste et large
  ctx.beginPath();
  ctx.moveTo(0, -36 * s);
  ctx.lineTo(9 * s, -20 * s);
  ctx.lineTo(10 * s, 28 * s);
  ctx.lineTo(-10 * s, 28 * s);
  ctx.lineTo(-9 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Barrages flottants déployés de part et d'autre à l'arrière
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(-10 * s, 10 * s);
  ctx.lineTo(-28 * s, 26 * s);
  ctx.moveTo(10 * s, 10 * s);
  ctx.lineTo(28 * s, 26 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}