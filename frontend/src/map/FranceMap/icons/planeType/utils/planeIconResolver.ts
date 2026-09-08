import { isFighterJet } from "./FighterJet";

export type PlaneIconType =
  | 'L1P' | 'L2P'| 'L1T' | 'L1TM' | 'L2J' | 'L2JM' | 'L2T' | 'L3J' | 'L3JM' | 'L4J' | 'L4JM'
  | 'H1P' | 'H2T' | 'H3T' | 'JETM' |'militaryHelicopter'
  | 'militaryTransport' | 'uav' | 'balloon' | 'glider'
  | 'groundVehicle' | 'generic' | 'commercial' | 'privateJet';

export interface PlaneClassificationProps
{
  model?: string | null,
  icaoAircraftClass?: string | null;
  kind?: string | null;          
  engines?: number | null;
  isMilitary?: boolean | null;
  isHelicopter?: boolean | null;
}

export function resolvePlaneIconType(p: PlaneClassificationProps): PlaneIconType
{
  const model = p.model ?? '';
  const engines = p.engines ?? null;
  const icaoClass = p.icaoAircraftClass?.toUpperCase() ?? null;
  const kind = p.kind?.toLowerCase() ?? null;

  if (p.isHelicopter)
  {
    if (p.isMilitary) return 'militaryHelicopter';
    if (engines && engines >= 2) return 'H2T';
    return 'H1P';
  }

  if (kind === 'uav') return 'uav';
  if (kind === 'balloon') return 'balloon';
  if (kind === 'glider') return 'glider';
  if (kind === 'groundvehicle') return 'groundVehicle'; 
  if (kind === 'commercial') return 'commercial';
  if (kind === 'privatejet') return 'privateJet';      

  if (p.isMilitary || kind === 'military')
  {
    if (icaoClass === 'H1P' || icaoClass === 'H2T' || icaoClass === 'H3T')
      return 'militaryHelicopter';
    if (icaoClass === 'L3J')
      return 'L3JM';
    if (icaoClass === 'L4J')
      return 'L4JM';
    if (icaoClass === 'L1T')
      return 'L1TM';
    if (icaoClass === 'L4T')
      return 'militaryTransport';
    if (isFighterJet(model) === true)
      return 'JETM';
    if (icaoClass === 'L2J')
      return 'L2JM';
    return 'militaryTransport'; 
  }

  if (icaoClass)
  {
    switch (icaoClass)
    {
      case 'L1P': return 'L1P';
      case 'L2P': return 'L2P';

      case 'L1T': return 'L1T';
      case 'L2T': return 'L2T';

      case 'L2J': return 'L2J';
      case 'L3J': return 'L3J';
      case 'L4J': return 'L4J';

      case 'L2T': return 'L2T';

      case 'H2T': return 'H2T';
      case 'H3T': return 'H2T';

      default: break;
    }
  }

  if (engines === 1) return 'L1P';
  if (engines === 2) return 'L2J';
  if (engines === 3) return 'L3J';
  if (engines && engines >= 4) return 'L4J';

  return 'L2J';
}