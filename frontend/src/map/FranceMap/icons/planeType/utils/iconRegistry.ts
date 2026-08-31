import maplibregl from 'maplibre-gl';
import { type PlaneIconType } from './planeIconResolver';
import { ALTITUDE_STOPS, getAltitudeColor } from './altitudeColors';

import { createA380Icon } from '../l4j';
import { createH1PIcon } from '../h1p';
import { createH2TIcon } from '../h2t';
import { createL3JIcon } from '../l3j';
import { createL2JIcon } from '../l2j';
import { createL1PIcon } from '../l1p';
import { createL1TIcon } from '../l1t';
import { createCarIcon } from '../groundVehicule';
import { createUAVIcon } from '../uav';
import { createBalloonIcon } from '../balloon';
import { createMilitaryHelicopterIcon } from '../MilitaryH';
import { createGliderIcon } from '../glider';
import { createA400MIcon } from '../MilitaryP';
import { createPlaneIcon } from '../planeIcon';

type IconFactory = (color: string, size: number) => ImageData;

function lightenColor(hex: string, amount = 0.3): string
{
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);

  const blend = (channel: number) => Math.min(255, Math.round(channel + (255 - channel) * amount));

  return `#${blend(r).toString(16).padStart(2, '0')}${blend(g).toString(16).padStart(2, '0')}${blend(b).toString(16).padStart(2, '0')}`;
}

const createBalloonIconAdapter: IconFactory = (color, size) =>
  createBalloonIcon(color, lightenColor(color), size);

const ICON_FACTORIES: Record<PlaneIconType, IconFactory> = {
  L1P: createL1PIcon,
  L1T: createL1TIcon,
  L2J: createL2JIcon,
  L3J: createL3JIcon,
  L4J: createA380Icon,
  H1P: createH1PIcon,
  H2T: createH2TIcon,
  militaryHelicopter: createMilitaryHelicopterIcon,
  militaryTransport: createA400MIcon,
  uav: createUAVIcon,
  balloon: createBalloonIconAdapter,
  glider: createGliderIcon,
  groundVehicle: createCarIcon,
  generic: createPlaneIcon,
  commercial: createL2JIcon,
  privateJet: createL3JIcon,
};

const DEFAULT_ICON_SIZE = 85;

const ICON_SIZE_BY_TYPE: Partial<Record<PlaneIconType, number>> = {
  balloon: 60,
  glider: 50,
  groundVehicle: 45,
  H1P: 50,
  H2T: 50,
  L1P: 60,
  L1T: 60,
  L2J: 70,
  L3J: 50,
  L4J: 85,
  commercial: 70,
  privateJet: 50,
  uav: 50,
  militaryHelicopter: 70,
};

export function buildIconKey(type: PlaneIconType, stop: (typeof ALTITUDE_STOPS)[number]): string
{
  return `plane-${type}-${stop}`;
}

export function registerAllPlaneIcons(map: maplibregl.Map): void
{
  (Object.keys(ICON_FACTORIES) as PlaneIconType[]).forEach((type) => {
    const factory = ICON_FACTORIES[type];
    const size = ICON_SIZE_BY_TYPE[type] ?? DEFAULT_ICON_SIZE;

    ALTITUDE_STOPS.forEach((stop) => {
      const key = buildIconKey(type, stop);
      if (map.hasImage(key)) return;

      const color = getAltitudeColor(type, stop);
      map.addImage(key, factory(color, size));
    });
  });
}