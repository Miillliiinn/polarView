import { createTrainIconBase } from './baseTrainIcon';

// Orange soleil, identité PACA
export function createZouIcon(size = 64): ImageData {
  return createTrainIconBase('#f58220', size, 'regional');
}
