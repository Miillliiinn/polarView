// Silhouette de remorqueur portuaire
export function createRemorqueurPortuaireIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque très compacte et arrondie (manœuvre en port)
  ctx.beginPath();
  ctx.moveTo(0, -24 * s);
  ctx.lineTo(10 * s, -10 * s);
  ctx.lineTo(11 * s, 12 * s);
  ctx.lineTo(7 * s, 26 * s);
  ctx.lineTo(-7 * s, 26 * s);
  ctx.lineTo(-11 * s, 12 * s);
  ctx.lineTo(-10 * s, -10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Petite timonerie
  ctx.beginPath();
  ctx.rect(-5 * s, -4 * s, 10 * s, 12 * s);
  ctx.fill();
  ctx.stroke();

  // Pare-battages avant (points de défense typiques des remorqueurs de port)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -18 * s, 2.2 * s, 0, Math.PI * 2);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}