import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';

export interface ShipPosition {
  mmsi: number;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  lastUpdate: Date;
}

const RECONNECT_DELAY_MS = 5000;
const STALE_SHIP_MAX_AGE_MS = 30 * 60 * 1000;
const STALE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class AisStreamAPI implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AisStreamAPI.name);
  private ws: WebSocket | null = null;
  private readonly ships = new Map<number, ShipPosition>();

  private reconnectTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private destroyed = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit()
  {
    if (process.env.RUN_BOATS_API === 'false')
      return;
    this.connect();
    this.cleanupInterval = setInterval(() => this.pruneStaleShips(), STALE_CLEANUP_INTERVAL_MS);
  }

  private connect() {
    if (this.destroyed) return;

    const apiKey = this.configService.get<string>('AISSTREAM_API_KEY');
    if (!apiKey) {
      this.logger.error('AISSTREAM_API_KEY manquante, connexion annulée.');
      return;
    }

    this.ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

    this.ws.on('open', () => {
      this.logger.log('AisStream connexion success');

      const subscription = {
        APIKey: apiKey,
        BoundingBoxes: [[[37.5, -9.0], [55.5, 13.0]]],
        FilterMessageTypes: ['PositionReport'],
      };

      this.ws?.send(JSON.stringify(subscription));
    });

    this.ws.on('message', (rawData: any) => {
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

      this.updateShipData(data);
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

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  private updateShipData(data: any) {
    const mmsi = data.MetaData?.MMSI;
    if (!mmsi) return;

    const pos = data.Message?.PositionReport;
    const latitude = pos?.Latitude ?? data.MetaData?.latitude;
    const longitude = pos?.Longitude ?? data.MetaData?.longitude;

    if (latitude === undefined || longitude === undefined) return;

    this.ships.set(mmsi, {
      mmsi,
      name: data.MetaData?.ShipName?.trim() || 'Inconnu',
      latitude,
      longitude,
      speed: pos?.Sog ?? 0,
      heading: pos?.TrueHeading ?? 0,
      lastUpdate: new Date(),
    });

    this.logger.log(`Navire mis à jour : ${data.MetaData?.ShipName?.trim() || mmsi}`);
  }

  private pruneStaleShips() {
    const now = Date.now();
    let removed = 0;
    for (const [mmsi, ship] of this.ships) {
      if (now - ship.lastUpdate.getTime() > STALE_SHIP_MAX_AGE_MS) {
        this.ships.delete(mmsi);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.log(`${removed} navires retirés du cache (${this.ships.size} restants).`);
    }
  }

  public getAllShips(): ShipPosition[] {
    return Array.from(this.ships.values());
  }

  onModuleDestroy() {
    this.destroyed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.ws?.close();
  }
}







//[[[37.5, -9.0], [55.5, 13.0]]]