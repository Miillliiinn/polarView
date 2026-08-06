import maplibregl from 'maplibre-gl';
import { createRerIcon } from './rerIcon';
import { createTransilienIcon } from './transilienIcon';
import { createTgvInouiIcon } from './tgvInouiIcon';
import { createOuigoIcon } from './ouigoIcon';
import { createBreizhGoIcon } from './breizhGoIcon';
import { createZouIcon } from './zouIcon';
import { createFluoIcon } from './fluoIcon';
import { createDefaultTrainIcon } from './defaultTrainIcon';

export {
  createRerIcon,
  createTransilienIcon,
  createTgvInouiIcon,
  createOuigoIcon,
  createBreizhGoIcon,
  createZouIcon,
  createFluoIcon,
  createDefaultTrainIcon
};

/**
 * Associe l'id d'image MapLibre au type renvoyé par l'API SNCF (`display.commercial_mode`).
 * À utiliser pour enregistrer les images (map.addImage) et piloter l'expression
 * 'icon-image' du layer en fonction de la propriété `type` de chaque feature.
 */
export const TRAIN_ICON_BY_TYPE: Record<string, string> = {
  RER: 'train-rer',
  TRANSILIEN: 'train-transilien',
  'TGV INOUI': 'train-tgv-inoui',
  OUIGO: 'train-ouigo',
  BreizhGo: 'train-breizhgo',
  'ZOU !': 'train-zou',
  FLUO: 'train-fluo'
};

export const DEFAULT_TRAIN_ICON_ID = 'train-default';

/**
 * Enregistre toutes les icônes de train dans le style MapLibre.
 * À appeler une seule fois, avant d'ajouter le layer symbol des trains.
 */
export function registerTrainIcons(map: maplibregl.Map, size = 64) {
  map.addImage('train-rer', createRerIcon(size));
  map.addImage('train-transilien', createTransilienIcon(size));
  map.addImage('train-tgv-inoui', createTgvInouiIcon(size));
  map.addImage('train-ouigo', createOuigoIcon(size));
  map.addImage('train-breizhgo', createBreizhGoIcon(size));
  map.addImage('train-zou', createZouIcon(size));
  map.addImage('train-fluo', createFluoIcon(size));
  map.addImage(DEFAULT_TRAIN_ICON_ID, createDefaultTrainIcon(size));
}
