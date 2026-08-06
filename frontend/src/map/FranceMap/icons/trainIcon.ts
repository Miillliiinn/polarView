// Silhouette de train
export function createTrainIcon(color = '#457b9d', size = 64): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  ctx.beginPath();
  ctx.moveTo(0, -45 * s);
  ctx.quadraticCurveTo(10 * s, -40 * s, 13 * s, -20 * s); 
  ctx.lineTo(13 * s, 32 * s); 
  ctx.quadraticCurveTo(13 * s, 38 * s, 7 * s, 38 * s); 
  ctx.lineTo(-7 * s, 38 * s); 
  ctx.quadraticCurveTo(-13 * s, 38 * s, -13 * s, 32 * s); 
  ctx.lineTo(-13 * s, -20 * s); 
  ctx.quadraticCurveTo(-10 * s, -40 * s, 0, -45 * s); 
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.lineTo(0, 30 * s);
  ctx.lineWidth = size * 0.012;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = size * 0.015;
  for (let y = -12; y <= 24; y += 12) {
    ctx.beginPath();
    ctx.moveTo(-9 * s, y * s);
    ctx.lineTo(9 * s, y * s);
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}
