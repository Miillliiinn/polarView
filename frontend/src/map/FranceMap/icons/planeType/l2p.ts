// Silhouette L2P haute précision - Bimoteur à pistons (ex: Beechcraft Baron, Piper Seneca)
export function createL2PIcon(color: string, size: number, angleDeg: number = 0): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#292929';
  ctx.lineWidth = Math.max(1, size * 0);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const s = size / 150;

  // 1. Fuselage Principal et Ailes
  ctx.beginPath();
  ctx.moveTo(0, -58 * s);
  ctx.bezierCurveTo(3.5 * s, -58 * s, 6 * s, -50 * s, 6.5 * s, -38 * s);
  ctx.lineTo(7 * s, -12 * s);
  
  // Aile Droite
  ctx.lineTo(58 * s, -8 * s);   
  ctx.lineTo(59.5 * s, -3 * s);  
  ctx.lineTo(57 * s, 4 * s);    
  ctx.lineTo(7 * s, 5 * s);     
  
  // Fuselage Arrière & Empennage
  ctx.lineTo(4.5 * s, 38 * s);
  ctx.lineTo(25 * s, 46 * s);   
  ctx.lineTo(24 * s, 53 * s);   
  ctx.lineTo(2 * s, 52 * s);   
  ctx.lineTo(0, 57 * s);
  ctx.lineTo(-2 * s, 52 * s);
  ctx.lineTo(-24 * s, 53 * s);
  ctx.lineTo(-25 * s, 46 * s);
  ctx.lineTo(-4.5 * s, 38 * s);
  ctx.lineTo(-7 * s, 5 * s);

  // Aile Gauche
  ctx.lineTo(-57 * s, 4 * s);
  ctx.lineTo(-59.5 * s, -3 * s);
  ctx.lineTo(-58 * s, -8 * s);
  ctx.lineTo(-7 * s, -12 * s);
  ctx.lineTo(-6.5 * s, -38 * s);
  ctx.bezierCurveTo(-6.5 * s, -50 * s, -3.5 * s, -58 * s, 0, -58 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Cockpit / Verrière avec relief
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.moveTo(-5.5 * s, -24 * s);
  ctx.bezierCurveTo(-2.5 * s, -27 * s, 2.5 * s, -27 * s, 5.5 * s, -24 * s);
  ctx.lineTo(6 * s, -12 * s);
  ctx.lineTo(-6 * s, -12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Separateur intérieur du cockpit
  ctx.beginPath();
  ctx.moveTo(0, -26 * s);
  ctx.lineTo(0, -12 * s);
  ctx.stroke();

  // 3. Nacelles Moteurs Profilées (Forme Aérodynamique)
  const drawNacelle = (x: number) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x - 3.5 * s, -16 * s);
    ctx.bezierCurveTo(x - 3.5 * s, -20 * s, x + 3.5 * s, -20 * s, x + 3.5 * s, -16 * s);
    ctx.lineTo(x + 3 * s, 8 * s);
    ctx.bezierCurveTo(x + 2 * s, 11 * s, x - 2 * s, 11 * s, x - 3 * s, 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  drawNacelle(20 * s);  // Nacelle Droite
  drawNacelle(-20 * s); // Nacelle Gauche

  // 4. Lignes d'Emplanture, Ailerons & Volets
  ctx.beginPath();
  // Raccord fuselage
  ctx.moveTo(-6 * s, -10 * s); ctx.lineTo(-5.5 * s, 6 * s);
  ctx.moveTo(6 * s, -10 * s);  ctx.lineTo(5.5 * s, 6 * s);
  // Lignes de fuite / ailerons (interrompues par les nacelles)
  ctx.moveTo(7 * s, 2 * s);    ctx.lineTo(16.5 * s, 1.2 * s);
  ctx.moveTo(23.5 * s, 0.7 * s); ctx.lineTo(55 * s, -1.5 * s);
  ctx.moveTo(-7 * s, 2 * s);   ctx.lineTo(-16.5 * s, 1.2 * s);
  ctx.moveTo(-23.5 * s, 0.7 * s); ctx.lineTo(-55 * s, -1.5 * s);
  // Ailerons
  ctx.moveTo(38 * s, 0);       ctx.lineTo(38 * s, -5.5 * s);
  ctx.moveTo(-38 * s, 0);      ctx.lineTo(-38 * s, -5.5 * s);
  // Profondeur arrière
  ctx.moveTo(6 * s, 50.5 * s);  ctx.lineTo(22 * s, 49.5 * s);
  ctx.moveTo(-6 * s, 50.5 * s); ctx.lineTo(-22 * s, 49.5 * s);
  ctx.stroke();

  // 5. Trappes des Moteurs / Puits de Train
  ctx.fillStyle = '#040404';
  ctx.fillRect(18.5 * s, 0, 3 * s, 6 * s);
  ctx.fillRect(-21.5 * s, 0, 3 * s, 6 * s);

  // 6. Hélices Tripales Détaillées avec Cône Aérodynamique
  const drawPropeller = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Disque de balayage fluide en arrière-plan
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.ellipse(0, 0, 8 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dessin des 3 pales d'hélice
    ctx.fillStyle = '#040404';
    for (let i = 0; i < 3; i++) {
      ctx.rotate((120 * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, -4.5 * s, 0.9 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cône d'hélice frontal
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(0, -0.5 * s, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  drawPropeller(20 * s, -18.5 * s);  // Moteur Droit
  drawPropeller(-20 * s, -18.5 * s); // Moteur Gauche

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}