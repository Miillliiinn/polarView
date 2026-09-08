const FIGHTER_KEYWORDS = [
  'EUROFIGHTER', 'TYPHOON', 'EF2000', 'EF-2000',
  'RAFALE',
  'MIRAGE', 'M2000', 'MIRAGE 2000', 'MIRAGE F1',
  'GRIPEN', 'JAS-39', 'JAS39',
  'TORNADO',
  'AMX',

  'F-35', 'F35', 'LIGHTNING',
  'F-22', 'F22', 'RAPTOR',
  'F-16', 'F16', 'FIGHTING FALCON', 'VIPER',
  'F-15', 'F15', 'EAGLE', 'STRIKE EAGLE',
  'F-18', 'F18', 'HORNET', 'SUPER HORNET',
  'FA-18', 'FA18',
  'F-4', 'F4', 'PHANTOM',
  'A-10', 'A10', 'THUNDERBOLT', 

  'SU-27', 'SU27', 'FLANKER',
  'SU-30', 'SU30',
  'SU-35', 'SU35',
  'SU-57', 'SU57',
  'SU-24', 'SU24', 'FENCER',
  'SU-25', 'SU25', 'FROGFOOT',
  'MIG-29', 'MIG29', 'FULCRUM',
  'MIG-31', 'MIG31', 'FOXHOUND',
  'MIG-21', 'MIG21'
];

export function isFighterJet(rawAircraftName: string): boolean
{
  if (!rawAircraftName || typeof rawAircraftName !== 'string') return false;
  const normalized = rawAircraftName.toUpperCase().trim();
  return FIGHTER_KEYWORDS.some(keyword => normalized.includes(keyword));
  // return true;
}