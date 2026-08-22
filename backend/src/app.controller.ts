import { Controller, Get, Param, Sse, MessageEvent } from '@nestjs/common';
import { ApiService } from './ApiService';
import { AisStreamAPI, ShipPosition } from './script/aisstreamScript';
import { Observable, concat, from, map } from 'rxjs';

@Controller()
export class AppController
{

  constructor(private readonly appService: ApiService) {};

  @Get('webcams')
  async getWebcams() {
    return await this.appService.getGoogleAPIFromDatabase();
  }
// ---------------------------------------------------------------------
  @Get('planes')
  async getPlanes() {
    return await this.appService.getOpenskyCache();
  }

  @Get('planes/:icao24/picture')
  async getPlanesPicture(@Param('icao24') icao24 : string) {
    return await this.appService.getPlaneSpotterApi(icao24);
  }

  @Get('planes/adsb')
  getAdsb() {
    return this.appService.getAdsbCache();
  }

  @Get('planes/all')
  getAllPlanes() {
    return this.appService.getCombinedAircraftCache();
  }
// ---------------------------------------------------------------------
  @Get('trains')
  async getTrains() {
    return await this.appService.getSncfCache();
  }

@Get('trains/gare')
async getGare() {
  return this.appService.getGareCache();
}

@Get('trains/rail')
async getRail() {
  return this.appService.getRailCache();
}
// ---------------------------------------------------------------------
  @Get('weather')
  async getWeather() {
    return await this.appService.getMeteofranceCache();
  }
}

@Controller()
export class AisStreamController {
  constructor(private readonly aisService: AisStreamAPI) {}

  @Get('ships')
  getShips(): ShipPosition[] {
    return this.aisService.getAllShips();
  }

  @Sse('ships/stream')
  streamShips(): Observable<MessageEvent> {
    const initial$ = from(this.aisService.getAllShips()).pipe(
      map((ship) => ({ data: JSON.stringify(ship) }) as MessageEvent),
    );

    const updates$ = this.aisService.getShipUpdates().pipe(
      map((ship) => ({ data: JSON.stringify(ship) }) as MessageEvent),
    );

    return concat(initial$, updates$);
  }
}


