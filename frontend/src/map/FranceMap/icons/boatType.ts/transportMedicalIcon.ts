// Silhouette de navire de transport médical
export function createTransportMedicalIcon(color: string, size = 80): ImageData {
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
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(1.8, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);               // Proue
  ctx.lineTo(12 * s, -18 * s);          // Flanc avant
  ctx.lineTo(12 * s, 32 * s);           // Flanc arrière
  ctx.lineTo(8 * s, 38 * s);            // Poupe droite
  ctx.lineTo(-8 * s, 38 * s);           // Poupe gauche
  ctx.lineTo(-12 * s, 32 * s);          // Flanc arrière
  ctx.lineTo(-12 * s, -18 * s);         // Flanc avant
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-3 * s, -12 * s, 6 * s, 24 * s);
  ctx.fillRect(-12 * s, -3 * s, 24 * s, 6 * s);
  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
}