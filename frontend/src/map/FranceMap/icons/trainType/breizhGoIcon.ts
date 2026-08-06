import { createTrainIconBase } from './baseTrainIcon';

// Or/ochre, clin d'œil à l'hermine bretonne, bien visible sur fond marine
export function createBreizhGoIcon(size = 64): ImageData {
  return createTrainIconBase('#d4a017', size, 'regional');
}
