import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { extractDatabase, cleanupDatabase } from './data/read_aircraft_db';

async function bootstrap()
{
  await extractDatabase();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
  const shutdown = async (signal: string) => {
    console.log(`\nSignal ${signal} reçu. Fermeture du serveur et nettoyage...`);
    await app.close();
    cleanupDatabase(); 
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    //console.error('Crash du serveur :', err);
    cleanupDatabase();
    process.exit(1);
  });
}

bootstrap();
