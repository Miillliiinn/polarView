// Silhouette de navire militaire
export function createMilitaireIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Coque longue, effilée et anguleuse (silhouette furtive)
  ctx.beginPath();
  ctx.moveTo(0, -45 * s);
  ctx.lineTo(5 * s, -30 * s);
  ctx.lineTo(6 * s, -4 * s);
  ctx.lineTo(6 * s, 36 * s);
  ctx.lineTo(-6 * s, 36 * s);
  ctx.lineTo(-6 * s, -4 * s);
  ctx.lineTo(-5 * s, -30 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Superstructure angulaire centrale (type frégate)
  ctx.beginPath();
  ctx.moveTo(-4 * s, -10 * s);
  ctx.lineTo(4 * s, -10 * s);
  ctx.lineTo(4 * s, 14 * s);
  ctx.lineTo(-4 * s, 14 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tourelle avant
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -22 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}