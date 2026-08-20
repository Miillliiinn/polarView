// Silhouette de navire de plongée
export function createPlongeIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Petite coque de soutien
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);
  ctx.lineTo(7 * s, -16 * s);
  ctx.lineTo(8 * s, 24 * s);
  ctx.lineTo(-8 * s, 24 * s);
  ctx.lineTo(-7 * s, -16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mât + pavillon "Alpha" (fanion échancré signalant une plongée en cours)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(0, -16 * s);
  ctx.lineTo(0, -32 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);
  ctx.lineTo(9 * s, -30 * s);
  ctx.lineTo(6 * s, -27 * s);
  ctx.lineTo(9 * s, -24 * s);
  ctx.lineTo(0, -22 * s);
  ctx.closePath();
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}