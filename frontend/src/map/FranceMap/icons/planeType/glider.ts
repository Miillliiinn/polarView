// Icône de Planeur - 50
export function createGliderIcon(
  color: string = '#f8fafc', 
  size: number = 130, 
  angleDeg: number = 0
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const s = size / 130;
  const strokeColor = '#0f172a';

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. SILHOUETTE DU FUSELAGE ET DES AILES ---
  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.8, size * 0.008);

  ctx.beginPath();

  // Nez profilé du planeur
  ctx.moveTo(0, -56 * s);

  // Flanc droit du nez vers le cockpit
  ctx.bezierCurveTo(2.5 * s, -52 * s, 3.2 * s, -40 * s, 3.2 * s, -20 * s);

  // Aile Droite (Grand allongement)
  ctx.lineTo(3.2 * s, -2 * s);              // Emplanture bord d'attaque
  ctx.lineTo(60 * s, 2 * s);                // Bord d'attaque aile
  ctx.lineTo(62 * s, 5 * s);                // Winglet droit (Saumon)
  ctx.lineTo(58 * s, 6 * s);                // Winglet fuite
  ctx.lineTo(3.0 * s, 2 * s);               // Bord de fuite aile

  // Fuselage arrière (Poutre fine)
  ctx.bezierCurveTo(2.2 * s, 20 * s, 1.8 * s, 38 * s, 1.2 * s, 48 * s);

  // Empennage en T (Stabilisateur horizontal haut)
  ctx.lineTo(16 * s, 46 * s);               // Winglet arrière droit
  ctx.lineTo(16 * s, 50 * s);               // Saumon empennage droit
  ctx.lineTo(0.8 * s, 51 * s);              // Bord de fuite vers centre

  // Cône de queue extrême
  ctx.lineTo(0, 54 * s);
  ctx.lineTo(-0.8 * s, 51 * s);

  // Empennage en T Gauche (Symétrie)
  ctx.lineTo(-16 * s, 50 * s);
  ctx.lineTo(-16 * s, 46 * s);
  ctx.lineTo(-1.2 * s, 48 * s);

  // Fuselage arrière gauche
  ctx.bezierCurveTo(-1.8 * s, 38 * s, -2.2 * s, 20 * s, -3.0 * s, 2 * s);

  // Aile Gauche (Symétrie)
  ctx.lineTo(-58 * s, 6 * s);
  ctx.lineTo(-62 * s, 5 * s);
  ctx.lineTo(-60 * s, 2 * s);
  ctx.lineTo(-3.2 * s, -2 * s);

  // Flanc gauche cockpit vers le nez
  ctx.lineTo(-3.2 * s, -20 * s);
  ctx.bezierCurveTo(-3.2 * s, -40 * s, -2.5 * s, -52 * s, 0, -56 * s);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- 2. VERRIÈRE DU COCKPIT (Goutte d'eau translucide) ---
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.6, size * 0.005);

  ctx.beginPath();
  ctx.moveTo(0, -48 * s);
  ctx.bezierCurveTo(2.2 * s, -42 * s, 2.4 * s, -26 * s, 0, -14 * s);
  ctx.bezierCurveTo(-2.4 * s, -26 * s, -2.2 * s, -42 * s, 0, -48 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Reflet lumineux sur le cockpit
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(-0.8 * s, -34 * s, 0.8 * s, 8 * s, -Math.PI / 12, 0, Math.PI * 2);
  ctx.fill();

  // --- 3. LIGNES DE COMMANDES ET STRUCTURALES ---
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.beginPath();

  // Ailerons Droite
  ctx.moveTo(25 * s, 4.2 * s); ctx.lineTo(55 * s, 5.7 * s);
  // Ailerons Gauche
  ctx.moveTo(-25 * s, 4.2 * s); ctx.lineTo(-55 * s, 5.7 * s);

  // Gouverne de profondeur (Empennage T)
  ctx.moveTo(-14 * s, 48.5 * s); ctx.lineTo(14 * s, 48.5 * s);
  ctx.stroke();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}