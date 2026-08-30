// Silhouette L1T - 60
export function createL1TIcon(color: string, size: number, angleDeg: number = 0): ImageData {
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

  const s = size / 150;

  ctx.beginPath();
  ctx.moveTo(0, -66 * s);
  ctx.bezierCurveTo(2 * s, -66 * s, 4.5 * s, -54 * s, 5 * s, -34 * s);
  ctx.lineTo(5.5 * s, -14 * s);
  ctx.lineTo(58 * s, -4 * s);
  ctx.lineTo(60 * s, 2 * s);
  ctx.lineTo(57 * s, 8 * s);
  ctx.lineTo(5.5 * s, 10 * s);
  ctx.lineTo(4 * s, 44 * s);
  ctx.lineTo(26 * s, 53 * s);
  ctx.lineTo(24 * s, 59 * s);
  ctx.lineTo(1.5 * s, 57 * s);
  ctx.lineTo(0, 62 * s);
  ctx.lineTo(-1.5 * s, 57 * s);
  ctx.lineTo(-24 * s, 59 * s);
  ctx.lineTo(-26 * s, 53 * s);
  ctx.lineTo(-4 * s, 44 * s);
  ctx.lineTo(-5.5 * s, 10 * s);
  ctx.lineTo(-57 * s, 8 * s);
  ctx.lineTo(-60 * s, 2 * s);
  ctx.lineTo(-58 * s, -4 * s);
  ctx.lineTo(-5.5 * s, -14 * s);
  ctx.lineTo(-5 * s, -34 * s);
  ctx.bezierCurveTo(-4.5 * s, -54 * s, -2 * s, -66 * s, 0, -66 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = '#ffffff'; 
  ctx.moveTo(-4.5 * s, -24 * s);
  ctx.bezierCurveTo(-2.5 * s, -27 * s, 2.5 * s, -27 * s, 4.5 * s, -24 * s);
  ctx.lineTo(5 * s, -13 * s);
  ctx.lineTo(-5 * s, -13 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.stroke();
  ctx.fillStyle = '#040404';
  ctx.fillRect(4.2 * s, -44 * s, 2 * s, 5 * s);
  ctx.fillRect(-6.2 * s, -44 * s, 2 * s, 5 * s);
  ctx.save();
  ctx.translate(0, -66 * s);
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++)
{
    ctx.rotate((72 * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);

    ctx.bezierCurveTo(1.2 * s, -2 * s, 2.2 * s, -8 * s, 0.4 * s, -13.5 * s);
    ctx.bezierCurveTo(-0.8 * s, -8 * s, -0.8 * s, -2 * s, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 3.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}