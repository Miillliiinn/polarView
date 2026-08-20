// Silhouette de navire non-combattant (auxiliaire naval)
export function createNonCombattantIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque plus large et moins anguleuse qu'un navire de combat
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(8 * s, -24 * s);
  ctx.lineTo(9 * s, 30 * s);
  ctx.lineTo(-9 * s, 30 * s);
  ctx.lineTo(-8 * s, -24 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Superstructure rectangulaire simple, sans armement apparent
  ctx.beginPath();
  ctx.rect(-5 * s, -6 * s, 10 * s, 18 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}