// Silhouette L3J - 60
export function createL3JIcon(color: string, size: number, angleDeg: number = 0): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.027);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const s = size / 125;
  ctx.beginPath();
  ctx.moveTo(0, -64 * s);
  ctx.bezierCurveTo(4.2 * s, -64 * s, 6.8 * s, -47 * s, 7 * s, -28 * s);
  ctx.lineTo(8 * s, -14 * s);     
  ctx.lineTo(56 * s, 13.5 * s); 
  ctx.lineTo(58 * s, 17.5 * s);   
  ctx.lineTo(55 * s, 21 * s);     
  ctx.lineTo(7.5 * s, 8 * s);
  ctx.lineTo(7.5 * s, 16 * s);
  ctx.lineTo(15 * s, 17.5 * s);
  ctx.lineTo(15 * s, 36 * s);
  ctx.lineTo(4 * s, 54 * s);
  ctx.lineTo(2 * s, 68 * s);
  ctx.lineTo(-2 * s, 68 * s);
  ctx.lineTo(-4 * s, 54 * s);
  ctx.lineTo(-15 * s, 36 * s);
  ctx.lineTo(-15 * s, 17.5 * s);
  ctx.lineTo(-7.5 * s, 16 * s);
  ctx.lineTo(-7.5 * s, 8 * s);
  ctx.lineTo(-55 * s, 21 * s);
  ctx.lineTo(-58 * s, 17.5 * s);
  ctx.lineTo(-56 * s, 13.5 * s);
  ctx.lineTo(-8 * s, -14 * s);   
  ctx.lineTo(-7 * s, -28 * s);
  ctx.bezierCurveTo(-6.8 * s, -47 * s, -4.2 * s, -64 * s, 0, -64 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(7 * s, 34 * s);
  ctx.lineTo(33.6 * s, 51 * s);   
  ctx.lineTo(33.0 * s, 59.5 * s); 
  ctx.lineTo(5.5 * s, 53.5 * s);  
  ctx.moveTo(-7 * s, 34 * s);
  ctx.lineTo(-33.6 * s, 51 * s);   
  ctx.lineTo(-33.0 * s, 59.5 * s); 
  ctx.lineTo(-5.5 * s, 53.5 * s);  
  ctx.fill();  
  ctx.stroke(); 
  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}