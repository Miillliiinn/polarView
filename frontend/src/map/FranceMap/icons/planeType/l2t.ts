// Silhouette L2T - Bi-turbopropulseur avec nacelles et hélices intégrées
export function createL2TIcon(color: string, size: number, angleDeg: number = 0): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1.5, size * 0.032);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const s = size / 150;

  ctx.beginPath();
  // 1. Nez & Fuselage avant
  ctx.moveTo(0, -66 * s);
  ctx.bezierCurveTo(3 * s, -66 * s, 6 * s, -52 * s, 6.5 * s, -30 * s);
  ctx.lineTo(7 * s, -8 * s);

  // 2. Aile Droite (Emplanture)
  ctx.lineTo(20 * s, -6 * s);

  // --- Moteur & Hélice Droite ---
  ctx.lineTo(20 * s, -18 * s); // Flanc gauche de la nacelle
  // Hélice Droite (Croix/Pales)
  ctx.lineTo(14 * s, -18 * s); // Pale externe gauche
  ctx.lineTo(14 * s, -21 * s);
  ctx.lineTo(21 * s, -20 * s); // Cône central
  ctx.lineTo(22.5 * s, -27 * s); // Pale haute
  ctx.lineTo(24 * s, -27 * s);
  ctx.lineTo(24 * s, -20 * s);
  ctx.lineTo(31 * s, -21 * s); // Pale externe droite
  ctx.lineTo(31 * s, -18 * s);
  ctx.lineTo(25 * s, -18 * s);
  ctx.lineTo(25 * s, -6 * s);  // Flanc droit de la nacelle

  // 3. Bout d'aile Droit
  ctx.lineTo(62 * s, -2 * s);
  ctx.lineTo(60 * s, 5 * s);
  ctx.lineTo(25 * s, 3 * s);

  // Arrière Nacelle Droite (Dépassement sous l'aile)
  ctx.lineTo(25 * s, 12 * s);
  ctx.lineTo(20 * s, 12 * s);
  ctx.lineTo(20 * s, 4 * s);

  // 4. Fuselage Arrière & Empennage
  ctx.lineTo(7 * s, 6 * s);
  ctx.lineTo(5 * s, 40 * s);
  ctx.lineTo(28 * s, 48 * s);  // Stabilisateur droit
  ctx.lineTo(26 * s, 56 * s);
  ctx.lineTo(2 * s, 54 * s);
  ctx.lineTo(0, 58 * s);       // Pointe de queue
  ctx.lineTo(-2 * s, 54 * s);
  ctx.lineTo(-26 * s, 56 * s); // Stabilisateur gauche
  ctx.lineTo(-28 * s, 48 * s);
  ctx.lineTo(-5 * s, 40 * s);
  ctx.lineTo(-7 * s, 6 * s);

  // --- Moteur & Hélice Gauche ---
  ctx.lineTo(-20 * s, 4 * s);
  ctx.lineTo(-20 * s, 12 * s); // Arrière Nacelle Gauche (Dépassement sous l'aile)
  ctx.lineTo(-25 * s, 12 * s);
  ctx.lineTo(-25 * s, 3 * s);

  // 5. Bout d'aile Gauche
  ctx.lineTo(-60 * s, 5 * s);
  ctx.lineTo(-62 * s, -2 * s);
  ctx.lineTo(-25 * s, -6 * s);

  // Hélice Gauche (Croix/Pales)
  ctx.lineTo(-25 * s, -18 * s); // Flanc droit de la nacelle
  ctx.lineTo(-19 * s, -18 * s); // Pale externe droite
  ctx.lineTo(-19 * s, -21 * s);
  ctx.lineTo(-22.5 * s, -20 * s);
  ctx.lineTo(-22.5 * s, -27 * s); // Pale haute
  ctx.lineTo(-24 * s, -27 * s);
  ctx.lineTo(-24 * s, -20 * s);
  ctx.lineTo(-31 * s, -21 * s); // Pale externe gauche
  ctx.lineTo(-31 * s, -18 * s);
  ctx.lineTo(-20 * s, -18 * s); // Flanc gauche de la nacelle

  // 6. Retour au Nez
  ctx.lineTo(-20 * s, -6 * s);
  ctx.lineTo(-7 * s, -8 * s);
  ctx.lineTo(-6.5 * s, -30 * s);
  ctx.bezierCurveTo(-6 * s, -52 * s, -3 * s, -66 * s, 0, -66 * s);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}