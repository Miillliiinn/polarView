import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [ApiService],
})
export class AppModule {}
