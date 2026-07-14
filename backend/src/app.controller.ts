import { Controller, Get } from '@nestjs/common';
import { ApiService } from './app.service';

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

  @Get('train')
  async getTrains() {
    return await this.appService.getSncfCache();
  }

  @Get('weather')
  async getWeather() {
    return await this.appService.getMeteofranceCache();
  }
}



