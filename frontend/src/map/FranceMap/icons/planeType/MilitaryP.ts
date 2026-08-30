// Silhouette d'Airbus A400M avec camouflage militaire adaptatif
export function createA400MIcon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.lineJoin = 'round';

  const s = size / 130;

  // --- Utilitaire : assombrir / éclaircir une couleur hex ---
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

  // --- Adaptation du contraste et du détail selon la taille ---
  // Seuils remontés : un rendu à 85px doit encore avoir un camouflage
  // nettement visible, pas un motif "haute-fidélité" trop subtil.
  let contrastBoost = 1.2;
  let detailLevel: 'high' | 'medium' | 'low' | 'micro' = 'high';

  if (size < 24) {
    contrastBoost = 3.5;
    detailLevel = 'micro';
  } else if (size < 40) {
    contrastBoost = 2.5;
    detailLevel = 'low';
  } else if (size < 70) {
    contrastBoost = 2;
    detailLevel = 'low';
  } else if (size < 100) {
    contrastBoost = 1.6;
    detailLevel = 'medium';
  } else {
    contrastBoost = 1.2;
    detailLevel = 'high';
  }

  const camoDark = shadeColor(color, -28 * contrastBoost);
  const camoLight = shadeColor(color, 18 * contrastBoost);
  // Contour fin autour de chaque tache : les détache nettement de la
  // couleur de base même quand le contraste de teinte reste modéré.
  const camoOutline = shadeColor(color, -50 * contrastBoost);

  // --- Construction du tracé du fuselage/ailes ---
  const bodyPath = new Path2D();
  bodyPath.moveTo(0, -52 * s);
  bodyPath.bezierCurveTo(3.5 * s, -52 * s, 6 * s, -44 * s, 6.5 * s, -34 * s);
  bodyPath.lineTo(7 * s, -20 * s);

  bodyPath.lineTo(15 * s, -17 * s);
  bodyPath.lineTo(15.5 * s, -22 * s);
  bodyPath.lineTo(19.5 * s, -22 * s);
  bodyPath.lineTo(20 * s, -15 * s);
  bodyPath.lineTo(33 * s, -10 * s);
  bodyPath.lineTo(33.5 * s, -15 * s);
  bodyPath.lineTo(37.5 * s, -15 * s);
  bodyPath.lineTo(38 * s, -8 * s);
  bodyPath.lineTo(56 * s, -1 * s);
  bodyPath.quadraticCurveTo(58 * s, 1 * s, 56 * s, 3 * s);
  bodyPath.lineTo(8 * s, -4 * s);

  bodyPath.lineTo(7.5 * s, 15 * s);
  bodyPath.lineTo(6.5 * s, 30 * s);

  bodyPath.lineTo(4.5 * s, 42 * s);
  bodyPath.lineTo(0 * s, 48 * s);
  bodyPath.lineTo(-4.5 * s, 42 * s);
  bodyPath.lineTo(-6.5 * s, 30 * s);

  bodyPath.lineTo(-7.5 * s, 15 * s);
  bodyPath.lineTo(-8 * s, -4 * s);

  bodyPath.lineTo(-56 * s, 3 * s);
  bodyPath.quadraticCurveTo(-58 * s, 1 * s, -56 * s, -1 * s);
  bodyPath.lineTo(-38 * s, -8 * s);
  bodyPath.lineTo(-37.5 * s, -15 * s);
  bodyPath.lineTo(-33.5 * s, -15 * s);
  bodyPath.lineTo(-33 * s, -10 * s);
  bodyPath.lineTo(-20 * s, -15 * s);
  bodyPath.lineTo(-19.5 * s, -22 * s);
  bodyPath.lineTo(-15.5 * s, -22 * s);
  bodyPath.lineTo(-15 * s, -17 * s);
  bodyPath.lineTo(-7 * s, -20 * s);

  bodyPath.lineTo(-6.5 * s, -34 * s);
  bodyPath.bezierCurveTo(-6 * s, -44 * s, -3.5 * s, -52 * s, 0, -52 * s);
  bodyPath.closePath();

  // Remplissage de base avec la couleur fournie
  ctx.fillStyle = color;
  ctx.fill(bodyPath);

  // --- Taches de camouflage (clip sur la silhouette du corps) ---
  ctx.save();
  ctx.clip(bodyPath);

  // Tache organique lissée, avec contour optionnel pour se détacher du fond
  function drawCamoPatch(
    cx: number,
    cy: number,
    points: [number, number][],
    fill: string,
    scale = 1,
    withOutline = true
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
    if (withOutline) {
      ctx.lineWidth = Math.max(0.5, size * 0.006);
      ctx.strokeStyle = camoOutline;
      ctx.stroke();
    }
  }

  if (detailLevel === 'micro') {
    // Très petites tailles (< 24px) : blocs géométriques nets (angles droits)
    ctx.fillStyle = camoDark;
    ctx.fillRect(-58 * s, -24 * s, 116 * s, 14 * s);
    ctx.strokeStyle = camoOutline;
    ctx.lineWidth = Math.max(0.6, size * 0.02);
    ctx.strokeRect(-58 * s, -24 * s, 116 * s, 14 * s);

    ctx.beginPath();
    ctx.moveTo(-8 * s, 10 * s);
    ctx.lineTo(8 * s, 10 * s);
    ctx.lineTo(4 * s, 45 * s);
    ctx.lineTo(-4 * s, 45 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (detailLevel === 'low') {
    // 20–70px : grandes zones bien contrastées et cerclées
    drawCamoPatch(0, -25, [[-10, -8], [9, -12], [16, 2], [8, 12], [-9, 10], [-14, 0]], camoDark, 1.7);
    drawCamoPatch(0, 22, [[-9, -10], [9, -11], [12, 2], [5, 11], [-10, 8]], camoDark, 1.7);
    drawCamoPatch(-30, -6, [[-10, -6], [8, -8], [10, 2], [-9, 6]], camoLight, 1.5);
    drawCamoPatch(30, -6, [[-10, -6], [8, -8], [10, 2], [-9, 6]], camoLight, 1.5);
  } else if (detailLevel === 'medium') {
    // 70–100px : motif organique à taches irrégulières, tailles variées,
    // réparties sur les zones structurelles réelles de l'avion plutôt
    // qu'en simple symétrie miroir répétée.

    // --- Grandes taches sombres (zones principales : nez, centre, ailes) ---
    // Nez / cockpit — grande tache allongée verticalement
    drawCamoPatch(
      -1, -42,
      [[-5, -9], [3, -13], [8, -6], [7, 2], [1, 8], [-6, 6], [-9, -2]],
      camoDark, 1.4
    );

    // Centre fuselage / racine des ailes — plus large, forme étirée horizontalement
    drawCamoPatch(
      8, -2,
      [[-11, -9], [4, -12], [15, -6], [18, 1], [10, 9], [-4, 8], [-13, 2]],
      camoDark, 1.4
    );

    // Aile droite (zone médiane, entre les 2 moteurs)
    drawCamoPatch(
      27, -9,
      [[-9, -5], [4, -8], [12, -3], [11, 4], [2, 7], [-8, 4]],
      camoDark, 1.35
    );

    // Aile gauche — forme légèrement différente pour casser la symétrie
    drawCamoPatch(
      -29, -7,
      [[-11, -4], [-1, -8], [10, -5], [12, 2], [3, 7], [-9, 5]],
      camoDark, 1.4
    );

    // Fuselage arrière (avant l'empennage)
    drawCamoPatch(
      1, 24,
      [[-8, -11], [5, -12], [10, -2], [7, 8], [-3, 11], [-10, 3]],
      camoDark, 1.3
    );

    // Petite tache isolée près du bord de fuite droit (détail de rupture)
    drawCamoPatch(
      44, -11,
      [[-6, -3], [3, -5], [7, -1], [5, 4], [-3, 5], [-7, 1]],
      camoDark, 1.1
    );

    // --- Taches claires (zones intermédiaires, plus petites et dispersées) ---
    drawCamoPatch(
      -17, -22,
      [[-6, -5], [5, -6], [8, 1], [3, 7], [-6, 4], [-8, -1]],
      camoLight, 1.3
    );

    drawCamoPatch(
      22, 6,
      [[-7, -4], [4, -7], [9, -1], [6, 6], [-3, 8], [-8, 2]],
      camoLight, 1.35
    );

    drawCamoPatch(
      -2, 40,
      [[-6, -5], [5, -5], [8, 2], [2, 7], [-6, 5], [-8, 0]],
      camoLight, 1.2
    );

    drawCamoPatch(
      -40, -14,
      [[-5, -3], [4, -4], [6, 1], [3, 5], [-5, 3]],
      camoLight, 1.1
    );

    drawCamoPatch(
      40, -3,
      [[-5, -4], [4, -3], [6, 2], [2, 5], [-5, 3]],
      camoLight, 1.1
    );
  } else {
    // >= 100px : motif complet, fidèle au camouflage réaliste
    drawCamoPatch(-2, -40, [[-4, -3], [3, -5], [6, 0], [3, 5], [-3, 4], [-6, 1]], camoDark);
    drawCamoPatch(10, -5, [[-8, -6], [6, -8], [14, -2], [8, 6], [-6, 5], [-12, -1]], camoDark);
    drawCamoPatch(-30, -8, [[-9, -5], [5, -7], [10, -1], [4, 5], [-7, 4]], camoDark);
    drawCamoPatch(30, -6, [[-9, -4], [6, -7], [11, 0], [5, 6], [-8, 3]], camoDark);
    drawCamoPatch(2, 20, [[-5, -8], [5, -9], [8, 1], [3, 8], [-6, 6]], camoDark);
    drawCamoPatch(-45, 0, [[-6, -4], [5, -5], [7, 0], [3, 5], [-5, 3]], camoDark);
    drawCamoPatch(45, 0, [[-6, -4], [5, -5], [7, 0], [3, 5], [-5, 3]], camoDark);

    drawCamoPatch(-15, -20, [[-4, -3], [4, -3], [5, 2], [-1, 4], [-5, 1]], camoLight);
    drawCamoPatch(18, 5, [[-4, -3], [4, -3], [5, 2], [-1, 4], [-5, 1]], camoLight);
    drawCamoPatch(-5, 35, [[-4, -3], [4, -3], [5, 2], [-1, 4], [-5, 1]], camoLight);
    drawCamoPatch(-38, -12, [[-3, -2], [3, -2], [4, 2], [-1, 3], [-4, 1]], camoLight);
    drawCamoPatch(38, -12, [[-3, -2], [3, -2], [4, 2], [-1, 3], [-4, 1]], camoLight);
  }

  ctx.restore();

  // Contour final du fuselage/ailes (redessiné par-dessus le camouflage)
  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.strokeStyle = '#040404';
  ctx.stroke(bodyPath);

  // --- Empennage en T ---
  const tailPath = new Path2D();
  tailPath.moveTo(-1.2 * s, 28 * s);
  tailPath.lineTo(-1.8 * s, 44 * s);
  tailPath.lineTo(-16 * s, 48 * s);
  tailPath.lineTo(-15.5 * s, 51 * s);
  tailPath.lineTo(-2 * s, 49 * s);
  tailPath.lineTo(-1 * s, 54 * s);
  tailPath.lineTo(1 * s, 54 * s);
  tailPath.lineTo(2 * s, 49 * s);
  tailPath.lineTo(15.5 * s, 51 * s);
  tailPath.lineTo(16 * s, 48 * s);
  tailPath.lineTo(1.8 * s, 44 * s);
  tailPath.lineTo(1.2 * s, 28 * s);
  tailPath.closePath();

  ctx.fillStyle = color;
  ctx.fill(tailPath);

  ctx.save();
  ctx.clip(tailPath);
  if (detailLevel === 'micro') {
    ctx.fillStyle = camoDark;
    ctx.fillRect(-16 * s, 40 * s, 32 * s, 15 * s);
  } else if (detailLevel === 'low') {
    drawCamoPatch(0, 42, [[-8, -6], [7, -7], [10, 1], [4, 8], [-8, 5]], camoDark, 1.5);
  } else {
    drawCamoPatch(-6, 40, [[-6, -4], [5, -5], [7, 1], [3, 6], [-6, 4]], camoDark, 1.2);
    drawCamoPatch(6, 45, [[-5, -4], [5, -4], [6, 3], [-1, 4], [-5, 1]], camoLight, 1.2);
  }
  ctx.restore();

  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.strokeStyle = '#040404';
  ctx.stroke(tailPath);

  // --- 4 Hélices avec disques de rotation ---
  const propPositions = [
    { x: 17.5 * s, y: -18.5 * s, angle: -12 },
    { x: 35.5 * s, y: -11.5 * s, angle: -8 },
    { x: -17.5 * s, y: -18.5 * s, angle: 12 },
    { x: -35.5 * s, y: -11.5 * s, angle: 8 },
  ];

  const propRadiusLong = 7.5 * s;
  const propRadiusShort = 1.2 * s;

  propPositions.forEach(({ x, y, angle }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);

    ctx.beginPath();
    ctx.ellipse(0, 0, propRadiusLong, propRadiusShort, 0, 0, Math.PI * 2);
    ctx.fillStyle = camoDark;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(0.7, size * 0.009);
    ctx.strokeStyle = '#040404';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 1.4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#040404';
    ctx.fill();

    ctx.restore();
  });

  return ctx.getImageData(0, 0, size, size);
}