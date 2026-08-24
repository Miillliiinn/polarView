// Silhouette de bateau-pilote
export function createPilotageIcon(color: string, size = 80): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 100;

  ctx.beginPath();
  ctx.moveTo(0, -38 * s);               // Proue renforcée
  ctx.lineTo(10 * s, -16 * s);          // Évasement avant
  ctx.lineTo(9.5 * s, 28 * s);          // Flancs parallèles stables
  ctx.lineTo(7 * s, 34 * s);            // Poupe carrée droite
  ctx.lineTo(-7 * s, 34 * s);           // Poupe carrée gauche
  ctx.lineTo(-9.5 * s, 28 * s);         // Flancs parallèles
  ctx.lineTo(-10 * s, -16 * s);         // Évasement avant
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.lineTo(5 * s, -14 * s);
  ctx.lineTo(-5 * s, -14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6 * s, -10 * s);
  ctx.lineTo(6 * s, -10 * s);
  ctx.lineTo(6.5 * s, 12 * s);
  ctx.lineTo(-6.5 * s, 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-4 * s, -7 * s, 8 * s, 6 * s);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-6 * s, 20 * s, 12 * s, 4 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
} 