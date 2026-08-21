import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

import { fetchYoutubeWebcams } from './api/youtubeWebcam'; 
import { OpenskyTokenManager, fetchOpenskyStates } from './api/opensky'; 
import { fetchSncfDepartures, fetchSncfGares, fetchSncfRailLines }  from './api/sncf';
import { fetchMeteofranceVigilance } from './api/meteofranceVigilance'; 
import { fetchPlaneSpotterPhoto } from './api/planeSpotter'; 

@Injectable()
export class ApiService {
  private openskyTokenManager: OpenskyTokenManager;

  private OpenskyCache: any = [];
  private SncfCache: any = [];
  private gareCache: any;
  private railCache: any;
  private MeteofranceCache: any = [];

  constructor(private configService: ConfigService, private prisma: PrismaService, ) 
  {
    this.openskyTokenManager = new OpenskyTokenManager(
      this.configService.getOrThrow<string>('OPENSKY_CLIENTID'),
      this.configService.getOrThrow<string>('OPENSKY_CLIENTSECRET'),
    );
  }

  // --- Webcams (DB) ---

  async getGoogleAPIFromDatabase() {
    const count = await this.prisma.webcam.count();
    console.log(count);
    try {
      return await this.prisma.webcam.findMany();
    }
    catch (e) {
      console.error("Error, 'async getGoogleAPIFromDatabase' : ", e);
      return [];
    }
  }

  async getGoogleAPI(city: string) {
    const apiKey = this.configService.get('GOOGLE_API');
    return fetchYoutubeWebcams(apiKey, city);
  }

  // --- OpenSky ---

  setOpenskyCache(newData: any) { this.OpenskyCache = newData; }
  getOpenskyCache() { return this.OpenskyCache; }

  async getOpenskyAPI() {
    return fetchOpenskyStates(this.openskyTokenManager);
  }

  // --- SNCF ---

  setSncfCache(newData: any) { this.SncfCache = newData; }
  getSncfCache() { return this.SncfCache; }

  async getSncfAPI() {
    const apiKey = this.configService.get('SNCF_API');
    return fetchSncfDepartures(apiKey);
  }

  setGareCache(newCache: any) { this.gareCache = newCache; }
  getGareCache() { return this.gareCache; }

  async getGareAPI() {
    return fetchSncfGares();
  }

  setRailCache(newCache: any) { this.railCache = newCache; }
  getRailCache() { return this.railCache; }

  async getRailAPI() {
    return fetchSncfRailLines();
  }

  // --- Météo-France ---

  setMeteofranceCache(newdata: any) { this.MeteofranceCache = newdata; }
  getMeteofranceCache() { return this.MeteofranceCache; }

  async getMeteofranceAPI() {
    const apiKey = this.configService.get('METEOFRANCE_API');
    return fetchMeteofranceVigilance(apiKey);
  }

  // --- PlaneSpotters (DB + API) ---

  async getPlaneSpotterApi(icao24: string) {
    const existInDatabase = await this.prisma.planes.findUnique({
      where: { id: icao24 },
    });

    if (existInDatabase) {
      return existInDatabase;
    }

    const photo = await fetchPlaneSpotterPhoto(icao24);
    if (!photo) {
      return null;
    }

    try {
      return await this.prisma.planes.create({
        data: {
          id: icao24,
          link: photo.link ?? null,
          photographer: photo.photographer ?? null,
          thumbnailSrc: photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
          thumbnailWidth: photo.thumbnail_large?.size?.width ?? photo.thumbnail?.size?.width ?? null,
          thumbnailHeight: photo.thumbnail_large?.size?.height ?? photo.thumbnail?.size?.height ?? null,
        },
      });
    }
    catch (e) {
      console.error(`Erreur 'getPlaneSpotterApi(${icao24})' (sauvegarde DB) : `, e);
      return null;
    }
  }
}