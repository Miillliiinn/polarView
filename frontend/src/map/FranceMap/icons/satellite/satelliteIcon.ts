function drawSolarPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  accentColor: string
) {
  ctx.save();

  // Cadre extérieur et fond photovoltaïque sombre avec dégradé
  const bgGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  bgGrad.addColorStop(0, '#0b1329');
  bgGrad.addColorStop(1, '#1d2a44');

  ctx.fillStyle = bgGrad;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = Math.max(1, 1.5 * scale);

  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();

  // Cellules solaires (Grille 4x2)
  const cols = 4;
  const rows = 2;
  const cellW = w / cols;
  const cellH = h / rows;

  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(0.5, 0.8 * scale);

  ctx.beginPath();
  for (let i = 1; i < cols; i++) {
    ctx.moveTo(x + cellW * i, y);
    ctx.lineTo(x + cellW * i, y + h);
  }
  for (let j = 1; j < rows; j++) {
    ctx.moveTo(x, y + cellH * j);
    ctx.lineTo(x + w, y + cellH * j);
  }
  ctx.stroke();

  // Micro-reflets métalliques aux coins des panneaux
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#64748b';
  const cornerSize = 2 * scale;
  ctx.fillRect(x, y, cornerSize, cornerSize);
  ctx.fillRect(x + w - cornerSize, y, cornerSize, cornerSize);
  ctx.fillRect(x, y + h - cornerSize, cornerSize, cornerSize);
  ctx.fillRect(x + w - cornerSize, y + h - cornerSize, cornerSize, cornerSize);

  ctx.restore();
}

export function createSatelliteIcon(color: string = '#00e5ff', size: number = 128): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';

  const s = size / 130;

  // 1. Ondes de Signal Angulaires
  ctx.strokeStyle = color;
  const waveCenterY = 31 * s;

  for (let i = 1; i <= 3; i++) {
    const dist = (6 + i * 7.5) * s;
    const spread = (8 + i * 9) * s;
    
    ctx.beginPath();
    ctx.globalAlpha = 1 - (i - 1) * 0.3;
    ctx.lineWidth = Math.max(1, (3 - i * 0.6) * s);

    ctx.moveTo(-spread, waveCenterY + dist * 0.65);
    ctx.lineTo(0, waveCenterY + dist);
    ctx.lineTo(spread, waveCenterY + dist * 0.65);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 2. Bras d'antenne & Parabole concave
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = Math.max(1.5, 2.5 * s);
  ctx.beginPath();
  ctx.moveTo(0, 10 * s);
  ctx.lineTo(0, 30 * s);
  ctx.stroke();

  // Parabole (Tracé concave ajouté)
  const dishGrad = ctx.createLinearGradient(-12 * s, 30 * s, 12 * s, 30 * s);
  dishGrad.addColorStop(0, '#1e293b');
  dishGrad.addColorStop(0.5, '#475569');
  dishGrad.addColorStop(1, '#1e293b');

  ctx.fillStyle = dishGrad;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.beginPath();
  ctx.arc(0, 22 * s, 12 * s, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();

  // Receiver Tip (Tête de lecture d'antenne)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 31 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // 3. Structural Mounts (Attaches des panneaux solaires)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = Math.max(2, 3.5 * s);
  ctx.beginPath();
  ctx.moveTo(-28 * s, 0);
  ctx.lineTo(28 * s, 0);
  ctx.stroke();

  // 4. Panneaux solaires (Gauche & Droite)
  drawSolarPanel(ctx, -70 * s, -14 * s, 42 * s, 28 * s, s, color);
  drawSolarPanel(ctx, 28 * s, -14 * s, 42 * s, 28 * s, s, color);

  // 5. Corps principal
  const bw = 9 * s;
  const bh = 13 * s;
  const chamfer = 3 * s;

  const bodyGrad = ctx.createLinearGradient(-bw, -bh, bw, bh);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(1.5, 2 * s);

  ctx.beginPath();
  ctx.moveTo(-bw + chamfer, -bh);
  ctx.lineTo(bw - chamfer, -bh);
  ctx.lineTo(bw, -bh + chamfer);
  ctx.lineTo(bw, bh - chamfer);
  ctx.lineTo(bw - chamfer, bh);
  ctx.lineTo(-bw + chamfer, bh);
  ctx.lineTo(-bw, bh - chamfer);
  ctx.lineTo(-bw, -bh + chamfer);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6. Couches de détails techniques
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = Math.max(1, 1.2 * s);
  ctx.beginPath();
  ctx.moveTo(-bw + 1.5 * s, -4.5 * s);
  ctx.lineTo(bw - 1.5 * s, -4.5 * s);
  ctx.moveTo(-bw + 1.5 * s, 4.5 * s);
  ctx.lineTo(bw - 1.5 * s, 4.5 * s);
  ctx.stroke();

  // 7. Capteur / Lentille centrale brillante
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 * s;
  ctx.beginPath();
  ctx.arc(0, 0, 5.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}