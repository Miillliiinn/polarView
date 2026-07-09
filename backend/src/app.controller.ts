import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('webcams')
  getWebcams()
  {
    return this.appService.getGoogleAPI();
  }

  @Get('planes')
  getPlanes()
  {
    return this.appService.getOpenskyAPI();
  }

  @Get('train')
  getTrains()
  {
    return this.appService.getSncfAPI();
  }
}



