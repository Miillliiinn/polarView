import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CallOpenskyAPI } from './script/openskyScript';
import { CallSncfAPI } from './script/sncfScript'
import { CallMeteofranceAPI } from './script/meteofranceScript';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    ApiService,
    CallOpenskyAPI, 
    CallMeteofranceAPI, 
    CallSncfAPI,
  ],
})
export class AppModule {}
