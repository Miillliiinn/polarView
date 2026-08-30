// Silhouette d'Airbus A380 avec réacteurs ajustés et bouts d'ailes arrondis à l'avant
export function createA380Icon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = size * 0.025;
  ctx.lineJoin = 'round';

  const s = size / 130;

  ctx.beginPath();
  
  // Nez (arrondi)
  ctx.moveTo(0, -52 * s);
  ctx.bezierCurveTo(3 * s, -52 * s, 5.5 * s, -42 * s, 6 * s, -30 * s);
  
  // Emplacement aile droite
  ctx.lineTo(6.5 * s, -14 * s);
  
  // Aile droite (bord d'attaque)
  ctx.lineTo(23 * s, -3 * s);
  
  // Réacteur intérieur droit (Engine 3)
  ctx.lineTo(23.5 * s, -10 * s);
  ctx.lineTo(28.5 * s, -10 * s);
  ctx.lineTo(29.5 * s, 0 * s);
  
  ctx.lineTo(38 * s, 6 * s);
  
  // Réacteur extérieur droit (Engine 4)
  ctx.lineTo(38.5 * s, -1 * s);
  ctx.lineTo(43.5 * s, -1 * s);
  ctx.lineTo(44.5 * s, 9 * s);
  
  // Bout d'aile droit arrondi vers l'avant
  ctx.lineTo(53 * s, 14.5 * s);
  ctx.quadraticCurveTo(58 * s, 18 * s, 57 * s, 20.5 * s);
  
  // Bord de fuite aile droite
  ctx.lineTo(9 * s, 10 * s);
  
  // Fuselage arrière droit
  ctx.lineTo(7.5 * s, 32 * s);
  
  // Empennage / Aile arrière droite
  ctx.lineTo(22 * s, 42 * s);
  ctx.lineTo(21 * s, 48 * s);
  ctx.lineTo(3 * s, 44 * s);
  
  // Queue / APU
  ctx.lineTo(0 * s, 54 * s);
  
  // Empennage / Aile arrière gauche
  ctx.lineTo(-3 * s, 44 * s);
  ctx.lineTo(-21 * s, 48 * s);
  ctx.lineTo(-22 * s, 42 * s);
  
  // Fuselage arrière gauche
  ctx.lineTo(-7.5 * s, 32 * s);
  ctx.lineTo(-9 * s, 10 * s);
  
  // Bout d'aile gauche arrondi vers l'avant
  ctx.lineTo(-57 * s, 20.5 * s);
  ctx.quadraticCurveTo(-58 * s, 18 * s, -53 * s, 14.5 * s);
  
  // Réacteur extérieur gauche (Engine 1)
  ctx.lineTo(-44.5 * s, 9 * s);
  ctx.lineTo(-43.5 * s, -1 * s);
  ctx.lineTo(-38.5 * s, -1 * s);
  ctx.lineTo(-38 * s, 6 * s);
  
  // Réacteur intérieur gauche (Engine 2)
  ctx.lineTo(-29.5 * s, 0 * s);
  ctx.lineTo(-28.5 * s, -10 * s);
  ctx.lineTo(-23.5 * s, -10 * s);
  ctx.lineTo(-23 * s, -3 * s);
  
  // Aile gauche (bord d'attaque)
  ctx.lineTo(-6.5 * s, -14 * s);
  
  // Fuselage avant gauche jusqu'au nez
  ctx.lineTo(-6 * s, -30 * s);
  ctx.bezierCurveTo(-5.5 * s, -42 * s, -3 * s, -52 * s, 0, -52 * s);

  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}