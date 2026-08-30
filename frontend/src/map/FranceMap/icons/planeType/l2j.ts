// Silhouette d'Airbus A320 - version effilée
export function createL2JIcon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.lineJoin = 'round';

  const s = size / 130;
  ctx.beginPath();
  ctx.moveTo(0, -58 * s);
  ctx.bezierCurveTo(2.5 * s, -58 * s, 4.5 * s, -47 * s, 5 * s, -32 * s);
  ctx.lineTo(5.5 * s, -14 * s);
  ctx.lineTo(20 * s, -3 * s);
  ctx.lineTo(20.5 * s, -10 * s);
  ctx.lineTo(25 * s, -10 * s);
  ctx.lineTo(26 * s, 0 * s);
  ctx.lineTo(52 * s, 15 * s);
  ctx.quadraticCurveTo(57 * s, 18.5 * s, 56 * s, 21 * s);
  ctx.lineTo(7.5 * s, 10 * s);
  ctx.lineTo(6.5 * s, 33 * s);
  ctx.lineTo(19 * s, 43 * s);
  ctx.lineTo(18 * s, 49 * s);
  ctx.lineTo(2.5 * s, 45 * s);
  ctx.lineTo(0 * s, 60 * s);
  ctx.lineTo(-2.5 * s, 45 * s);
  ctx.lineTo(-18 * s, 49 * s);
  ctx.lineTo(-19 * s, 43 * s);
  ctx.lineTo(-6.5 * s, 33 * s);
  ctx.lineTo(-7.5 * s, 10 * s);
  ctx.lineTo(-56 * s, 21 * s);
  ctx.quadraticCurveTo(-57 * s, 18.5 * s, -52 * s, 15 * s);
  ctx.lineTo(-26 * s, 0 * s);
  ctx.lineTo(-25 * s, -10 * s);
  ctx.lineTo(-20.5 * s, -10 * s);
  ctx.lineTo(-20 * s, -3 * s);
  ctx.lineTo(-5.5 * s, -14 * s);
  ctx.lineTo(-5 * s, -32 * s);
  ctx.bezierCurveTo(-4.5 * s, -47 * s, -2.5 * s, -58 * s, 0, -58 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}