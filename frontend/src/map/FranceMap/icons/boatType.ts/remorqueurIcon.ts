// Silhouette de remorqueur (Optimisée pour petite taille)
export function createRemorqueurIcon(color: string, size = 60): ImageData {
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
  ctx.arc(0, -22 * s, 18 * s, Math.PI * 0.85, Math.PI * 0.15, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);          
  ctx.bezierCurveTo(22 * s, -22 * s, 20 * s, 10 * s, 14 * s, 32 * s);  
  ctx.lineTo(-14 * s, 32 * s);         
  ctx.bezierCurveTo(-20 * s, 10 * s, -22 * s, -22 * s, 0, -32 * s);  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-8 * s, -10 * s, 16 * s, 18 * s);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-6 * s, -7 * s, 12 * s, 5 * s);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-4 * s, 11 * s, 8 * s, 9 * s);
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}