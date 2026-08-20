// Silhouette de pétrolier (tanker)
export function createPetrolierIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque large, bulbeuse, pont plat sans cassure marquée
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);
  ctx.lineTo(10 * s, -30 * s);
  ctx.lineTo(13 * s, -8 * s);
  ctx.lineTo(13 * s, 40 * s);
  ctx.lineTo(-13 * s, 40 * s);
  ctx.lineTo(-13 * s, -8 * s);
  ctx.lineTo(-10 * s, -30 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Canalisations de pont (traits fins longitudinaux)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(-4 * s, -20 * s);
  ctx.lineTo(-4 * s, 28 * s);
  ctx.moveTo(4 * s, -20 * s);
  ctx.lineTo(4 * s, 28 * s);
  ctx.stroke();

  // Petite passerelle tout à l'arrière
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.rect(-6 * s, 30 * s, 12 * s, 8 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}