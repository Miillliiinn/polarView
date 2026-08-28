import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';

const DB_PATH = path.join(os.tmpdir(), 'aircraft_metadata.db');

@Injectable()
export class AircraftService implements OnModuleInit, OnModuleDestroy
{
  private db: Database.Database;
  onModuleInit()
  {
    this.db = new Database(DB_PATH, { readonly: true });
    console.log('[SQLite] Connexion à aircraft_metadata.db établie.');
  }

  onModuleDestroy()
  {
    if (this.db)
    {
      this.db.close();
      console.log('[SQLite] Connexion fermée /tmp.');
    }
  }

  getAircraftInDbByIcao(icao24: string)
  {
    const stmt = this.db.prepare('SELECT * FROM aircraft WHERE icao24 = ?');
    return stmt.get(icao24);
  }
}