// Silhouette de navire local (vedette de passagers / navette locale)
export function createLocalIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const s = size / 100;

  ctx.save();
  ctx.translate(size / 2, size / 2);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);               // Proue
  ctx.lineTo(16 * s, -18 * s);          // Avant évasé
  ctx.lineTo(16 * s, 36 * s);           // Flanc droit
  ctx.lineTo(11 * s, 44 * s);           // Poupe droite
  ctx.lineTo(-11 * s, 44 * s);          // Poupe gauche
  ctx.lineTo(-16 * s, 36 * s);          // Flanc gauche
  ctx.lineTo(-16 * s, -18 * s);         // Avant évasé
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -22 * s);             
  ctx.lineTo(8 * s, -10 * s);
  ctx.lineTo(8 * s, 18 * s);         
  ctx.lineTo(-8 * s, 18 * s);
  ctx.lineTo(-8 * s, -10 * s);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}