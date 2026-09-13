// Silhouette pour type de navire inconnu
export function createInconnuIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;
  ctx.beginPath();
  ctx.moveTo(0, -40 * s);               // Proue
  ctx.lineTo(18 * s, -12 * s);          // Flanc avant droit
  ctx.lineTo(16 * s, 34 * s);           // Poupe droite
  ctx.lineTo(-16 * s, 34 * s);          // Poupe gauche
  ctx.lineTo(-18 * s, -12 * s);         // Flanc avant gauche
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${50 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.fillText('?', 0, 1 * s);

  return ctx.getImageData(0, 0, size, size);
}