// Silhouette de drague / navire de travaux (Optimisée pour petite taille)
export function createDragageIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 100;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.beginPath();
  ctx.moveTo(10 * s, -12 * s);
  ctx.lineTo(28 * s, -5 * s);
  ctx.lineTo(34 * s, 22 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(34 * s, 22 * s, 5.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);               // Proue plate/angulaire
  ctx.lineTo(16 * s, -22 * s);          // Flanc droit
  ctx.lineTo(16 * s, 36 * s);           // Poupe droite plate
  ctx.lineTo(-16 * s, 36 * s);          // Poupe gauche plate
  ctx.lineTo(-16 * s, -22 * s);         // Flanc gauche
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-10 * s, -24 * s, 20 * s, 12 * s);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-7 * s, -21 * s, 14 * s, 4 * s);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-10 * s, 5 * s);
  ctx.lineTo(10 * s, 5 * s);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 10 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}