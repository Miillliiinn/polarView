// Silhouette de cargo (navire de charge)
export function createCargoIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque : proue pointue, tonture longue, poupe carrée
  ctx.beginPath();
  ctx.moveTo(0, -44 * s);
  ctx.lineTo(7 * s, -32 * s);
  ctx.lineTo(9 * s, -14 * s);
  ctx.lineTo(9 * s, 38 * s);
  ctx.lineTo(-9 * s, 38 * s);
  ctx.lineTo(-9 * s, -14 * s);
  ctx.lineTo(-7 * s, -32 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cales / panneaux de cargaison (traits de pont)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.015;
  for (const y of [-6, 4, 14]) {
    ctx.beginPath();
    ctx.moveTo(-7 * s, y * s);
    ctx.lineTo(7 * s, y * s);
    ctx.stroke();
  }

  // Superstructure arrière
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.rect(-5 * s, 22 * s, 10 * s, 12 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}