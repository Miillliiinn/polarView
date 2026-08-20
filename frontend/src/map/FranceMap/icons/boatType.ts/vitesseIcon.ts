// Silhouette d'engin à grande vitesse (high speed craft)
export function createVitesseIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque très effilée, longue et fine (silhouette véloce)
  ctx.beginPath();
  ctx.moveTo(0, -45 * s);
  ctx.lineTo(3.5 * s, -20 * s);
  ctx.lineTo(3.5 * s, 22 * s);
  ctx.lineTo(0, 42 * s);
  ctx.lineTo(-3.5 * s, 22 * s);
  ctx.lineTo(-3.5 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lignes de sillage à l'arrière pour suggérer la vitesse
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(-2 * s, 30 * s);
  ctx.lineTo(-9 * s, 42 * s);
  ctx.moveTo(2 * s, 30 * s);
  ctx.lineTo(9 * s, 42 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}