// Silhouette de pétrolier
export function createPetrolierIcon(color: string, size = 70): ImageData {
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
  ctx.strokeStyle = '#000000ab';
  ctx.lineWidth = Math.max(1.8, size * 0.035);

  ctx.beginPath();
  ctx.moveTo(0, -44 * s);               // Proue bulbeuse
  ctx.lineTo(12 * s, -30 * s);          // Avant évasé
  ctx.lineTo(14 * s, -10 * s);          // Flanc très large
  ctx.lineTo(14 * s, 42 * s);           // Poupe droite
  ctx.lineTo(-14 * s, 42 * s);          // Poupe gauche
  ctx.lineTo(-14 * s, -10 * s);         // Flanc gauche
  ctx.lineTo(-12 * s, -30 * s);         // Avant évasé
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.2, size * 0.022);
  ctx.beginPath();
  ctx.moveTo(-5 * s, -22 * s);
  ctx.lineTo(-5 * s, 26 * s);
  ctx.moveTo(5 * s, -22 * s);
  ctx.lineTo(5 * s, 26 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-9 * s, 2 * s);
  ctx.lineTo(9 * s, 2 * s);
  ctx.moveTo(-9 * s, 8 * s);
  ctx.lineTo(9 * s, 8 * s);
  ctx.stroke();
  ctx.fillStyle = '#fa5306';
  ctx.fillRect(-8 * s, 30 * s, 16 * s, 9 * s);

  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}