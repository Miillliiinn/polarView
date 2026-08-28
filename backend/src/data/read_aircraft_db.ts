import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as unzipper from 'unzipper';

const DB_PATH = path.join(os.tmpdir(), 'aircraft_metadata.db');
const ZIP_PATH = path.join(__dirname, 'aircraft_metadata.zip');

export async function extractDatabase(): Promise<string> {
  if (fs.existsSync(DB_PATH)) {
    return DB_PATH;
  }

  console.log('[Zip] Décompression en cours (Stream)...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(ZIP_PATH)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (entry.type === 'File' && entry.path.endsWith('.db')) {
          entry
            .pipe(fs.createWriteStream(DB_PATH))
            .on('finish', () => {
              console.log('[Zip] Base de données décompressée dans /tmp');
              resolve(DB_PATH);
            })
            .on('error', reject);
        } else {
          entry.autodrain();
        }
      })
      .on('error', reject);
  });
}

export function cleanupDatabase(): void {
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH);
      console.log('[Cleanup] Fichier .db supprimé avec succès.');
    } catch (err) {
      console.error('[Cleanup] Erreur lors de la suppression du fichier :', err);
    }
  }
}