// Silhouette de bateau de pêche
export function createPecheIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque robuste, arrondie à l'avant
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(8 * s, -20 * s);
  ctx.lineTo(10 * s, 22 * s);
  ctx.lineTo(-10 * s, 22 * s);
  ctx.lineTo(-8 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Timonerie à l'arrière
  ctx.beginPath();
  ctx.rect(-5 * s, 6 * s, 10 * s, 12 * s);
  ctx.fill();
  ctx.stroke();

  // Portiques / bômes de chalutage de part et d'autre (traits obliques)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.moveTo(-9 * s, -6 * s);
  ctx.lineTo(-26 * s, 4 * s);
  ctx.moveTo(9 * s, -6 * s);
  ctx.lineTo(26 * s, 4 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}