import { createTrainIconBase } from './baseTrainIcon';

// Rose/magenta, couleur emblématique de la marque TGV INOUI
export function createTgvInouiIcon(size = 64): ImageData {
  return createTrainIconBase('#e2007a', size, 'highspeed');
}
