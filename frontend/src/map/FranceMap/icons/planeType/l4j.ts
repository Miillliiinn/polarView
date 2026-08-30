// Silhouette d'Airbus A380 - 85
export function createA380Icon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineJoin = 'round';

  const s = size / 130;
  ctx.beginPath();
  ctx.moveTo(0, -52 * s);
  ctx.bezierCurveTo(3 * s, -52 * s, 5.5 * s, -42 * s, 6 * s, -30 * s);
  ctx.lineTo(6.5 * s, -14 * s);
  ctx.lineTo(23 * s, -3 * s);
  ctx.lineTo(23.5 * s, -10 * s);
  ctx.lineTo(28.5 * s, -10 * s);
  ctx.lineTo(29.5 * s, 0 * s);
  ctx.lineTo(38 * s, 6 * s);
  ctx.lineTo(38.5 * s, -1 * s);
  ctx.lineTo(43.5 * s, -1 * s);
  ctx.lineTo(44.5 * s, 9 * s);
  ctx.lineTo(53 * s, 14.5 * s);
  ctx.quadraticCurveTo(58 * s, 18 * s, 57 * s, 20.5 * s);
  ctx.lineTo(9 * s, 10 * s);
  ctx.lineTo(7.5 * s, 32 * s);
  ctx.lineTo(22 * s, 42 * s);
  ctx.lineTo(21 * s, 48 * s);
  ctx.lineTo(3 * s, 44 * s);
  ctx.lineTo(0 * s, 54 * s);
  ctx.lineTo(-3 * s, 44 * s);
  ctx.lineTo(-21 * s, 48 * s);
  ctx.lineTo(-22 * s, 42 * s);
  ctx.lineTo(-7.5 * s, 32 * s);
  ctx.lineTo(-9 * s, 10 * s);
  ctx.lineTo(-57 * s, 20.5 * s);
  ctx.quadraticCurveTo(-58 * s, 18 * s, -53 * s, 14.5 * s);
  ctx.lineTo(-44.5 * s, 9 * s);
  ctx.lineTo(-43.5 * s, -1 * s);
  ctx.lineTo(-38.5 * s, -1 * s);
  ctx.lineTo(-38 * s, 6 * s);
  ctx.lineTo(-29.5 * s, 0 * s);
  ctx.lineTo(-28.5 * s, -10 * s);
  ctx.lineTo(-23.5 * s, -10 * s);
  ctx.lineTo(-23 * s, -3 * s);
  ctx.lineTo(-6.5 * s, -14 * s);
  ctx.lineTo(-6 * s, -30 * s);
  ctx.bezierCurveTo(-5.5 * s, -42 * s, -3 * s, -52 * s, 0, -52 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}