"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const read_aircraft_db_1 = require("./data/read_aircraft_db");
async function bootstrap() {
    await (0, read_aircraft_db_1.extractDatabase)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'http://localhost:5173',
    });
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 3000);
    const shutdown = async (signal) => {
        console.log(`\nSignal ${signal} reçu. Fermeture du serveur et nettoyage...`);
        await app.close();
        (0, read_aircraft_db_1.cleanupDatabase)();
        process.exit(0);
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
        (0, read_aircraft_db_1.cleanupDatabase)();
        process.exit(1);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map