import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { Subject, Observable } from 'rxjs';

export interface ShipPosition {
  mmsi: number;
  imo: number | null;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdate: Date;
  shipType: number | null;
  shipTypeLabel: string;
}

const RECONNECT_DELAY_MS = 5000;
const STALE_SHIP_MAX_AGE_MS = 30 * 60 * 1000;
const STALE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const WATCHDOG_NO_MESSAGE_TIMEOUT_MS = 60 * 1000;
const WATCHDOG_CHECK_INTERVAL_MS = 15 * 1000;

function getShipTypeLabel(type: number | null): string {
  if (type === null) return 'Inconnu';
  if (type === 30) return 'Pêche';
  if (type === 31 || type === 32) return 'Remorqueur';
  if (type === 33) return 'Dragage';
  if (type === 34) return 'Plongée';
  if (type === 35) return 'Militaire';
  if (type === 36) return 'Voilier';
  if (type === 37) return 'Plaisance';
  if (type >= 40 && type <= 49) return 'Vitesse';
  if (type === 50) return 'Pilotage';
  if (type === 51) return 'Secours (SAR)';
  if (type === 52) return 'Remorqueur portuaire';
  if (type === 53) return 'Bateau-port';
  if (type === 54) return 'Équipement anti-pollution';
  if (type === 55) return 'Autorité / Police';
  if (type === 56 || type === 57) return 'Navire local';
  if (type === 58) return 'Transport médical';
  if (type === 59) return 'Navire non combattant';
  if (type >= 60 && type <= 69) return 'Passagers';
  if (type >= 70 && type <= 79) return 'Cargo';
  if (type >= 80 && type <= 89) return 'Pétrolier';
  if (type >= 90 && type <= 99) return 'Autre';
  return 'Non spécifié';
}

@Injectable()
export class AisStreamAPI implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AisStreamAPI.name);
  private ws: WebSocket | null = null;

  private readonly ships = new Map<number, ShipPosition>();
  private readonly shipTypes = new Map<number, number>();
  private readonly shipImos = new Map<number, number>();
  private readonly shipUpdates$ = new Subject<ShipPosition>();

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private watchdogInterval: NodeJS.Timeout | null = null;
  private lastMessageAt: number = Date.now();
  private destroyed = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit()
  {
    if (process.env.RUN_BOATS_API !== 'true') return;
    this.connect();
    this.cleanupInterval = setInterval(() => this.pruneStaleShips(), STALE_CLEANUP_INTERVAL_MS);
    this.watchdogInterval = setInterval(() => this.checkWatchdog(), WATCHDOG_CHECK_INTERVAL_MS);
  }

  private connect()
  {
    if (this.destroyed) return;

    const apiKey = this.configService.get<string>('AISSTREAM_API_KEY');
    if (!apiKey) {
      this.logger.error('AISSTREAM_API_KEY manquante, connexion annulée.');
      return;
    }

    this.ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

    this.ws.on('open', () => {
      this.logger.log('AisStream connexion success');
      this.lastMessageAt = Date.now();

      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [[[37.5, -9.0], [55.5, 13.0]]],
        FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
      };

      this.ws?.send(JSON.stringify(subscription));
    });

    this.ws.on('message', (rawData: any) => {
      this.lastMessageAt = Date.now();

      let data: any;

      try {
        data = JSON.parse(rawData.toString());
      } catch (e) {
        this.logger.warn(`Message AISStream illisible : ${(e as Error).message}`);
        return;
      }

      if (data?.error) {
        this.logger.error(`AISStream a renvoyé une erreur : ${JSON.stringify(data)}`);
        return;
      }

      if (data.MessageType === 'ShipStaticData') {
        this.updateShipType(data);
      } else {
        this.updateShipData(data);
      }
    });

    this.ws.on('error', (error: Error) => {
      this.logger.warn(`Erreur WebSocket AISStream : ${error.message}`);
    });

    this.ws.on('close', (code: number, reason: Buffer) => {
      this.logger.warn(
        `Connexion AISStream fermée (code ${code}${reason?.length ? `, raison : ${reason.toString()}` : ''}). Tentative de reconnexion...`,
      );
      this.ws = null;
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect()
  {
    if (this.destroyed || this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  private checkWatchdog()
  {
    if (this.destroyed || !this.ws) return;

    const silentFor = Date.now() - this.lastMessageAt;
    if (silentFor > WATCHDOG_NO_MESSAGE_TIMEOUT_MS) {
      this.logger.warn(
        `Aucun message reçu depuis ${Math.round(silentFor / 1000)}s (silent failure suspectée). Forçage de la reconnexion.`,
      );
      this.ws.terminate();
      this.ws = null;
      this.lastMessageAt = Date.now();
      this.scheduleReconnect();
    }
  }

  private updateShipType(data: any)
  {
    const mmsi = data.MetaData?.MMSI;
    const type = data.Message?.ShipStaticData?.Type;
    const imoRaw = data.Message?.ShipStaticData?.ImoNumber;
    // AISStream renvoie 0 quand l'IMO n'est pas disponible -> on le traite comme "absent"
    const imo = typeof imoRaw === 'number' && imoRaw > 0 ? imoRaw : null;

    if (!mmsi || (type === undefined && imo === null)) return;

    if (type !== undefined) this.shipTypes.set(mmsi, type);
    if (imo !== null) this.shipImos.set(mmsi, imo);

    const existing = this.ships.get(mmsi);
    if (existing) {
      const updated: ShipPosition = {
        ...existing,
        shipType: type !== undefined ? type : existing.shipType,
        shipTypeLabel: getShipTypeLabel(type !== undefined ? type : existing.shipType),
        imo: imo !== null ? imo : existing.imo,
      };
      this.ships.set(mmsi, updated);
      this.shipUpdates$.next(updated);
    }
  }

  private updateShipData(data: any)
  {
    const mmsi = data.MetaData?.MMSI;
    if (!mmsi) return;

    const pos = data.Message?.PositionReport;
    const latitude = pos?.Latitude ?? data.MetaData?.latitude;
    const longitude = pos?.Longitude ?? data.MetaData?.longitude;

    if (latitude === undefined || longitude === undefined) return;

    const shipType = this.shipTypes.get(mmsi) ?? null;
    const imo = this.shipImos.get(mmsi) ?? null;

    const updatedShip: ShipPosition = {
      mmsi,
      imo,
      name: data.MetaData?.ShipName?.trim() || 'Inconnu',
      latitude,
      longitude,
      speed: pos?.Sog ?? 0,
      heading: pos?.TrueHeading ?? 0,
      lastUpdate: new Date(),
      shipType,
      shipTypeLabel: getShipTypeLabel(shipType),
    };
    this.ships.set(mmsi, updatedShip);
    this.shipUpdates$.next(updatedShip);
    //this.logger.log(`Navire mis à jour : ${updatedShip.name || mmsi}`);
  }

  private pruneStaleShips()
  {
    const now = Date.now();
    let removed = 0;
    for (const [mmsi, ship] of this.ships) {
      if (now - ship.lastUpdate.getTime() > STALE_SHIP_MAX_AGE_MS)
      {
        this.ships.delete(mmsi);
        this.shipTypes.delete(mmsi);
        this.shipImos.delete(mmsi);
        removed++;
      }
    }
    if (removed > 0)
    {
      this.logger.log(`${removed} navires retirés du cache (${this.ships.size} restants).`);
    }
  }

  public getShipUpdates(): Observable<ShipPosition>
  {
    return this.shipUpdates$.asObservable();
  }

  public getAllShips(): ShipPosition[]
  {
    return Array.from(this.ships.values());
  }

  onModuleDestroy()
  {
    this.destroyed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.watchdogInterval) clearInterval(this.watchdogInterval);
    this.ws?.close();
    this.shipUpdates$.complete();
  }
}