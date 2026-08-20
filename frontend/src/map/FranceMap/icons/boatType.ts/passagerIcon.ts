// Silhouette de navire à passagers (ferry)
export function createPassagerIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque large et haute, proue émoussée
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(10 * s, -26 * s);
  ctx.lineTo(12 * s, 32 * s);
  ctx.lineTo(-12 * s, 32 * s);
  ctx.lineTo(-10 * s, -26 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Superstructure imposante (plusieurs ponts) caractéristique d'un ferry
  ctx.beginPath();
  ctx.rect(-8 * s, -14 * s, 16 * s, 34 * s);
  ctx.fill();
  ctx.stroke();

  // Lignes de ponts
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.012;
  for (const y of [-4, 6, 16]) {
    ctx.beginPath();
    ctx.moveTo(-8 * s, y * s);
    ctx.lineTo(8 * s, y * s);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}