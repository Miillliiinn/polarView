// Bateau de service
export function createBateauPortIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const s = size / 100;

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);
  ctx.quadraticCurveTo(12 * s, -32 * s, 12 * s, -18 * s);
  ctx.lineTo(12 * s, 28 * s);
  ctx.lineTo(-12 * s, 28 * s);
  ctx.lineTo(-12 * s, -18 * s);
  ctx.quadraticCurveTo(-12 * s, -32 * s, 0, -32 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(38 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', 0, 2 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}