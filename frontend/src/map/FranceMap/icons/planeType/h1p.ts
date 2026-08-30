// Silhouette d'hélicoptère monomoteur à piston (H1P)
export function createH1PIcon(color: string, size: number, angleDeg: number = 110): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = size * 0.015;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const s = size / 140;

  ctx.beginPath();
  ctx.moveTo(0, -48 * s);
  ctx.bezierCurveTo(11 * s, -48 * s, 11 * s, -30 * s, 11 * s, -18 * s);
  ctx.bezierCurveTo(10 * s, -6 * s, 4 * s, 2 * s, 2 * s, 10 * s);
  ctx.lineTo(2 * s, 55 * s);
  ctx.lineTo(11 * s, 55.5 * s);
  ctx.lineTo(10.5 * s, 58.5 * s);
  ctx.lineTo(2 * s, 58 * s);
  ctx.lineTo(2 * s, 68 * s);
  ctx.lineTo(6.5 * s, 67 * s);
  ctx.lineTo(6.5 * s, 69 * s);
  ctx.lineTo(2 * s, 69 * s);
  ctx.lineTo(1.5 * s, 71 * s);
  ctx.lineTo(-1.5 * s, 71 * s);
  ctx.lineTo(-2 * s, 69 * s);
  ctx.lineTo(-2 * s, 68 * s);
  ctx.lineTo(-2 * s, 58 * s);
  ctx.lineTo(-10.5 * s, 58.5 * s);
  ctx.lineTo(-11 * s, 55.5 * s);
  ctx.lineTo(-2 * s, 55 * s);
  ctx.lineTo(-2 * s, 10 * s);
  ctx.bezierCurveTo(-4 * s, 2 * s, -10 * s, -6 * s, -11 * s, -18 * s);
  ctx.bezierCurveTo(-11 * s, -30 * s, -11 * s, -48 * s, 0, -48 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(13.5 * s, -35 * s);
  ctx.lineTo(13.5 * s, 15 * s);
  ctx.moveTo(9.5 * s, -22 * s);
  ctx.lineTo(13.5 * s, -22 * s);
  ctx.moveTo(6 * s, 5 * s);
  ctx.lineTo(13.5 * s, 5 * s);
  ctx.moveTo(-13.5 * s, -35 * s);
  ctx.lineTo(-13.5 * s, 15 * s);
  ctx.moveTo(-9.5 * s, -22 * s);
  ctx.lineTo(-13.5 * s, -22 * s);
  ctx.moveTo(-6 * s, 5 * s);
  ctx.lineTo(-13.5 * s, 5 * s);
  ctx.stroke();
  ctx.save();
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.beginPath();
  ctx.arc(0, 0, 66 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#04040419';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 3.5 * s, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-1.8 * s, -66 * s, 3.6 * s, 62.5 * s);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-1.8 * s, 3.5 * s, 3.6 * s, 62.5 * s);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}