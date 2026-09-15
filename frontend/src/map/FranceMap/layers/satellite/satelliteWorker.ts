/// <reference lib="webworker" />

// ---------------------------------------------------------------------------
// Worker satellites
//
// Tout le calcul lourd (propagation SGP4 pour chaque satellite du cache,
// calcul du ground track) tourne ici, hors du thread principal. Le thread
// principal garde le contrôle de maplibre (sources/layers/popup) et se
// contente d'envoyer/recevoir de petits messages.
//
// HYPOTHÈSE (à vérifier de ton côté, je n'ai pas satelliteEphemeris.ts) :
// buildSatrecCache / propagateOne / computeGroundTrack sont des fonctions
// pures (satellite.js ou équivalent), sans accès DOM/window. Si ce n'est pas
// le cas, il faudra isoler la partie DOM avant de les importer ici — un
// worker n'a pas accès à `window`, `document`, etc.
// ---------------------------------------------------------------------------

import {
  buildSatrecCache,
  computeGroundTrack,
  propagateOne,
  type CelestrakOmm,
  type SatellitePosition,
  type SatRecEntry,
} from './satelliteEphemeris';
import { isInViewport, type ViewportBounds } from './geoUtils';

const POSITION_RENDER_INTERVAL_MS = 50;
const TRACK_REFRESH_INTERVAL_MS = 4000;
const TRACK_PAST_MIN = 15;
const TRACK_FUTURE_MIN = 45;
const TRACK_STEP_SEC = 30;

// Culling en deux passes : la passe fine (50ms) ne propage SGP4 que sur un
// sous-ensemble "candidat" au lieu de tout le catalogue. Ce sous-ensemble est
// recalculé par une passe grossière, moins fréquente, sur l'ensemble des
// satellites. Ça borne le coût de la passe fine à ce qui est réellement
// susceptible d'être affiché, indépendamment de la taille du catalogue.
const COARSE_CULL_INTERVAL_MS = 1000;
// Marge supplémentaire (en plus de la marge déjà incluse dans `viewport`)
// pour absorber le déplacement d'un satellite entre deux passes grossières.
// En LEO, un satellite parcourt ~0.06°/s : 2° couvre très largement la
// fenêtre d'1s entre deux passes, avec une bonne marge de sécurité.
const COARSE_CULL_SAFETY_MARGIN_DEG = 2;

let satrecCache: Map<number, SatRecEntry> = new Map();
let viewport: ViewportBounds | null = null;
let selectedId: number | null = null;

// Sous-ensemble de satellites à propager en passe fine, recalculé par
// coarseCull(). Tant qu'aucune passe grossière n'a tourné, on ne restreint
// rien (évite un écran vide le temps du premier calcul).
let candidateIds: Set<number> | null = null;

let positionTimer: ReturnType<typeof setInterval> | null = null;
let trackTimer: ReturnType<typeof setInterval> | null = null;
let coarseCullTimer: ReturnType<typeof setInterval> | null = null;

type InboundMessage =
  | { type: 'omms'; omms: CelestrakOmm[] }
  | { type: 'viewport'; bounds: ViewportBounds }
  | { type: 'selected'; id: number | null }
  | { type: 'start' }
  | { type: 'stop' };

type OutboundMessage =
  | { type: 'positions'; positions: SatellitePosition[]; selectedId: number | null }
  | { type: 'track'; segments: number[][][]; selectedId: number };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function expandViewport(bounds: ViewportBounds, marginDeg: number): ViewportBounds {
  return {
    north: bounds.north + marginDeg,
    south: bounds.south - marginDeg,
    east: bounds.east + marginDeg,
    west: bounds.west - marginDeg,
  };
}

/**
 * Passe grossière : propage TOUT le catalogue une fois, pour déterminer quels
 * satellites sont dans (ou proches de) le viewport actuel. Coûteuse, mais
 * rare (1×/s, ou immédiatement après un pan/zoom) — contrairement à la passe
 * fine qui doit rester légère car elle tourne 20×/s.
 */
function coarseCull() {
  if (!viewport) return;
  const now = new Date();
  const expanded = expandViewport(viewport, COARSE_CULL_SAFETY_MARGIN_DEG);
  const next = new Set<number>();

  satrecCache.forEach((entry) => {
    const pos = propagateOne(entry, now);
    if (!pos) return;
    if (isInViewport(pos.longitude, pos.latitude, expanded)) {
      next.add(entry.id);
    }
  });

  candidateIds = next;
}

function computePositions() {
  if (!viewport) return;
  const now = new Date();
  const positions: SatellitePosition[] = [];

  // Tant qu'aucune passe grossière n'a encore tourné, on retombe sur le
  // catalogue complet pour ne pas afficher un écran vide au démarrage.
  const ids = candidateIds ?? satrecCache.keys();

  for (const id of ids) {
    const entry = satrecCache.get(id);
    if (!entry) continue;
    const pos = propagateOne(entry, now);
    if (!pos) continue;
    if (pos.id === selectedId || isInViewport(pos.longitude, pos.latitude, viewport)) {
      positions.push(pos);
    }
  }

  // Le satellite sélectionné doit toujours être calculé, même s'il n'est pas
  // (ou plus) dans le candidate set courant (ex: il vient de sortir du
  // viewport élargi, ou la passe grossière n'a pas encore tourné depuis la
  // sélection) — pour ne jamais perdre le point qu'on est en train de suivre.
  if (selectedId !== null && candidateIds && !candidateIds.has(selectedId)) {
    const entry = satrecCache.get(selectedId);
    if (entry) {
      const pos = propagateOne(entry, now);
      if (pos) positions.push(pos);
    }
  }

  const message: OutboundMessage = { type: 'positions', positions, selectedId };
  ctx.postMessage(message);
}

function computeTrack() {
  if (selectedId === null) return;
  const entry = satrecCache.get(selectedId);
  if (!entry) return;

  const segments = computeGroundTrack(entry, new Date(), TRACK_PAST_MIN, TRACK_FUTURE_MIN, TRACK_STEP_SEC);
  const message: OutboundMessage = { type: 'track', segments, selectedId };
  ctx.postMessage(message);
}

function startTimers() {
  stopTimers();
  coarseCull();
  coarseCullTimer = setInterval(coarseCull, COARSE_CULL_INTERVAL_MS);
  positionTimer = setInterval(computePositions, POSITION_RENDER_INTERVAL_MS);
  trackTimer = setInterval(computeTrack, TRACK_REFRESH_INTERVAL_MS);
  // Premier calcul immédiat, sans attendre le premier tick d'intervalle.
  computePositions();
}

function stopTimers() {
  if (positionTimer) clearInterval(positionTimer);
  if (trackTimer) clearInterval(trackTimer);
  if (coarseCullTimer) clearInterval(coarseCullTimer);
  positionTimer = null;
  trackTimer = null;
  coarseCullTimer = null;
}

ctx.onmessage = (e: MessageEvent<InboundMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'omms':
      satrecCache = buildSatrecCache(msg.omms, satrecCache);
      if (positionTimer) coarseCull();
      break;
    case 'viewport':
      viewport = msg.bounds;
      // Recalcul immédiat : après un pan/zoom, on ne veut pas attendre
      // jusqu'à COARSE_CULL_INTERVAL_MS pour mettre à jour le candidate set.
      if (positionTimer) coarseCull();
      break;
    case 'selected':
      selectedId = msg.id;
      if (selectedId !== null) computeTrack();
      break;
    case 'start':
      startTimers();
      break;
    case 'stop':
      stopTimers();
      break;
  }
};