// Silhouette de voilier large & ultra-lisible (Voiles déployées)
export function createVoilierIcon(color: string, size = 63): ImageData {
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

  // 1. Foc / Génois (Voile d'avant triangulaire blanche sur le côté gauche)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(-24 * s, -5 * s);
  ctx.lineTo(0, -10 * s);
  ctx.closePath();
  ctx.fill();

  // 2. Grand-Voile très large (Triangle déployé sur le côté droit)
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.bezierCurveTo(22 * s, -10 * s, 36 * s, 10 * s, 32 * s, 26 * s); // Grande envergure (32% de largeur)
  ctx.lineTo(0, 20 * s);
  ctx.closePath();
  ctx.fill();

  // 3. Coque effilée (Légèrement élargie pour la structure)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);
  ctx.lineTo(11 * s, -12 * s);
  ctx.lineTo(8 * s, 32 * s);
  ctx.lineTo(0, 40 * s);
  ctx.lineTo(-8 * s, 32 * s);
  ctx.lineTo(-11 * s, -12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Mât principal + Bôme large
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size * 0.045);
  
  // Mât
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(0, 24 * s);
  ctx.stroke();

  // Bôme bien visible tenant la grande voile
  ctx.beginPath();
  ctx.moveTo(0, 20 * s);
  ctx.lineTo(32 * s, 26 * s);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}