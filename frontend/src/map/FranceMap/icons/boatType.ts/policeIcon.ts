// Vedette de police effilée avec coque ajustée près du texte
export function createPoliceIcon(color: string, size = 70): ImageData {
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
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -48 * s);               // Étrave effilée
  ctx.lineTo(15 * s, -18 * s);          // Évasement progressif
  ctx.lineTo(15 * s, 34 * s);           // Flancs tendus parallèles aux lettres
  ctx.lineTo(10 * s, 45 * s);           // Poupe ajustée droite
  ctx.lineTo(-10 * s, 45 * s);          // Poupe ajustée gauche
  ctx.lineTo(-15 * s, 34 * s);          // Flancs tendus
  ctx.lineTo(-15 * s, -18 * s);         // Évasement
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.rotate(Math.PI / 2);
  ctx.font = `900 ${Math.round(22 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText('POLICE', 3 * s, 0, 70 * s);
  ctx.restore();

  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}