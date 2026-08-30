// Silhouette d'hélicoptère biturbine - 45
export function createH2TIcon(color: string, size: number, angleDeg: number = 110): ImageData
{
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#040404';
    ctx.lineWidth = size * 0.015;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const s = size / 140;

    ctx.beginPath();
    ctx.moveTo(0, -48 * s);
    ctx.bezierCurveTo(7 * s, -48 * s, 10 * s, -38 * s, 10 * s, -20 * s);
    ctx.lineTo(9.5 * s, -5 * s);
    ctx.lineTo(8 * s, 12 * s);
    ctx.lineTo(4.5 * s, 22 * s);
    ctx.lineTo(1.8 * s, 55 * s);
    ctx.lineTo(11 * s, 55.5 * s);
    ctx.lineTo(10.5 * s, 58.5 * s);
    ctx.lineTo(1.6 * s, 58 * s);
    ctx.lineTo(1.5 * s, 68 * s);
    ctx.lineTo(6.5 * s, 67 * s);
    ctx.lineTo(6.5 * s, 69 * s);
    ctx.lineTo(1.5 * s, 69 * s);
    ctx.lineTo(1.2 * s, 71 * s);
    ctx.lineTo(-1.2 * s, 71 * s);
    ctx.lineTo(-1.5 * s, 68 * s);
    ctx.lineTo(-1.6 * s, 58 * s);
    ctx.lineTo(-10.5 * s, 58.5 * s);
    ctx.lineTo(-11 * s, 55.5 * s);
    ctx.lineTo(-1.8 * s, 55 * s);
    ctx.lineTo(-4.5 * s, 22 * s);
    ctx.lineTo(-8 * s, 12 * s);
    ctx.lineTo(-9.5 * s, -5 * s);
    ctx.bezierCurveTo(-10 * s, -20 * s, -7 * s, -48 * s, 0, -48 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(13.5 * s, -32 * s);
    ctx.lineTo(13.5 * s, 18 * s);
    ctx.moveTo(9.5 * s, -18 * s);
    ctx.lineTo(13.5 * s, -18 * s);
    ctx.moveTo(7 * s, 10 * s);
    ctx.lineTo(13.5 * s, 10 * s);
    ctx.moveTo(-13.5 * s, -32 * s);
    ctx.lineTo(-13.5 * s, 18 * s);
    ctx.moveTo(-9.5 * s, -18 * s);
    ctx.lineTo(-13.5 * s, -18 * s);
    ctx.moveTo(-7 * s, 10 * s);
    ctx.lineTo(-13.5 * s, 10 * s);
    ctx.stroke();
    ctx.save();
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.beginPath();
    ctx.arc(0, 0, 66 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#04040419';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 3; i++)
    {
        ctx.save();
        ctx.rotate((i * 2 * Math.PI) / 3);
        
        ctx.beginPath();
        ctx.rect(-1.8 * s, -66 * s, 5 * s, 62.5 * s);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    ctx.restore();
    return ctx.getImageData(0, 0, size, size);
}