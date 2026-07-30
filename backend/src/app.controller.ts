import { Controller, Get, Param } from '@nestjs/common';
import { ApiService } from './ApiService';

@Controller()
export class AppController {

  constructor(private readonly appService: ApiService) {}

  @Get('webcams')
  async getWebcams() {
    return await this.appService.getGoogleAPIFromDatabase();
  }

  @Get('planes')
  async getPlanes() {
    return await this.appService.getOpenskyCache();
  }

  @Get('planes/picture')
  async getPlanesPicture(@Param('icao24') icao24 : string) {
    return await this.appService.getPlaneSpotterApi(icao24);
  }

  @Get('trains')
  async getTrains() {
    return await this.appService.getSncfCache();
  }

  @Get('weather')
  async getWeather() {
    return await this.appService.getMeteofranceCache();
  }
}



