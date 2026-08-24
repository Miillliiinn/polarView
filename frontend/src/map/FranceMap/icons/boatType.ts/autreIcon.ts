// Silhouette générique
export function createAutreIcon(color: string, size = 60): ImageData {
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
  ctx.strokeStyle = '#0a0b0a';
  ctx.lineWidth = Math.max(1.8, size * 0.035);

  ctx.beginPath();
  ctx.moveTo(0, -40 * s);               // Proue
  ctx.lineTo(12 * s, -18 * s);          // Avant
  ctx.lineTo(12 * s, 34 * s);           // Flancs droits
  ctx.lineTo(8 * s, 40 * s);            // Poupe droite
  ctx.lineTo(-8 * s, 40 * s);           // Poupe gauche
  ctx.lineTo(-12 * s, 34 * s);          // Flancs droits
  ctx.lineTo(-12 * s, -18 * s);         // Avant
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#970202';
  ctx.beginPath();
  ctx.arc(0, 0, 8 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}