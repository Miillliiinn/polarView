// Silhouette militaire avec 2 tourelles d'artillerie
export function createMilitaireIcon(color: string, size = 60): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#aeadad';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 100;

  ctx.beginPath();
  ctx.moveTo(0, -45 * s);               // Proue très acérée
  ctx.lineTo(11 * s, -20 * s);          // Flanc avant
  ctx.lineTo(10 * s, 38 * s);           // Poupe droite
  ctx.lineTo(-10 * s, 38 * s);          // Poupe gauche
  ctx.lineTo(-11 * s, -20 * s);         // Flanc gauche
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(-5.5 * s, -8 * s, 11 * s, 16 * s);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(-4 * s, -6 * s, 8 * s, 3 * s);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.8, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(0, -22 * s);
  ctx.lineTo(0, -42 * s);
  ctx.stroke();

  ctx.lineWidth = Math.max(2.8, size * 0.065);
  ctx.beginPath();
  ctx.moveTo(0, -39 * s);
  ctx.lineTo(0, -42 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -27 * s);
  ctx.lineTo(5 * s, -22 * s);
  ctx.lineTo(4 * s, -14 * s);
  ctx.lineTo(-4 * s, -14 * s);
  ctx.lineTo(-5 * s, -22 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.beginPath();
  ctx.moveTo(0, -27 * s);
  ctx.lineTo(0, -15 * s);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.8, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(0, 22 * s);
  ctx.lineTo(0, 42 * s);
  ctx.stroke();

  ctx.lineWidth = Math.max(2.8, size * 0.065);
  ctx.beginPath();
  ctx.moveTo(0, 39 * s);
  ctx.lineTo(0, 42 * s);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 27 * s);
  ctx.lineTo(5 * s, 22 * s);
  ctx.lineTo(4 * s, 14 * s);
  ctx.lineTo(-4 * s, 14 * s);
  ctx.lineTo(-5 * s, 22 * s);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.beginPath();
  ctx.moveTo(0, 27 * s);
  ctx.lineTo(0, 15 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}