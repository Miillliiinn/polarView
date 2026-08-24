// Silhouette de navire non-combattant / auxiliaire naval (Soutien / Ravitailleur)
export function createNonCombattantIcon(color: string, size = 80): ImageData {
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
  ctx.strokeStyle = '#700e0e';
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);               // Proue haute légèrement arrondie
  ctx.lineTo(13 * s, -22 * s);          // Évasement évasé
  ctx.lineTo(13 * s, 34 * s);           // Flancs droits très larges
  ctx.lineTo(9 * s, 42 * s);            // Poupe droite plate
  ctx.lineTo(-9 * s, 42 * s);           // Poupe gauche plate
  ctx.lineTo(-13 * s, 34 * s);          // Flancs droits
  ctx.lineTo(-13 * s, -22 * s);         // Évasement
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#700e0e';
  ctx.beginPath();
  ctx.rect(-7 * s, 4 * s, 14 * s, 22 * s);
  ctx.fill();
  ctx.fillRect(-8 * s, -12 * s, 16 * s, 3 * s);
  ctx.fillRect(-2 * s, -16 * s, 4 * s, 12 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}