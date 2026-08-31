import { type PlaneIconType } from "./planeIconResolver";

export const ALTITUDE_STOPS = [
  'ground',
  'taxiing',
  'initial_climb',
  'low_approach',
  'approach',
  'climb',
  'low',
  'mid',
  'high',
  'cruise',
  'stratosphere'
] as const;

export type AltitudeStop = typeof ALTITUDE_STOPS[number];

const PURPLE_BLUE_GRADIENT = [
  '#f000ff', 
  '#d61eff', 
  '#b82eff', 
  '#9b34ff',
  '#7f3bff', 
  '#7144f8', 
  '#5a4beb', 
  '#434fde',
  '#304fd0', 
  '#224bc4', 
  '#1a43ba' 
];

const GREEN_ASCENDING_GRADIENT = [
  '#04694a',
  '#057450',
  '#068057',
  '#078b5c',
  '#089862',
  '#0aa562',
  '#0cb362',
  '#0fc060',
  '#13ce5d',
  '#1ee84e',
  '#39ff14'
];

const YELLOW_ASCENDING_GRADIENT = [
  '#ff9900',
  '#ffa200',
  '#ffaa00',
  '#ffb300',
  '#ffbb00',
  '#ffc400',
  '#ffcc00',
  '#ffd400',
  '#ffdd00',
  '#ffee00',
  '#ffff55'
];

const RED_ASCENDING_GRADIENT = [
  '#fb8c99',
  '#fd6779',
  '#ff4d63',
  '#ff334d',
  '#ff1a38',
  '#f80d2d',
  '#f50021',
  '#e4001e',
  '#d4001c',
  '#b30017',
  '#70000d'
];

const PINK_ASCENDING_GRADIENT = [
  '#ff80bf',
  '#ff73b9',
  '#ff66b2',
  '#ff59ac',
  '#ff4da6',
  '#ff40a0',
  '#ff3399',
  '#ff2693',
  '#ff1a8c',
  '#e60073',
  '#b30059'
];

const GRADIENTS: Record<PlaneIconType, string[]> = {
  L1P: YELLOW_ASCENDING_GRADIENT,
  L1T: ['#a2ffd8', '#8ef8ce', '#7df0cf', '#70e2c1', '#62d4b4', '#58c6a7', '#4fb89b', '#48ac90', '#419d84', '#35826d', '#225345'],
  L2J: PURPLE_BLUE_GRADIENT,
  commercial: PURPLE_BLUE_GRADIENT,
  L3J: GREEN_ASCENDING_GRADIENT,
  privateJet: GREEN_ASCENDING_GRADIENT,
  L4J: YELLOW_ASCENDING_GRADIENT,
  H1P: ['#ffd4ad', '#ffc794', '#ffb97d', '#ffac65', '#ff9f4d', '#fa933b', '#f5872a', '#e67d25', '#d67320', '#b86018', '#7a3e0d'],
  H2T: ['#ffc7ad', '#ffb894', '#ffa87d', '#ff9a65', '#ff8b4d', '#fa7e3b', '#f5702a', '#e66725', '#d65e20', '#b84e18', '#7a310d'],
  militaryHelicopter: RED_ASCENDING_GRADIENT,
  militaryTransport: RED_ASCENDING_GRADIENT,
  uav: ['#a8ffff', '#8cfff9', '#70fff3', '#5bece1', '#46e6d8', '#3dd5c9', '#35c7ba', '#2fb8ac', '#2aa89d', '#218a81', '#12544e'],
  balloon: ['#ffeab3', '#ffe199', '#ffd880', '#ffce66', '#ffc44d', '#f5b63f', '#eba832', '#dc972b', '#cc0126', '#ad881d', '#735a0f'],
  glider: ['#e1ebf7', '#d1dff1', '#c2d4eb', '#b5c9e3', '#a8bddb', '#9cb1cf', '#92a6c2', '#889bb3', '#7e90aa', '#6c7b93', '#4a5568'],
  groundVehicle: PINK_ASCENDING_GRADIENT,
  generic: ['#b5d0f2', '#aac5e7', '#9eb9db', '#93add0', '#8aa4c2', '#819ab6', '#7890ab', '#6f86a0', '#677d94', '#576a7d', '#3a4856'],
};

export function getAltitudeColor(type: PlaneIconType, stop: AltitudeStop): string
{
  const gradient = GRADIENTS[type] ?? GRADIENTS.generic;
  const index = ALTITUDE_STOPS.indexOf(stop);
  return gradient[index] ?? gradient[gradient.length - 1];
}

export function getAltitudeStop(altitude: number | null | undefined): AltitudeStop
{
  const alt = altitude ?? 0;
  if (alt < 100)   return 'ground';
  if (alt < 300)   return 'taxiing';
  if (alt < 700)   return 'initial_climb';
  if (alt < 1100)  return 'low_approach';
  if (alt < 1500)  return 'approach';
  if (alt < 3000)  return 'climb';
  if (alt < 5000)  return 'low';
  if (alt < 7500)  return 'mid';
  if (alt < 9500)  return 'high';
  if (alt < 11500) return 'cruise';
  return 'stratosphere';
}