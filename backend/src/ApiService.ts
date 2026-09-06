import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

import { fetchYoutubeWebcams } from './api/webcam/youtubeWebcam'; 
import { OpenskyTokenManager, fetchOpenskyStates } from './api/planes/opensky'; 
import { fetchAdsbStates, DEFAULT_FRANCE_ZONES } from './api/planes/adsb'; 
import { mergeAdsbAndOpensky } from './api/planes/mergeAdsbOpensky'; 
import { fetchSncfDepartures, fetchSncfGares, fetchSncfRailLines }  from './api/trains/sncf';
import { fetchMeteofranceVigilance } from './api/weather/meteofranceVigilance'; 
import { fetchPlaneSpotterPhoto } from './api/planes/planeSpotter'; 
import { AircraftService } from './data/aircraft_service';
import { fetchWikimediaCommonsAPI } from './api/boats/wikimediaCommonsAPI';
import { findOrFetchAndCache } from './data/boats/findOrFetchAndCache';

@Injectable()
export class ApiService {
  private openskyTokenManager: OpenskyTokenManager;

  private OpenskyCache: any = [];
  private AdsbCache: any = [];
  private SncfCache: any = [];
  private gareCache: any;
  private railCache: any;
  private MeteofranceCache: any = [];

  constructor(private configService: ConfigService, private prisma: PrismaService, private readonly aircraftservice: AircraftService) 
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

  setAdsbCache(newData: any) { this.AdsbCache = newData; }
  getAdsbCache() { return this.AdsbCache; }

  async getAdsbAPI() {
    return fetchAdsbStates(DEFAULT_FRANCE_ZONES);
  }

  getCombinedAircraftCache() {
    return mergeAdsbAndOpensky(this.AdsbCache, this.OpenskyCache, this.aircraftservice);
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

  async getPlaneSpotterApi(icao24: string)
  {
    return findOrFetchAndCache(
      this.prisma.planes,
      icao24,
      fetchPlaneSpotterPhoto,
      (photo) => ({
        link: photo.link ?? null,
        photographer: photo.photographer ?? null,
        thumbnailSrc: photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
        thumbnailWidth: photo.thumbnail_large?.size?.width ?? photo.thumbnail?.size?.width ?? null,
        thumbnailHeight: photo.thumbnail_large?.size?.height ?? photo.thumbnail?.size?.height ?? null,
      }),
      (record) => !!record.thumbnailSrc
    );
  }
 
  // --- Wikimedia Commons (DB + API) ---
 
  async getWikimediaCommonsAPI(imo: string)
  {
    return findOrFetchAndCache(
      this.prisma.ships,
      imo,
      fetchWikimediaCommonsAPI,
      (photo) => ({
        url: photo.url ?? null,
        thumbUrl: photo.thumbUrl ?? null,
        title: photo.title ?? null,
        sourceUrl: photo.sourceUrl ?? null,
        width: photo.width ?? null,
        height: photo.height ?? null,
      }),
      (record) => !!record.url
    );
  }
}