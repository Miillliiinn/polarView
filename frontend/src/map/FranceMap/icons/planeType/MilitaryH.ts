export function createMilitaryHelicopterIcon(
  color: string = '#27342b', 
  size: number = 130, 
  angleDeg: number = 0,
  rotorAngleDeg: number = 45 // Permet de faire tourner l'hélice dynamiquement
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
  const strokeColor = '#0b0f19';
  const rotorRad = (rotorAngleDeg * Math.PI) / 180;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // --- 1. ROTOR DE QUEUE (ANIMÉ) ---
  ctx.save();
  ctx.translate(-3.5 * s, 48 * s);
  ctx.rotate(rotorRad * 2); // Le rotor de queue tourne plus vite
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * s, 1.2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- 2. SILHOUETTE DU FUSELAGE ---
  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.8, size * 0.008);

  ctx.beginPath();
  // Nez & Canon
  ctx.moveTo(0, -52 * s);
  ctx.lineTo(2 * s, -48 * s);

  // Cockpit & Côté Droit
  ctx.bezierCurveTo(6 * s, -44 * s, 7.5 * s, -30 * s, 7 * s, -18 * s);

  // Ailette Droit
  ctx.lineTo(24 * s, -15 * s);
  ctx.lineTo(25 * s, -8 * s);
  ctx.lineTo(6.5 * s, -6 * s);

  // Poutre de queue Droite
  ctx.lineTo(4 * s, 22 * s);
  ctx.lineTo(2.5 * s, 46 * s);

  // Empennage horizontal Droit
  ctx.lineTo(12 * s, 44 * s);
  ctx.lineTo(11 * s, 48 * s);
  ctx.lineTo(1.5 * s, 50 * s);

  // Symétrie Gauche
  ctx.lineTo(-1.5 * s, 50 * s);
  ctx.lineTo(-11 * s, 48 * s);
  ctx.lineTo(-12 * s, 44 * s);
  ctx.lineTo(-2.5 * s, 46 * s);
  ctx.lineTo(-4 * s, 22 * s);

  // Ailette Gauche
  ctx.lineTo(-6.5 * s, -6 * s);
  ctx.lineTo(-25 * s, -8 * s);
  ctx.lineTo(-24 * s, -15 * s);
  ctx.lineTo(-7 * s, -18 * s);

  // Cockpit & Côté Gauche
  ctx.bezierCurveTo(-7.5 * s, -30 * s, -6 * s, -44 * s, -2 * s, -48 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- 3. ARMEMENT (PODS ROQUETTES) ---
  const drawRocketPod = (xCenter: number) => {
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.roundRect(xCenter - 2 * s, -14 * s, 4 * s, 10 * s, 1 * s);
    ctx.fill();
  };
  drawRocketPod(16 * s);
  drawRocketPod(-16 * s);

  // --- 4. VERRIÈRE DU COCKPIT ---
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.6, size * 0.005);
  ctx.beginPath();
  ctx.moveTo(0, -45 * s);
  ctx.bezierCurveTo(4.5 * s, -40 * s, 4.5 * s, -24 * s, 0, -18 * s);
  ctx.bezierCurveTo(-4.5 * s, -24 * s, -4.5 * s, -40 * s, 0, -45 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- 5. TOURELLE OPTRONIQUE & CANON (NEZ) ---
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, -48 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.8, size * 0.008);
  ctx.beginPath();
  ctx.moveTo(0, -50 * s);
  ctx.lineTo(0, -56 * s);
  ctx.stroke();

  // --- 6. ROTOR PRINCIPAL AVEC EFFET DE ROTATION ---
  const rotorY = -15 * s;

  // Flou de mouvement (Disque d'air balayé)
  ctx.beginPath();
  ctx.arc(0, rotorY, 52 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = Math.max(0.5, size * 0.004);
  ctx.stroke();

  // Traînée de rotation (Ombre circulaire radiale)
  ctx.beginPath();
  ctx.arc(0, rotorY, 50 * s, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 3 * s;
  ctx.stroke();

  // Pales animées (Semi-transparentes pour simuler la vitesse)
  const drawRotorBlade = (baseAngle: number) => {
    ctx.save();
    ctx.translate(0, rotorY);
    ctx.rotate(baseAngle + rotorRad);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.roundRect(-1.5 * s, -52 * s, 3 * s, 52 * s, 1 * s);
    ctx.fill();
    ctx.restore();
  };

  drawRotorBlade(0);
  drawRotorBlade(Math.PI / 2);
  drawRotorBlade(Math.PI);
  drawRotorBlade((3 * Math.PI) / 2);

  // Moyeu central du rotor
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(0, rotorY, 4.5 * s, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, rotorY, 2 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}