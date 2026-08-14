import { Controller, Get, Param } from '@nestjs/common';
import { ApiService } from './ApiService';
import { AisStreamAPI, ShipPosition } from './script/aisstreamScript';

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
export class AisStreamController 
{
  constructor(private readonly aisService: AisStreamAPI) {};

  @Get('ships')
  getShips(): ShipPosition[] {
    return this.aisService.getAllShips();
  }
}



