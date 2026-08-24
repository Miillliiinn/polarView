// Silhouette de navire à passagers avec pictogramme de personnage entier (avec jambes)
export function createPassagerIcon(color: string, size = 60): ImageData {
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
  ctx.strokeStyle = '#00f7ff';
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);               // Proue
  ctx.lineTo(14 * s, -22 * s);          // Avant évasé
  ctx.lineTo(14 * s, 38 * s);           // Flancs droits
  ctx.lineTo(11 * s, 42 * s);           // Poupe droite
  ctx.lineTo(-11 * s, 42 * s);          // Poupe gauche
  ctx.lineTo(-14 * s, 38 * s);          // Flancs droits
  ctx.lineTo(-14 * s, -22 * s);         // Avant évasé
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -18 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6 * s, 6 * s);
  ctx.lineTo(-6 * s, -8 * s);
  ctx.quadraticCurveTo(-6 * s, -12 * s, -2 * s, -12 * s);
  ctx.lineTo(2 * s, -12 * s);
  ctx.quadraticCurveTo(6 * s, -12 * s, 6 * s, -8 * s);
  ctx.lineTo(6 * s, 6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-5.5 * s, 8 * s, 4 * s, 14 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.rect(1.5 * s, 8 * s, 4 * s, 14 * s);
  ctx.fill();
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}