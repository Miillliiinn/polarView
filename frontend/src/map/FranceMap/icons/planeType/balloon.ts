// Icône de Montgolfière (Hot Air Balloon) haute fidélité
export function createBalloonIcon(primaryColor: string = '#ef4444', secondaryColor: string = '#f59e0b', size: number = 55, angleDeg: number = 0
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

  // --- 1. CORDAGES DE SUSPENSION ---
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = Math.max(0.6, size * 0.008);
  ctx.beginPath();
  // Cordes extérieures et intérieures
  ctx.moveTo(-11 * s, 26 * s); ctx.lineTo(-7 * s, 38 * s);
  ctx.moveTo(11 * s, 26 * s);  ctx.lineTo(7 * s, 38 * s);
  ctx.moveTo(-4 * s, 26 * s);  ctx.lineTo(-3 * s, 38 * s);
  ctx.moveTo(4 * s, 26 * s);   ctx.lineTo(3 * s, 38 * s);
  ctx.stroke();

  // --- 2. NACELLE EN OSIER ---
  ctx.fillStyle = '#78350f'; // Couleur osier / bois
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(0.8, size * 0.01);

  ctx.beginPath();
  ctx.roundRect(-8 * s, 38 * s, 16 * s, 11 * s, 2 * s);
  ctx.fill();
  ctx.stroke();

  // Maillage de l'osier
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = Math.max(0.5, size * 0.005);
  ctx.beginPath();
  ctx.moveTo(-8 * s, 43.5 * s); ctx.lineTo(8 * s, 43.5 * s);
  ctx.moveTo(-2.5 * s, 38 * s); ctx.lineTo(-2.5 * s, 49 * s);
  ctx.moveTo(2.5 * s, 38 * s);  ctx.lineTo(2.5 * s, 49 * s);
  ctx.stroke();

  // --- 3. FLAMME DU BRÛLEUR ---
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 28 * s, 3 * s, 0, Math.PI * 2);
  ctx.fill();

  // --- 4. CORPS DE LA MONTGOLFIÈRE (PANNEAUX ALTERNÉS) ---
  ctx.lineWidth = Math.max(0.8, size * 0.01);
  ctx.strokeStyle = strokeColor;

  // Fonction pour tracer un quart/panneau de la montgolfière
  const drawStrip = (xTopOffset: number, xBottomOffset: number, fillColor: string) => {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(0, -48 * s);
    // Courbe supérieure vers le flanc puis descente vers la jupe
    ctx.bezierCurveTo(xTopOffset * s, -48 * s, xTopOffset * s, 0, xBottomOffset * s, 26 * s);
    ctx.lineTo(-xBottomOffset * s, 26 * s);
    ctx.bezierCurveTo(-xTopOffset * s, 0, -xTopOffset * s, -48 * s, 0, -48 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Tracé par couches dégradées (du plus large au plus central)
  drawStrip(46, 13, primaryColor);    // Panneau externe droit/gauche
  drawStrip(30, 9, secondaryColor);   // Panneau intermédiaire
  drawStrip(14, 4.5, primaryColor);   // Panneau central

  // --- 5. OMBRAGE DE RELIEF SPHÉRIQUE 3D ---
  const shadowGradient = ctx.createRadialGradient(-12 * s, -20 * s, 5 * s, 0, 0, 42 * s);
  shadowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  ctx.moveTo(0, -48 * s);
  ctx.bezierCurveTo(46 * s, -48 * s, 46 * s, 0, 13 * s, 26 * s);
  ctx.lineTo(-13 * s, 26 * s);
  ctx.bezierCurveTo(-46 * s, 0, -46 * s, -48 * s, 0, -48 * s);
  ctx.closePath();
  ctx.fill();

  // --- 6. JUPE DE LA MONTGOLFIÈRE (BORD INFÉRIEUR) ---
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-13.5 * s, 24 * s, 27 * s, 3 * s, 1 * s);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}