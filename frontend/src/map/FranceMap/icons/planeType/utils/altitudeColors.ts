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
  '#193fb2', 
  '#072683e0' 
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
  '#ffff55',//ffff55
  '#ffee00',//ffee00
  '#ffdd00',//ffdd00
  '#ffd400',//ffd400
  '#ffcc00',//ffcc00
  '#ffc400',
  '#ffbb00',
  '#ffb300',
  '#ffaa00',
  '#ffa200',
  '#ff9900'
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
  '#a40016'
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


const GREEN_TO_BLUE_GRADIENT = [
  '#b3ffb3',
  '#99ffe6',
  '#80ffec',
  '#66ffff',
  '#4dffff',
  '#33ebff',
  '#1ad6ff',
  '#00c2ff',
  '#00adff',
  '#0099ff',
  '#0084ff'
];

const EARTH_BROWN_GRADIENT = [
  '#a48875', // Couleur de départ demandée
  '#987d6b',
  '#8c7261',
  '#806757',
  '#745c4d',
  '#685143',
  '#5c4639',
  '#503b2f',
  '#443025',
  '#38251b',
  '#2c1a11'  // Marron sombre profond
];

const GRADIENTS: Record<PlaneIconType, string[]> = {
  L1P: YELLOW_ASCENDING_GRADIENT,
  L2P: EARTH_BROWN_GRADIENT,
  L1T: ['#a2ffd8', '#8ef8ce', '#7df0cf', '#70e2c1', '#62d4b4', '#58c6a7', '#4fb89b', '#48ac90', '#419d84', '#35826d', '#225345'],
  L1TM: RED_ASCENDING_GRADIENT,
  L2J: PURPLE_BLUE_GRADIENT,
  L2JM: RED_ASCENDING_GRADIENT,
  L2T: GREEN_TO_BLUE_GRADIENT,
  commercial: PURPLE_BLUE_GRADIENT,
  L3J: GREEN_ASCENDING_GRADIENT,
  L3JM: RED_ASCENDING_GRADIENT,
  privateJet: GREEN_ASCENDING_GRADIENT,
  L4J: YELLOW_ASCENDING_GRADIENT,
  L4JM: RED_ASCENDING_GRADIENT,
  H1P: ['#ffd4ad', '#ffc794', '#ffb97d', '#ffac65', '#ff9f4d', '#fa933b', '#f5872a', '#e67d25', '#d67320', '#b86018', '#7a3e0d'],
  H2T: ['#ffc7ad', '#ffb894', '#ffa87d', '#ff9a65', '#ff8b4d', '#fa7e3b', '#f5702a', '#e66725', '#d65e20', '#b84e18', '#7a310d'],
  H3T: EARTH_BROWN_GRADIENT,
  JETM: RED_ASCENDING_GRADIENT,
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