// Silhouette de remorqueur portuaire (Optimisée pour visibilité cartographique)
export function createRemorqueurPortuaireIcon(color: string, size = 80): ImageData {
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
  ctx.strokeStyle = '#0cf900';
  ctx.lineWidth = Math.max(1.5, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);               // Proue très ronde
  ctx.lineTo(13 * s, -12 * s);          // Évasement avant large
  ctx.lineTo(14 * s, 12 * s);           // Flancs très larges
  ctx.lineTo(9 * s, 28 * s);            // Arrière trapu (poupe)
  ctx.lineTo(-9 * s, 28 * s);
  ctx.lineTo(-14 * s, 12 * s);
  ctx.lineTo(-13 * s, -12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -28 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-6 * s, -8 * s, 12 * s, 14 * s);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-4 * s, -6 * s, 8 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-5 * s, 8 * s, 2.5 * s, 4 * s);
  ctx.fillRect(2.5 * s, 8 * s, 2.5 * s, 4 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}