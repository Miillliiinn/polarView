import { createTrainIconBase } from './baseTrainIcon';

// Indigo, distinct du bleu RER tout en restant dans la même famille IDF
export function createTransilienIcon(size = 64): ImageData {
  return createTrainIconBase('#5c4b99', size, 'suburban');
}
