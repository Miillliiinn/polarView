export type TrainNoseStyle = 'highspeed' | 'suburban' | 'regional';

function drawTrainBody(ctx: CanvasRenderingContext2D, s: number, noseStyle: TrainNoseStyle) {
  ctx.beginPath();

  switch (noseStyle) {
    case 'highspeed':
      // Nez très effilé (TGV INOUI / OUIGO — même matériel roulant)
      ctx.moveTo(0, -48 * s);
      ctx.lineTo(3 * s, -38 * s);
      ctx.lineTo(3 * s, -18 * s);
      ctx.quadraticCurveTo(11 * s, -14 * s, 11 * s, 30 * s);
      ctx.quadraticCurveTo(11 * s, 36 * s, 5 * s, 36 * s);
      ctx.lineTo(-5 * s, 36 * s);
      ctx.quadraticCurveTo(-11 * s, 36 * s, -11 * s, 30 * s);
      ctx.lineTo(-11 * s, -18 * s);
      ctx.lineTo(-3 * s, -18 * s);
      ctx.lineTo(-3 * s, -38 * s);
      ctx.closePath();
      break;

    case 'suburban':
      // Nez arrondi, corps large (RER / Transilien — rames à deux niveaux)
      ctx.moveTo(0, -42 * s);
      ctx.quadraticCurveTo(14 * s, -36 * s, 15 * s, -16 * s);
      ctx.lineTo(15 * s, 34 * s);
      ctx.quadraticCurveTo(15 * s, 40 * s, 8 * s, 40 * s);
      ctx.lineTo(-8 * s, 40 * s);
      ctx.quadraticCurveTo(-15 * s, 40 * s, -15 * s, 34 * s);
      ctx.lineTo(-15 * s, -16 * s);
      ctx.quadraticCurveTo(-14 * s, -36 * s, 0, -42 * s);
      ctx.closePath();
      break;

    case 'regional':
    default:
      // Nez plat et court (matériel TER classique, BreizhGo, ZOU!, FLUO, fallback)
      ctx.moveTo(-13 * s, -32 * s);
      ctx.quadraticCurveTo(0, -38 * s, 13 * s, -32 * s);
      ctx.lineTo(13 * s, 32 * s);
      ctx.quadraticCurveTo(13 * s, 38 * s, 6 * s, 38 * s);
      ctx.lineTo(-6 * s, 38 * s);
      ctx.quadraticCurveTo(-13 * s, 38 * s, -13 * s, 32 * s);
      ctx.closePath();
      break;
  }

  ctx.fill();
  ctx.stroke();
}

export function createTrainIconBase(
  color: string,
  size: number,
  noseStyle: TrainNoseStyle
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(size / 2, size / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;

  const s = size / 100;

  drawTrainBody(ctx, s, noseStyle);

  ctx.beginPath();
  ctx.moveTo(0, -26 * s);
  ctx.lineTo(0, 28 * s);
  ctx.lineWidth = size * 0.012;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}
