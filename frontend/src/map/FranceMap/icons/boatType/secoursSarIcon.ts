// Silhouette de navire de secours / SAR avec grande croix centrale
export function createSecoursSarIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const s = size / 100;
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(1.5, size * 0.04);

  ctx.beginPath();
  ctx.moveTo(0, -42 * s);               // Proue
  ctx.lineTo(13 * s, -18 * s);          // Flanc avant
  ctx.lineTo(12 * s, 30 * s);           // Flanc arrière
  ctx.lineTo(8 * s, 38 * s);            // Poupe droite
  ctx.lineTo(-8 * s, 38 * s);           // Poupe gauche
  ctx.lineTo(-12 * s, 30 * s);          // Flanc arrière
  ctx.lineTo(-13 * s, -18 * s);         // Flanc avant
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-10 * s, -18 * s, 20 * s, 36 * s);
  ctx.fill();
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(-3 * s, -12 * s, 6 * s, 24 * s);
  ctx.fillRect(-10 * s, -3 * s, 20 * s, 6 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}