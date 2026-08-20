// Silhouette pour type de navire inconnu (convention AIS : losange)
export function createInconnuIcon(color: string, size = 43): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  // Losange simple, sans orientation de proue/poupe : le type n'est pas connu
  ctx.beginPath();
  ctx.moveTo(0, -32 * s);
  ctx.lineTo(24 * s, 0);
  ctx.lineTo(0, 32 * s);
  ctx.lineTo(-24 * s, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Point d'interrogation au centre
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${16 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 1 * s);

  return ctx.getImageData(0, 0, size, size);
}