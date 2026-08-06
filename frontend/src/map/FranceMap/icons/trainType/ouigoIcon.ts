import { createTrainIconBase } from './baseTrainIcon';

// Même matériel roulant que le TGV INOUI (nez profilé identique),
// violet pour rester bien distinct visuellement du rose TGV INOUI
export function createOuigoIcon(size = 64): ImageData {
  return createTrainIconBase('#8f2dd6', size, 'highspeed');
}
