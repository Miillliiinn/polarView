// Silhouette de navire de plongee
export function createPlongeIcon(color: string, size = 60): ImageData {
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
  ctx.moveTo(14 * s, -10 * s);
  ctx.lineTo(14 * s, -42 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(14 * s, -42 * s);
  ctx.lineTo(34 * s, -38 * s);
  ctx.lineTo(26 * s, -33 * s); 
  ctx.lineTo(34 * s, -28 * s);
  ctx.lineTo(14 * s, -24 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);               // Proue
  ctx.lineTo(15 * s, -14 * s);          // Flanc droit
  ctx.lineTo(13 * s, 32 * s);           // Poupe droite
  ctx.lineTo(-13 * s, 32 * s);          // Poupe gauche
  ctx.lineTo(-15 * s, -14 * s);         // Flanc gauche
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-8 * s, -20 * s, 16 * s, 14 * s);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-6 * s, -17 * s, 12 * s, 4 * s);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(-7 * s, 26 * s);
  ctx.lineTo(-7 * s, 38 * s);         
  ctx.moveTo(7 * s, 26 * s);
  ctx.lineTo(7 * s, 38 * s);           
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}