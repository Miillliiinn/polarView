// Silhouette de bateau-pilote
export function createPilotageIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Petite coque fine et rapide
  ctx.beginPath();
  ctx.moveTo(0, -36 * s);
  ctx.lineTo(5 * s, -20 * s);
  ctx.lineTo(6 * s, 22 * s);
  ctx.lineTo(-6 * s, 22 * s);
  ctx.lineTo(-5 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mât + pavillon "H" du pilote à l'avant
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(0, -20 * s);
  ctx.lineTo(0, -34 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(0, -34 * s, 8 * s, 6 * s);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}