import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import AdmZip from 'adm-zip';

const DB_PATH = path.join(os.tmpdir(), 'aircraft_metadata.db');
const ZIP_PATH = path.join(__dirname, 'aircraft_metadata.zip');
const MIN_VALID_SIZE_BYTES = 80 * 1024 * 1024;

@Injectable()
export class AircraftService implements OnModuleInit, OnModuleDestroy
{
  private db: Database.Database;

  onModuleInit()
  {
    this.ensureDbIsExtracted();

    this.db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

    const tables = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];

    console.log('[SQLite] Connexion à aircraft_metadata.db établie.');
    console.log('[SQLite] Tables trouvées:', tables.map(t => t.name));

    if (!tables.some(t => t.name === 'aircraft')) {
      throw new Error(
        `[SQLite] La table "aircraft" est absente de ${DB_PATH}. ` +
        `L'extraction automatique a peut-être échoué.`
      );
    }
  }

  private ensureDbIsExtracted()
  {
    const needsExtraction = !fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size < MIN_VALID_SIZE_BYTES;

    if (!needsExtraction) {
      console.log('[SQLite] Base déjà présente et valide dans /tmp, extraction ignorée.');
      return;
    }

    if (!fs.existsSync(ZIP_PATH)) {
      throw new Error(`[SQLite] Zip source introuvable: ${ZIP_PATH}`);
    }

    console.log(`[SQLite] Extraction de ${ZIP_PATH} vers ${os.tmpdir()}...`);
    const zip = new AdmZip(ZIP_PATH);
    zip.extractAllTo(os.tmpdir(), true);

    if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0) {
      throw new Error(
        `[SQLite] Extraction échouée ou fichier vide après extraction: ${DB_PATH}`
      );
    }

    console.log(
      `[SQLite] Extraction réussie (${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1)} Mo).`
    );
  }

  onModuleDestroy()
  {
    if (this.db)
    {
      this.db.close();
      console.log('[SQLite] Connexion fermée.');
    }

    try {
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        console.log('[SQLite] Fichier /tmp/aircraft_metadata.db supprimé.');
      }
    } catch (err) {
      console.error('[SQLite] Erreur lors de la suppression du fichier temporaire:', err);
    }
  }

  getAircraftInDbByIcao(icao24: string)
  {
    const stmt = this.db.prepare('SELECT * FROM aircraft WHERE icao24 = ?');
    return stmt.get(icao24);
  }
}