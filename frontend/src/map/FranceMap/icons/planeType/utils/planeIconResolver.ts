export type PlaneIconType =
  | 'L1P' | 'L1T' | 'L2J' | 'L3J' | 'L4J'
  | 'H1P' | 'H2T' | 'militaryHelicopter'
  | 'militaryTransport' | 'uav' | 'balloon' | 'glider'
  | 'groundVehicle' | 'generic' | 'commercial' | 'privateJet';

export interface PlaneClassificationProps
{
  icaoAircraftClass?: string | null;
  kind?: string | null;          
  engines?: number | null;
  isMilitary?: boolean | null;
  isHelicopter?: boolean | null;
}

export function resolvePlaneIconType(p: PlaneClassificationProps): PlaneIconType
{
  const engines = p.engines ?? null;
  const icaoClass = p.icaoAircraftClass?.toUpperCase() ?? null;
  const kind = p.kind?.toLowerCase() ?? null;

  if (p.isHelicopter)
  {
    if (p.isMilitary) return 'militaryHelicopter';
    if (engines && engines >= 2) return 'H2T';
    return 'H1P';
  }

  if (icaoClass === 'L4J') return 'L4J';
  if (kind === 'uav') return 'uav';
  if (kind === 'balloon') return 'balloon';
  if (kind === 'glider') return 'glider';
  if (kind === 'groundvehicle') return 'groundVehicle'; 
  if (kind === 'commercial') return 'commercial';
  if (kind === 'privatejet') return 'privateJet';      

  if (p.isMilitary)
  {
    return 'militaryTransport'; 
  }

  if (icaoClass)
  {
    switch (icaoClass)
    {
      case 'L1P': return 'L1P';
      case 'L1T': return 'L1T';
      case 'L2J': return 'L2J';
      case 'L3J': return 'L3J';
      case 'L2T': return 'L2J';
      case 'L2P': return 'L2J';
      default: break;
    }
  }

  if (engines === 1) return 'L1P';
  if (engines === 2) return 'L2J';
  if (engines === 3) return 'L3J';
  if (engines && engines >= 4) return 'L4J';

  return 'L2J';
}