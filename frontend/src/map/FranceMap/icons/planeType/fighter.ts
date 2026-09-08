// Silhouette de Jet de Combat (JETM) - Eurofighter / Rafale avec camouflage militaire
export function createFighterJetIcon(color: string, size: number, angleDeg: number = 0): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.022);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const s = size / 130;

  // 1. Nuancier Militaire Dynamique
  function shadeColor(hex: string, percent: number): string {
    let r = 0, g = 0, b = 0;
    if (hex.startsWith('#')) {
      const h = hex.replace('#', '');
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      r = parseInt(full.substring(0, 2), 16);
      g = parseInt(full.substring(2, 4), 16);
      b = parseInt(full.substring(4, 6), 16);
    }
    r = Math.min(255, Math.max(0, Math.round(r + (percent / 100) * 255)));
    g = Math.min(255, Math.max(0, Math.round(g + (percent / 100) * 255)));
    b = Math.min(255, Math.max(0, Math.round(b + (percent / 100) * 255)));
    return `rgb(${r}, ${g}, ${b})`;
  }

  const camoDark = shadeColor(color, -35);
  const camoLight = shadeColor(color, 20);
  const camoOutline = shadeColor(color, -55);

  // 2. Tracé de la silhouette aérodynamique (Aile Delta + Plan Canard + Fuselage affilé)
  const bodyPath = new Path2D();
  
  // Nez extrêmement profilé
  bodyPath.moveTo(0, -58 * s);
  bodyPath.bezierCurveTo(1.5 * s, -58 * s, 3 * s, -45 * s, 3.5 * s, -32 * s);
  
  // Plan Canard Droit
  bodyPath.lineTo(12 * s, -28 * s);
  bodyPath.lineTo(11 * s, -22 * s);
  bodyPath.lineTo(4 * s, -23 * s);
  
  // Aile Delta Droite
  bodyPath.lineTo(38 * s, 15 * s);    // Saumon d'aile
  bodyPath.lineTo(37 * s, 21 * s);    // BORD d'attaque extérieur
  bodyPath.lineTo(24 * s, 18 * s);    // Décrochement aileron
  bodyPath.lineTo(6 * s, 21 * s);     // Emplanture aile arrière
  
  // Fuselage Arrière & Tuyères
  bodyPath.lineTo(5 * s, 48 * s);     // Tuyère droite
  bodyPath.lineTo(0.5 * s, 48 * s);
  bodyPath.lineTo(0, 52 * s);         // Séparateur de tuyères
  bodyPath.lineTo(-0.5 * s, 48 * s);
  bodyPath.lineTo(-5 * s, 48 * s);    // Tuyère gauche
  
  // Symphonie Aile Delta Gauche
  bodyPath.lineTo(-6 * s, 21 * s);
  bodyPath.lineTo(-24 * s, 18 * s);
  bodyPath.lineTo(-37 * s, 21 * s);
  bodyPath.lineTo(-38 * s, 15 * s);
  
  // Plan Canard Gauche
  bodyPath.lineTo(-4 * s, -23 * s);
  bodyPath.lineTo(-11 * s, -22 * s);
  bodyPath.lineTo(-12 * s, -28 * s);
  bodyPath.lineTo(-3.5 * s, -32 * s);
  
  // Retour au nez
  bodyPath.bezierCurveTo(-3 * s, -45 * s, -1.5 * s, -58 * s, 0, -58 * s);
  bodyPath.closePath();

  // Remplissage de la couleur de base
  ctx.fillStyle = color;
  ctx.fill(bodyPath);

  // 3. Application du Camouflage Procédural
  ctx.save();
  ctx.clip(bodyPath);

  function drawCamoPatch(
    cx: number,
    cy: number,
    points: [number, number][],
    fill: string,
    scale = 1
  ) {
    ctx.beginPath();
    ctx.moveTo(cx + points[0][0] * s * scale, cy + points[0][1] * s * scale);
    for (let i = 1; i < points.length; i++) {
      const [px, py] = points[i];
      const [prevX, prevY] = points[i - 1];
      const cpx = cx + ((prevX + px) / 2) * s * scale;
      const cpy = cy + ((prevY + py) / 2) * s * scale;
      ctx.quadraticCurveTo(cx + prevX * s * scale, cy + prevY * s * scale, cpx, cpy);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = Math.max(0.5, size * 0.005);
    ctx.strokeStyle = camoOutline;
    ctx.stroke();
  }

  // Taches sombres
  drawCamoPatch(0, -40, [[-4, -8], [2, -10], [5, -4], [4, 3], [-3, 5], [-6, -1]], camoDark, 1.2);
  drawCamoPatch(18, 0, [[-8, -5], [3, -8], [11, -2], [8, 6], [-2, 7], [-9, 2]], camoDark, 1.3);
  drawCamoPatch(-20, 2, [[-9, -3], [1, -7], [10, -1], [7, 5], [-3, 6], [-8, 1]], camoDark, 1.25);
  drawCamoPatch(0, 30, [[-6, -8], [4, -9], [8, -1], [5, 7], [-4, 8], [-7, 1]], camoDark, 1.2);

  // Taches claires
  drawCamoPatch(-2, -20, [[-5, -6], [3, -7], [7, -1], [4, 6], [-3, 5], [-6, -2]], camoLight, 1.15);
  drawCamoPatch(26, 10, [[-6, -4], [2, -5], [7, 0], [4, 5], [-3, 4], [-6, -1]], camoLight, 1.1);
  drawCamoPatch(-25, 8, [[-5, -4], [3, -5], [6, 1], [3, 5], [-4, 4], [-6, -1]], camoLight, 1.1);
  drawCamoPatch(0, 10, [[-5, -5], [3, -6], [6, 1], [3, 6], [-4, 5]], camoLight, 1.1);

  ctx.restore();

  // 4. Contour Global Externe
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.strokeStyle = '#040404';
  ctx.stroke(bodyPath);

  // 5. Verrière / Cockpit (Profilé et mince)
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.moveTo(0, -38 * s);
  ctx.bezierCurveTo(2 * s, -38 * s, 2.8 * s, -28 * s, 2.5 * s, -14 * s);
  ctx.lineTo(-2.5 * s, -14 * s);
  ctx.bezierCurveTo(-2.8 * s, -28 * s, -2 * s, -38 * s, 0, -38 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ligne de structure centrale du cockpit
  ctx.beginPath();
  ctx.moveTo(0, -38 * s);
  ctx.lineTo(0, -14 * s);
  ctx.stroke();

  // 6. Lignes de Structure / D Derive & Gouvernes
  ctx.beginPath();
  // Arête dorsale / Dérive centrale
  ctx.moveTo(0, -12 * s);
  ctx.lineTo(0, 42 * s);
  // Lignes des volets / ailerons delta
  ctx.moveTo(8 * s, 16 * s); ctx.lineTo(22 * s, 14 * s);
  ctx.moveTo(-8 * s, 16 * s); ctx.lineTo(-22 * s, 14 * s);
  ctx.stroke();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}