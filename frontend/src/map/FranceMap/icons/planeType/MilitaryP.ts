// Silhouette d'Airbus A400M avec camouflage militaire adaptatif
export function createA400MIcon(color: string, size: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = '#040404';
  ctx.lineWidth = Math.max(1, size * 0.025);
  ctx.lineJoin = 'round';

  const s = size / 130;

  function shadeColor(hex: string, percent: number): string
  {
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
  let contrastBoost = 1.5;
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
  const camoOutline = shadeColor(color, -50 * contrastBoost);
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
  ctx.fillStyle = color;
  ctx.fill(bodyPath);
  ctx.save();
  ctx.clip(bodyPath);
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

if (detailLevel === 'micro')
{
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
else if (detailLevel === 'low')
{

  drawCamoPatch(0, -25, [[-10, -8], [9, -12], [16, 2], [8, 12], [-9, 10], [-14, 0]], camoDark);
  drawCamoPatch(0, 22, [[-9, -10], [9, -11], [12, 2], [5, 11], [-10, 8]], camoDark);
  drawCamoPatch(-30, -6, [[-10, -6], [8, -8], [10, 2], [-9, 6]], camoLight);
  drawCamoPatch(30, -6, [[-10, -6], [8, -8], [10, 2], [-9, 6]], camoLight);

}
else if (detailLevel === 'medium')
{
    drawCamoPatch(-1, -43, [[-6, -10], [2, -14], [9, -7], [8, 1], [2, 9], [-5, 8], [-10, -1]], camoDark, 1.5);
    drawCamoPatch(9, -3, [[-12, -10], [3, -13], [16, -7], [19, 0], [11, 10], [-3, 9], [-14, 3]], camoDark, 1.45);
    drawCamoPatch(28, -10, [[-10, -6], [3, -9], [13, -4], [12, 5], [3, 8], [-9, 5], [-11, -1]], camoDark, 1.4);
    drawCamoPatch(-30, -8, [[-12, -5], [-2, -9], [11, -6], [13, 3], [4, 8], [-8, 6], [-10, 0]], camoDark, 1.45);
    drawCamoPatch(1, 25, [[-9, -12], [4, -13], [11, -3], [8, 7], [-2, 12], [-9, 4], [-11, -3]], camoDark, 1.35);
    drawCamoPatch(46, -12, [[-7, -4], [2, -6], [8, -2], [6, 5], [-2, 6], [-8, 2]], camoDark, 1.15);
    drawCamoPatch(-49, 2, [[-5, -3], [3, -4], [6, 0], [4, 4], [-3, 5], [-6, 1]], camoDark, 1.05);
    drawCamoPatch(-18, -24, [[-7, -6], [4, -7], [9, 0], [4, 8], [-5, 5], [-9, -2]], camoLight, 1.35);
    drawCamoPatch(23, 5, [[-8, -5], [3, -8], [10, -2], [7, 7], [-2, 9], [-9, 3]], camoLight, 1.4);
    drawCamoPatch(-2, 41, [[-7, -6], [4, -6], [9, 1], [3, 8], [-5, 6], [-9, -1]], camoLight, 1.25);
    drawCamoPatch(-41, -15, [[-6, -4], [3, -5], [7, 0], [4, 6], [-4, 4], [-7, -1]], camoLight, 1.15);
    drawCamoPatch(41, -4, [[-6, -5], [3, -4], [7, 2], [3, 6], [-4, 4], [-6, -1]], camoLight, 1.15);
    drawCamoPatch(15, -20, [[-4, -3], [3, -4], [5, 0], [3, 4], [-3, 3]], camoLight, 1);
}
else
{
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

  ctx.lineWidth = Math.max(1, size * 0.005);
  ctx.strokeStyle = '#040404';
  ctx.stroke(bodyPath);

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
  if (detailLevel === 'micro')
  {
    ctx.fillStyle = camoDark;
    ctx.fillRect(-16 * s, 40 * s, 32 * s, 15 * s);
  }
  else if (detailLevel === 'low')
  {
    drawCamoPatch(0, 42, [[-8, -6], [7, -7], [10, 1], [4, 8], [-8, 5]], camoDark, 1.5);
  }
  else
  {
    drawCamoPatch(-6, 40, [[-6, -4], [5, -5], [7, 1], [3, 6], [-6, 4]], camoDark, 1.2);
    drawCamoPatch(6, 45, [[-5, -4], [5, -4], [6, 3], [-1, 4], [-5, 1]], camoLight, 1.2);
  }
  ctx.restore();

  ctx.lineWidth = Math.max(1, size * 0.016);
  ctx.strokeStyle = '#040404';
  ctx.stroke(tailPath);
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