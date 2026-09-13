// Silhouette de bateau de peche
export function createPecheIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1.5, size * 0.04); 
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 100;

  ctx.beginPath();
  ctx.moveTo(-5 * s, -5 * s);
  ctx.lineTo(-32 * s, -18 * s);
  ctx.moveTo(5 * s, -5 * s);
  ctx.lineTo(32 * s, -18 * s);
  ctx.moveTo(-32 * s, -18 * s);
  ctx.lineTo(-32 * s, -10 * s);
  ctx.moveTo(32 * s, -18 * s);
  ctx.lineTo(32 * s, -10 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -40 * s);               // Étrave / Proue pointue
  ctx.lineTo(16 * s, -10 * s);          // Flanc avant droit évasé
  ctx.lineTo(14 * s, 32 * s);           // Poupe droite
  ctx.lineTo(-14 * s, 32 * s);          // Poupe gauche
  ctx.lineTo(-16 * s, -10 * s);         // Flanc avant gauche évasé
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-8 * s, 2 * s, 16 * s, 18 * s);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-6 * s, 5 * s, 12 * s, 5 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}