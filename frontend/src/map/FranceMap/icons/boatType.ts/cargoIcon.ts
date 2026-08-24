// Silhouette de cargo / navire de charge
export function createCargoIcon(color: string, size = 70): ImageData {
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
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -46 * s);               // Proue
  ctx.lineTo(8 * s, -30 * s);           // Évasement avant
  ctx.lineTo(10 * s, -10 * s);          // Flanc droit
  ctx.lineTo(10 * s, 42 * s);           // Poupe droite
  ctx.lineTo(-10 * s, 42 * s);          // Poupe gauche
  ctx.lineTo(-10 * s, -10 * s);         // Flanc gauche
  ctx.lineTo(-8 * s, -30 * s);          // Évasement avant
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-6 * s, -22 * s, 12 * s, 8 * s);
  ctx.fillRect(-6 * s, -10 * s, 12 * s, 8 * s);
  ctx.fillRect(-6 * s, 2 * s, 12 * s, 8 * s);
  ctx.fillRect(-6 * s, 14 * s, 12 * s, 8 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}