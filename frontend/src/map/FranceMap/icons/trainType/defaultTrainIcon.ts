import { createTrainIconBase } from './baseTrainIcon';

// Gris neutre, utilisé quand le type de train n'est pas reconnu
export function createDefaultTrainIcon(size = 64): ImageData {
  return createTrainIconBase('#8a8a8a', size, 'regional');
}
