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

let satrecCache: Map<number, SatRecEntry> = new Map();
let viewport: ViewportBounds | null = null;
let selectedId: number | null = null;

let positionTimer: ReturnType<typeof setInterval> | null = null;
let trackTimer: ReturnType<typeof setInterval> | null = null;

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

function computePositions() {
  if (!viewport) return;
  const now = new Date();
  const positions: SatellitePosition[] = [];

  satrecCache.forEach((entry) => {
    const pos = propagateOne(entry, now);
    if (!pos) return;
    // Le satellite sélectionné reste calculé/envoyé même hors du cadre,
    // pour ne pas perdre le point qu'on est en train de suivre.
    if (pos.id === selectedId || isInViewport(pos.longitude, pos.latitude, viewport!)) {
      positions.push(pos);
    }
  });

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
  positionTimer = setInterval(computePositions, POSITION_RENDER_INTERVAL_MS);
  trackTimer = setInterval(computeTrack, TRACK_REFRESH_INTERVAL_MS);
  // Premier calcul immédiat, sans attendre le premier tick d'intervalle.
  computePositions();
}

function stopTimers() {
  if (positionTimer) clearInterval(positionTimer);
  if (trackTimer) clearInterval(trackTimer);
  positionTimer = null;
  trackTimer = null;
}

ctx.onmessage = (e: MessageEvent<InboundMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'omms':
      satrecCache = buildSatrecCache(msg.omms, satrecCache);
      break;
    case 'viewport':
      viewport = msg.bounds;
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