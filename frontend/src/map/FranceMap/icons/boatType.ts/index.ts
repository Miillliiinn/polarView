import maplibregl from 'maplibre-gl';

import { createAntiPollutionIcon } from "./antiPollutionIcon";
import { createAutreIcon } from "./autreIcon";
import { createBateauPortIcon } from "./bateauPortIcon";
import { createCargoIcon } from "./cargoIcon";
import { createDragageIcon } from "./dragageIcon";
import { createInconnuIcon } from "./inconnuIcon";
import { createLocalIcon } from "./localIcon";
import { createMilitaireIcon } from "./militaireIcon";
import { createNonCombattantIcon } from "./nonCombattantIcon";
import { createNonSpecifieIcon } from "./nonSpecifieIcon";
import { createPassagerIcon } from "./passagerIcon";
import { createPecheIcon } from "./pecheIcon";
import { createPetrolierIcon } from "./petrolierIcon";
import { createPilotageIcon } from "./pilotageIcon";
import { createPlaisanceIcon } from "./plaisanceIcon";
import { createPlongeIcon } from "./plongeIcon";
import { createPoliceIcon } from "./policeIcon";
import { createRemorqueurIcon } from "./remorqueurIcon";
import { createRemorqueurPortuaireIcon } from "./remorqueurPortuaireIcon";
import { createSecoursSarIcon } from "./secoursSarIcon";
import { createTransportMedicalIcon } from "./transportMedicalIcon";
import { createVitesseIcon } from "./vitesseIcon";
import { createVoilierIcon } from "./voilierIcon";

export
{
    createAntiPollutionIcon,
    createAutreIcon,
    createBateauPortIcon,
    createCargoIcon,
    createDragageIcon,
    createInconnuIcon,
    createLocalIcon,
    createMilitaireIcon,
    createNonCombattantIcon,
    createNonSpecifieIcon,
    createPassagerIcon,
    createPecheIcon,
    createPetrolierIcon,
    createPilotageIcon,
    createPlaisanceIcon,
    createPlongeIcon,
    createPoliceIcon,
    createRemorqueurIcon,
    createRemorqueurPortuaireIcon,
    createSecoursSarIcon,
    createTransportMedicalIcon,
    createVitesseIcon,
    createVoilierIcon
}

function boatIcons(map : maplibregl.Map, type : string)
{
    if (type === 'Inconnu')
        map.addImage(type, createInconnuIcon('#ffffff'));
    else if ( type === 'Pêche')
         map.addImage(type, createPecheIcon('#0a56ac'));
    else if ( type === 'Remorqueur')
         map.addImage(type, createRemorqueurIcon('#bb621a'));
    else if ( type === 'Dragage')
         map.addImage(type, createDragageIcon('#7310b4'));
    else if ( type === 'Plongée')
         map.addImage(type, createPlongeIcon('#1c02ff'));
    else if ( type === 'Militaire')
         map.addImage(type, createMilitaireIcon('#808080'));
    else if ( type === 'Voilier')
         map.addImage(type, createVoilierIcon('#ffee00'));
    else if ( type === 'Plaisance')
         map.addImage(type, createPlaisanceIcon('#fa35bf'));
    else if ( type === 'Vitesse')
         map.addImage(type, createVitesseIcon("#835e19"));
    else if ( type === 'Pilotage')
         map.addImage(type, createPilotageIcon('#860014'));
    else if ( type === 'Secours (SAR)')
         map.addImage(type, createSecoursSarIcon('#c8ff00'));
    else if ( type === 'Remorqueur portuaire')
         map.addImage(type, createRemorqueurPortuaireIcon('#141414'));
    else if ( type === 'Bateau-port')
         map.addImage(type, createBateauPortIcon('#065361'));
    else if ( type === 'Équipement anti-pollution')
         map.addImage(type, createAntiPollutionIcon('#00ff73'));
    else if ( type === 'Autorité / Police')
         map.addImage(type, createPoliceIcon('#ff0000'));
    else if ( type === 'Navire local')
         map.addImage(type, createLocalIcon('#9c5f81'));
    else if ( type === 'Transport médical')
         map.addImage(type, createTransportMedicalIcon('#70945f'));
    else if ( type === 'Navire non combattant')
         map.addImage(type, createNonCombattantIcon('#d8d6d6'));
    else if ( type === 'Passagers')
         map.addImage(type, createPassagerIcon('#4f4cf1'));
    else if ( type === 'Cargo')
         map.addImage(type, createCargoIcon('#4d1919'));
    else if ( type === 'Pétrolier')
         map.addImage(type, createPetrolierIcon('#000000'));
    else if ( type === 'Autre')
         map.addImage(type, createAutreIcon('#fff'));
    else if ( type === 'Non spécifié')
         map.addImage(type, createNonSpecifieIcon('#17361f'));
    return;
}

export function registerBoatIcons(map: maplibregl.Map)
{
    boatIcons(map, 'Inconnu');
    boatIcons(map, 'Pêche');
    boatIcons(map, 'Remorqueur');
    boatIcons(map, 'Dragage');
    boatIcons(map, 'Plongée');
    boatIcons(map, 'Militaire');
    boatIcons(map, 'Voilier');
    boatIcons(map, 'Plaisance');
    boatIcons(map, 'Vitesse');
    boatIcons(map, 'Pilotage');
    boatIcons(map, 'Secours (SAR)');
    boatIcons(map, 'Remorqueur portuaire');
    boatIcons(map, 'Bateau-port');
    boatIcons(map, 'Équipement anti-pollution');
    boatIcons(map, 'Autorité / Police');
    boatIcons(map, 'Navire local');
    boatIcons(map, 'Transport médical');
    boatIcons(map, 'Navire non combattant');
    boatIcons(map, 'Passagers');
    boatIcons(map, 'Cargo');
    boatIcons(map, 'Pétrolier');
    boatIcons(map, 'Autre');
    boatIcons(map, 'Non spécifié');
}