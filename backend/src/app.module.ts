import { Module } from '@nestjs/common';
import { AppController, AisStreamController } from './app.controller';
import { ApiService } from './ApiService';
import { AisStreamAPI } from './script/aisstreamScript';
import { ConfigModule } from '@nestjs/config';
import { CallOpenskyAPI } from './script/openskyScript';
import { CallSncfAPI } from './script/sncfScript'
import { CallMeteofranceAPI } from './script/meteofranceScript';
import { PrismaService } from 'prisma/prisma.service';
import { CallGoogleAPI } from './script/googleScript';
import { ScheduleModule } from '@nestjs/schedule';
import { CallGareAPI } from './script/gareScript';
import { CallRailAPI } from './script/railScript';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, AisStreamController, ],
  providers: [
    ApiService,
    CallOpenskyAPI, 
    CallMeteofranceAPI, 
    CallSncfAPI,
    CallGareAPI,
    CallRailAPI,
    CallGoogleAPI,
    PrismaService,
    AisStreamAPI,
  ],
})
export class AppModule {}
