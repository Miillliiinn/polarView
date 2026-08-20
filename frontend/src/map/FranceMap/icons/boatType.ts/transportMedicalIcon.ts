// Silhouette de navire de transport médical
export function createTransportMedicalIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque de taille moyenne
  ctx.beginPath();
  ctx.moveTo(0, -36 * s);
  ctx.lineTo(8 * s, -20 * s);
  ctx.lineTo(9 * s, 28 * s);
  ctx.lineTo(-9 * s, 28 * s);
  ctx.lineTo(-8 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Croix médicale bien visible et centrée
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-2.2 * s, -12 * s, 4.4 * s, 20 * s);
  ctx.rect(-9 * s, -2.8 * s, 18 * s, 5.6 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}