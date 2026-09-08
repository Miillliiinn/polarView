// Silhouette L4J (A380) avec Camouflage Procédural Organique Complet
export function createL4JMIcon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineJoin = 'round';

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

  const camoDark = shadeColor(color, -40);
  const camoMedium = shadeColor(color, -20);
  const camoLight = shadeColor(color, 22);
  const camoHighlight = shadeColor(color, 40);
  const camoOutline = shadeColor(color, -60);

  // 2. Tracé officiel L4J
  const bodyPath = new Path2D();
  bodyPath.moveTo(0, -52 * s);
  bodyPath.bezierCurveTo(3 * s, -52 * s, 5.5 * s, -42 * s, 6 * s, -30 * s);
  bodyPath.lineTo(6.5 * s, -14 * s);
  bodyPath.lineTo(23 * s, -3 * s);
  bodyPath.lineTo(23.5 * s, -10 * s);
  bodyPath.lineTo(28.5 * s, -10 * s);
  bodyPath.lineTo(29.5 * s, 0 * s);
  bodyPath.lineTo(38 * s, 6 * s);
  bodyPath.lineTo(38.5 * s, -1 * s);
  bodyPath.lineTo(43.5 * s, -1 * s);
  bodyPath.lineTo(44.5 * s, 9 * s);
  bodyPath.lineTo(53 * s, 14.5 * s);
  bodyPath.quadraticCurveTo(58 * s, 18 * s, 57 * s, 20.5 * s);
  bodyPath.lineTo(9 * s, 10 * s);
  bodyPath.lineTo(7.5 * s, 32 * s);
  bodyPath.lineTo(22 * s, 42 * s);
  bodyPath.lineTo(21 * s, 48 * s);
  bodyPath.lineTo(3 * s, 44 * s);
  bodyPath.lineTo(0 * s, 54 * s);
  bodyPath.lineTo(-3 * s, 44 * s);
  bodyPath.lineTo(-21 * s, 48 * s);
  bodyPath.lineTo(-22 * s, 42 * s);
  bodyPath.lineTo(-7.5 * s, 32 * s);
  bodyPath.lineTo(-9 * s, 10 * s);
  bodyPath.lineTo(-57 * s, 20.5 * s);
  bodyPath.quadraticCurveTo(-58 * s, 18 * s, -53 * s, 14.5 * s);
  bodyPath.lineTo(-44.5 * s, 9 * s);
  bodyPath.lineTo(-43.5 * s, -1 * s);
  bodyPath.lineTo(-38.5 * s, -1 * s);
  bodyPath.lineTo(-38 * s, 6 * s);
  bodyPath.lineTo(-29.5 * s, 0 * s);
  bodyPath.lineTo(-28.5 * s, -10 * s);
  bodyPath.lineTo(-23.5 * s, -10 * s);
  bodyPath.lineTo(-23 * s, -3 * s);
  bodyPath.lineTo(-6.5 * s, -14 * s);
  bodyPath.lineTo(-6 * s, -30 * s);
  bodyPath.bezierCurveTo(-5.5 * s, -42 * s, -3 * s, -52 * s, 0, -52 * s);
  bodyPath.closePath();

  // Fond de base
  ctx.fillStyle = camoMedium;
  ctx.fill(bodyPath);

  // 3. Masquage strict
  ctx.save();
  ctx.clip(bodyPath);

  // Générateur de taches organiques (Blob Camouflage)
  function drawOrganicBlob(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    fill: string,
    rotation = 0,
    complexity = 8
  ) {
    ctx.save();
    ctx.translate(cx * s, cy * s);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.beginPath();

    const points: [number, number][] = [];
    for (let i = 0; i < complexity; i++) {
      const angle = (i / complexity) * Math.PI * 2;
      // Variation harmonique pour créer des bords irréguliers
      const distortion = 1 + 0.35 * Math.sin(i * 2.5) + 0.2 * Math.cos(i * 1.5);
      const x = Math.cos(angle) * rx * distortion * s;
      const y = Math.sin(angle) * ry * distortion * s;
      points.push([x, y]);
    }

    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 0; i < points.length; i++) {
      const pNext = points[(i + 1) % points.length];
      const xc = (points[i][0] + pNext[0]) / 2;
      const yc = (points[i][1] + pNext[1]) / 2;
      ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
    }

    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = Math.max(0.5, size * 0.005);
    ctx.strokeStyle = camoOutline;
    ctx.stroke();
    ctx.restore();
  }

  // 4. Cartographie complète des taches sur toute la surface de l'appareil

  // Couche 1 : Taches Foncées Sombres (Base de contraste)
  drawOrganicBlob(0, -42, 7, 12, camoDark, 15);
  drawOrganicBlob(-4, -20, 8, 14, camoDark, -25);
  drawOrganicBlob(5, -5, 9, 16, camoDark, 10);
  drawOrganicBlob(-25, -2, 18, 9, camoDark, -12);
  drawOrganicBlob(28, 2, 20, 8, camoDark, 8);
  drawOrganicBlob(-48, 14, 12, 6, camoDark, -5);
  drawOrganicBlob(46, 16, 13, 6, camoDark, 15);
  drawOrganicBlob(0, 20, 10, 15, camoDark, 0);
  drawOrganicBlob(-15, 42, 10, 6, camoDark, -20);
  drawOrganicBlob(14, 45, 9, 7, camoDark, 25);

  // Couche 2 : Taches Claires (Rupture visuelle)
  drawOrganicBlob(1, -30, 6, 10, camoLight, -10);
  drawOrganicBlob(-2, -8, 8, 12, camoLight, 20);
  drawOrganicBlob(-14, -6, 15, 7, camoLight, 15);
  drawOrganicBlob(16, -4, 16, 8, camoLight, -18);
  drawOrganicBlob(-38, 7, 14, 6, camoLight, -8);
  drawOrganicBlob(36, 9, 15, 5, camoLight, 12);
  drawOrganicBlob(-53, 17, 7, 4, camoLight, -3);
  drawOrganicBlob(52, 18, 8, 4, camoLight, 5);
  drawOrganicBlob(2, 35, 7, 12, camoLight, -5);

  // Couche 3 : Micro-Eclats "High-Tech" (Détails additionnels)
  drawOrganicBlob(-3, -48, 3, 5, camoHighlight, 0);
  drawOrganicBlob(28, -8, 5, 4, camoHighlight, -30);
  drawOrganicBlob(-26, -6, 6, 4, camoHighlight, 30);
  drawOrganicBlob(0, 8, 5, 8, camoHighlight, 45);
  drawOrganicBlob(-10, 32, 4, 6, camoHighlight, -15);
  drawOrganicBlob(11, 33, 4, 5, camoHighlight, 10);

  ctx.restore();

  // 5. Contour global principal
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.strokeStyle = '#040404';
  ctx.stroke(bodyPath);

  return ctx.getImageData(0, 0, size, size);
}