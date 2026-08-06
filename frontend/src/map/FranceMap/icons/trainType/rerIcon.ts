import { createTrainIconBase } from './baseTrainIcon';

// Bleu Île-de-France Mobilités, cohérent avec l'identité RER
export function createRerIcon(size = 64): ImageData {
  return createTrainIconBase('#0088ce', size, 'suburban');
}
