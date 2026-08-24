// Silhouette d'engin à grande vitesse
export function createVitesseIcon(color: string, size = 60): ImageData {
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
  ctx.moveTo(0, -44 * s);               
  ctx.lineTo(8.5 * s, -18 * s);        
  ctx.lineTo(7.5 * s, 32 * s);         
  ctx.lineTo(5 * s, 42 * s);           
  ctx.lineTo(-5 * s, 42 * s);           
  ctx.lineTo(-7.5 * s, 32 * s);         
  ctx.lineTo(-8.5 * s, -18 * s);       
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.2, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(-4 * s, 36 * s);
  ctx.lineTo(-12 * s, 46 * s);
  ctx.moveTo(4 * s, 36 * s);
  ctx.lineTo(12 * s, 46 * s);
  ctx.moveTo(0, 40 * s);
  ctx.lineTo(0, 48 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}