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

function safeAddImage(map: maplibregl.Map, id: string, image: any) {
  if (!map.hasImage(id)) {
    map.addImage(id, image);
  }
}

export function registerTrainIcons(map: maplibregl.Map, size = 64)
{
  safeAddImage(map, 'train-rer', createRerIcon(size));
  safeAddImage(map, 'train-transilien', createTransilienIcon(size));
  safeAddImage(map, 'train-tgv-inoui', createTgvInouiIcon(size));
  safeAddImage(map, 'train-ouigo', createOuigoIcon(size));
  safeAddImage(map, 'train-breizhgo', createBreizhGoIcon(size));
  safeAddImage(map, 'train-zou', createZouIcon(size));
  safeAddImage(map, 'train-fluo', createFluoIcon(size));
  safeAddImage(map, DEFAULT_TRAIN_ICON_ID, createDefaultTrainIcon(size));
}
