// Silhouette de bateau de plaisance
export function createPlaisanceIcon(color: string, size = 60): ImageData {
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
  ctx.moveTo(0, -42 * s);               // Proue
  ctx.lineTo(13 * s, -14 * s);          // Flanc avant évasé
  ctx.lineTo(12 * s, 28 * s);           // Flanc arrière
  ctx.lineTo(9 * s, 36 * s);            // Plage de bain arrière droite
  ctx.lineTo(-9 * s, 36 * s);           // Plage de bain arrière gauche
  ctx.lineTo(-12 * s, 28 * s);          // Flanc arrière
  ctx.lineTo(-13 * s, -14 * s);         // Flanc avant évasé
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.lineTo(7 * s, -12 * s);
  ctx.lineTo(-7 * s, -12 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(-9 * s, -10 * s);
  ctx.lineTo(0, -14 * s);
  ctx.lineTo(9 * s, -10 * s);
  ctx.stroke();

  ctx.fillStyle = '#00b4d8';
  ctx.beginPath();
  ctx.rect(-8 * s, 4 * s, 16 * s, 20 * s);
  ctx.fill();

  ctx.fillStyle = '#00b4d8';            
  ctx.strokeStyle = '#00b4d8';          
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.beginPath();
  ctx.rect(-5 * s, 8 * s, 10 * s, 11 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}