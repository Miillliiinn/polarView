import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CallOpenskyAPI } from './script/openskyScript';
import { CallSncfAPI } from './script/sncfScript'
import { CallMeteofranceAPI } from './script/meteofranceScript';
import { PrismaService } from 'prisma/prisma.service';
import { CallGoogleAPI } from './script/googleScript';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    ApiService,
    CallOpenskyAPI, 
    CallMeteofranceAPI, 
    CallSncfAPI,
    CallGoogleAPI,
    PrismaService,
  ],
})
export class AppModule {}
