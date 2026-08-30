// Reproduction ultra-fidèle & modernisée d'un drone MALE (ex: MQ-9 Reaper)
export function createUAVIcon(color: string, size: number, angleDeg: number = 0): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const s = size / 130;
  const strokeColor = '#0b0f19';
  
  ctx.lineWidth = Math.max(0.8, size * 0.008);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. HÉLICE ARRIÈRE (PROPULSEUR) ---
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.ellipse(0, 42 * s, 8 * s, 1.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- 2. SILHOUETTE PRINCIPALE (FUSELAGE & AILES) ---
  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.beginPath();

  // Tube Pitot / Nez
  ctx.moveTo(0, -58 * s);
  ctx.lineTo(0.5 * s, -54 * s);

  // Radôme SATCOM avant (Bulbe)
  ctx.bezierCurveTo(4.5 * s, -53 * s, 5.8 * s, -42 * s, 5.5 * s, -28 * s);
  ctx.bezierCurveTo(5.2 * s, -18 * s, 4.0 * s, -8 * s, 3.5 * s, -2 * s);

  // Aile Droite (Profil effilé avec Winglet)
  ctx.lineTo(56 * s, -4 * s);               // Bord d'attaque
  ctx.lineTo(60 * s, -8 * s);               // Winglet droit (Pointe avant)
  ctx.lineTo(61 * s, -3 * s);               // Winglet droit (Saumon)
  ctx.lineTo(57 * s, 1 * s);                // Saumon / Bord de fuite ext.
  ctx.lineTo(3.5 * s, 3 * s);               // Bord de fuite droit

  // Fuselage central arrière
  ctx.lineTo(2.8 * s, 22 * s);

  // Empennage V-Tail Droit
  ctx.lineTo(22 * s, 36 * s);               // Extrémité V-Tail droit
  ctx.lineTo(19 * s, 39.5 * s);             // Saumon V-Tail
  ctx.lineTo(2.0 * s, 28 * s);              // Emplanture arrière

  // Cône de queue
  ctx.lineTo(1.5 * s, 41 * s);
  ctx.lineTo(-1.5 * s, 41 * s);

  // Empennage V-Tail Gauche (Symétrie)
  ctx.lineTo(-2.0 * s, 28 * s);
  ctx.lineTo(-19 * s, 39.5 * s);
  ctx.lineTo(-22 * s, 36 * s);
  ctx.lineTo(-2.8 * s, 22 * s);

  // Fuselage central gauche
  ctx.lineTo(-3.5 * s, 3 * s);

  // Aile Gauche (Symétrie)
  ctx.lineTo(-57 * s, 1 * s);
  ctx.lineTo(-61 * s, -3 * s);
  ctx.lineTo(-60 * s, -8 * s);
  ctx.lineTo(-56 * s, -4 * s);
  ctx.lineTo(-3.5 * s, -2 * s);

  // Nez gauche
  ctx.bezierCurveTo(-4.0 * s, -8 * s, -5.2 * s, -18 * s, -5.5 * s, -28 * s);
  ctx.bezierCurveTo(-5.8 * s, -42 * s, -4.5 * s, -53 * s, -0.5 * s, -54 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- 3. LIGNES DE STRUCTURE ET DÉTAILS DU FUSELAGE ---
  ctx.beginPath();
  // Séparation du Radôme SATCOM
  ctx.moveTo(-4.8 * s, -32 * s);
  ctx.quadraticCurveTo(0, -29 * s, 4.8 * s, -32 * s);
  // Panneaux d'ailes
  ctx.moveTo(12 * s, -1 * s); ctx.lineTo(12 * s, 2.5 * s);
  ctx.moveTo(32 * s, -2.3 * s); ctx.lineTo(32 * s, 1.8 * s);
  ctx.moveTo(-12 * s, -1 * s); ctx.lineTo(-12 * s, 2.5 * s);
  ctx.moveTo(-32 * s, -2.3 * s); ctx.lineTo(-32 * s, 1.8 * s);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.stroke();

  // --- 4. PYLÔNES D'ARMEMENT / CHARGE UTILE (4 Pylônes) ---
  const drawPylon = (xCenter: number, length: number) => {
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect(xCenter - 1.2 * s, -length * s / 2, 2.4 * s, length * s, 1 * s);
    ctx.fill();
  };

  // Pylônes internes et externes
  drawPylon(18 * s, 14);
  drawPylon(-18 * s, 14);
  drawPylon(34 * s, 10);
  drawPylon(-34 * s, 10);

  // --- 5. BOULE OPTRONIQUE (EO/IR GIMBAL CAMÉRA) ---
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.6, size * 0.005);
  ctx.beginPath();
  ctx.arc(0, -42 * s, 3.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Reflet optique sur la caméra
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-1 * s, -43 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}