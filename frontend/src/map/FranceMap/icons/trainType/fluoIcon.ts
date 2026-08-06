import { createTrainIconBase } from './baseTrainIcon';

// Vert fluo, cohérent avec le nom de la marque
export function createFluoIcon(size = 64): ImageData {
  return createTrainIconBase('#8cc63f', size, 'regional');
}
