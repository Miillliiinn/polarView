import { Module } from '@nestjs/common';
import { AppController, AisStreamController } from './app.controller';
import { ApiService } from './ApiService';
import { AisStreamAPI } from './script/boats/aisstreamScript';
import { ConfigModule } from '@nestjs/config';
import { CallOpenskyAPI } from './script/planes/openskyScript'; 
import { CallSncfAPI } from './script/trains/sncfScript'; 
import { CallMeteofranceAPI } from './script/weather/meteofranceScript';
import { PrismaService } from 'prisma/prisma.service';
import { CallGoogleAPI } from './script/webcams/googleScript';
import { ScheduleModule } from '@nestjs/schedule';
import { CallGareAPI } from './script/trains/gareScript'; 
import { CallRailAPI } from './script/trains/railScript';
import { CallAdsbAPI } from './script/planes/adsbScript';
import { AircraftService } from './data/aircraft_service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, AisStreamController, ],
  providers: [
    ApiService,
    CallOpenskyAPI,
    CallAdsbAPI, 
    CallMeteofranceAPI, 
    CallSncfAPI,
    CallGareAPI,
    CallRailAPI,
    CallGoogleAPI,
    PrismaService,
    AisStreamAPI,
    AircraftService,
  ],
})
export class AppModule {}
