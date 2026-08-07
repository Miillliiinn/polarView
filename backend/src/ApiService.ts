import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ApiService {

  constructor(private configService: ConfigService, 
    private prisma: PrismaService){}
  

  async getGoogleAPIFromDatabase()
  {
    const count = await this.prisma.webcam.count();
    console.log(count);
    try
    {
      const webcams = await this.prisma.webcam.findMany();
      return webcams; 
    }
    catch (e)
    {
      console.error("Error, 'async getGoogleAPIFromDatabase' : ", e);
      return [];
    }
  }

  async getGoogleAPI(city: string)
  {
      try {
          const apiKey = this.configService.get('GOOGLE_API');
          const query = encodeURIComponent(`webcam ${city}`);
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=${query}&relevanceLanguage=fr&regionCode=FR&maxResults=50&key=${apiKey}`;

          const apiResult = await fetch(url);
          const resJson = await apiResult.json();

          if (resJson.error) {
              console.error(`❌ Erreur API YouTube pour "${city}" :`, resJson.error.message);
              return [];
          }

          const videoLive = resJson.items || [];

          const sanitize = (text: string) => {
              if (!text) return '';
              return text
                  .replace(/&#39;/g, "'")
                  .replace(/&amp;/g, "&")
                  .replace(/&quot;/g, '"')
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase();
          };

          const cleanCity = sanitize(city);

          const blacklist = [
              'illinois', 'usa', 'los angeles', 'thailand', 'indonesia', 'italia'
          ];

          const strictVideos = videoLive.filter((item: any) => {
              const title = sanitize(item.snippet.title);
              const description = sanitize(item.snippet.description);
              const channel = sanitize(item.snippet.channelTitle);

              const isBlacklisted = blacklist.some((term) => title.includes(term));
              if (isBlacklisted) {
                  return false;
              }

              const hasCity = title.includes(cleanCity) || description.includes(cleanCity) || channel.includes(cleanCity);
              const isCam = title.includes('webcam') || title.includes('live') || title.includes('cam') || title.includes('direct');

              return hasCity && isCam;
          });

          return strictVideos.map((item: any) => ({
              youtubeVideoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
              channel: item.snippet.channelTitle,
              city: city,
          }));
      }
      catch (e) {
          console.error(`Error 'async getGoogleAPI(${city})' : `, e);
          return [];
      }
  }




  private OpenskyCache: any = [];
  setOpenskyCache(newData: any) {this.OpenskyCache = newData;};
  getOpenskyCache(){return this.OpenskyCache;};
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private async getAccessToken(): Promise<string>
  {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry)
    {
      return this.accessToken;
    }

    const clientId = this.configService.get('OPENSKY_CLIENTID');
    const clientSecret = this.configService.get('OPENSKY_CLIENTSECRET');

    const tokenUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok)
    {
      throw new Error(`Erreur récupération token OAuth2 : ${res.status}`);
    }

    const data = await res.json();
    const newToken: string = data.access_token;

    this.accessToken = newToken;
    this.tokenExpiry = now + (data.expires_in - 30) * 1000;

    return newToken;
  }

  async getOpenskyAPI() {
    try {
      const token = await this.getAccessToken();

      const url = `https://opensky-network.org/api/states/all?lamin=37.5&lamax=55.5&lomin=-9.0&lomax=13.0`; // lamin=41.0&lamax=51.0&lomin=-13.0&lomax=21.0

      const apiResult = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!apiResult.ok) {
        throw new Error(`Opensky Network repond avec un statut : ${apiResult.status}`);
      }

      const data = await apiResult.json();
      const state = data.states || [];

      console.log("✈️  OpenSky Api request ✈️")
      //console.log('Headers:', Object.fromEntries(apiResult.headers.entries()))
      return state
        .filter((f: any) => f[5] !== null && f[6] !== null)
        .map((f: any) => ({
          icao24: f[0],
          callsign: f[1]?.trim(),
          country: f[2],
          longitude: f[5],
          latitude: f[6],
          altitude: f[7] || f[13] || 0,
          heading: f[10] || 0,
          velocity: f[9] || 0,
        }));
    }
    catch (e)
    {
      console.error("Error 'async getOpenskyAPI()' : ", e);
      return [];
    }
  }
  







  private SncfCache: any = [];
  setSncfCache(newData: any) {this.SncfCache = newData;};
  getSncfCache() {return this.SncfCache;};
  async getSncfAPI() {
    try {
      const apiKey = this.configService.get('SNCF_API');
      if (!apiKey) throw new Error("La clé SNCF_API est introuvable.");

      const authHeader = 'Basic ' + Buffer.from(apiKey.trim() + ':').toString('base64');

      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const datetimeSncf = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      const garesMajeures = [
        { id: 'stop_area:SNCF:87686006', name: 'Paris Gare de Lyon' },
        { id: 'stop_area:SNCF:87271007', name: 'Paris Gare du Nord' },
        { id: 'stop_area:SNCF:87547000', name: 'Paris Gare d\'Austerlitz' },
        { id: 'stop_area:SNCF:87723163', name: 'Lyon Part-Dieu' },
        { id: 'stop_area:SNCF:87751008', name: 'Marseille Saint-Charles' },
        { id: 'stop_area:SNCF:87581009', name: 'Bordeaux Saint-Jean' },
        { id: 'stop_area:SNCF:87286005', name: 'Lille Flandres' },
        { id: 'stop_area:SNCF:87481002', name: 'Nantes' },
        { id: 'stop_area:SNCF:87212027', name: 'Strasbourg Ville' },
        { id: 'stop_area:SNCF:87611004', name: 'Toulouse Matabiau' },
        { id: 'stop_area:SNCF:87391003', name: 'Paris Montparnasse' },
        { id: 'stop_area:SNCF:87113001', name: 'Paris Est' },
        { id: 'stop_area:SNCF:87384008', name: 'Paris Saint-Lazare' },
        { id: 'stop_area:SNCF:87471003', name: 'Rennes' },
        { id: 'stop_area:SNCF:87756056', name: 'Nice Ville' },
        { id: 'stop_area:SNCF:87773002', name: 'Montpellier Saint-Roch' },
        { id: 'stop_area:SNCF:87755009', name: 'Toulon' },
        { id: 'stop_area:SNCF:87141002', name: 'Nancy Ville' },
        { id: 'stop_area:SNCF:87111849', name: 'Marne-la-Vallée Chessy' },
        { id: 'stop_area:SNCF:87393702', name: 'Massy TGV' },
        { id: 'stop_area:SNCF:87271494', name: 'Aéroport CDG2 TGV' }
      ];

      const promessesGares = garesMajeures.map(async (gare) => {
        try {
          const url = `https://api.sncf.com/v1/coverage/sncf/stop_areas/${gare.id}/departures?from_datetime=${datetimeSncf}&count=100`;
          const res = await fetch(url, { headers: { 'Authorization': authHeader } });
          
          if (!res.ok) return [];
          
          const data = await res.json();
          return (data.departures || []).map((dep: any) => {
            const display = dep.display_informations;
            const stopPoint = dep.stop_point;
            return {
              id: `${display?.headsign}-${dep.stop_date_time?.departure_date_time}`,
              trainNumber: display?.headsign,
              type: display?.commercial_mode,
              operator: display?.network,
              departureTime: dep.stop_date_time?.departure_date_time,
              stationName: stopPoint?.name,
              direction: display?.direction ?? null,
              latitude: stopPoint?.coord?.lat ? parseFloat(stopPoint.coord.lat) : null,
              longitude: stopPoint?.coord?.lon ? parseFloat(stopPoint.coord.lon) : null,
            };
          });
        } catch (err) {
          console.warn(`Impossible de récupérer les trains pour ${gare.name}`);
          return [];
        }
      });
      const résultatsParGare = await Promise.all(promessesGares);
      const tousLesTrains = résultatsParGare.flat();
      const trainsUniques = tousLesTrains.filter((train, index, self) =>
        index === self.findIndex((t) => t.id === train.id)
      );
      return trainsUniques;
    } catch (e) {
      console.error("Error 'async getSncfAPI()' : ", e);
      return [];
    }
  }

  private gareCache: any;
  setGareCache(newCache: any){this.gareCache = newCache};
  getGareCache(){return this.gareCache;};
  async getGareAPI()
  {
    try
    {
      const apiResult = await fetch('https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/gares-de-voyageurs/exports/geojson')
      if (!apiResult.ok)
      {
        throw new Error(`SNCF (gare) repond avec un statut : ${apiResult.status}`)
      }
      const data = await apiResult.json();
      return data;
    }
    catch (e)
    {
      console.error("Error 'async getGareAPI' : ", e);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  private railCache: any;
  setRailCache(newCache: any){this.railCache = newCache;};
  getRailCache(){return this.railCache};
  async getRailAPI()
  {
    try
    {
      const apiResult = await fetch(`https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/formes-des-lignes-du-rfn/exports/geojson`);
      if (!apiResult.ok)
        throw new Error(`SNCF (rail) repond avec un statut : ${apiResult.status}`);
      const data = await apiResult.json();
      return data;
    }
    catch (e)
    {
      console.error("Error 'async getGareAPI' : ", e);
      return [];
    }
  };





  private MeteofranceCache: any = [];
  setMeteofranceCache(newdata: any){this.MeteofranceCache = newdata;};
  getMeteofranceCache(){return this.MeteofranceCache;};
  async getMeteofranceAPI() {
    try {
      const apiKey = this.configService.get('METEOFRANCE_API');
      const apiResult = await fetch(
        `https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours`,
        {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!apiResult.ok) {
        throw new Error(`Météo-France repond avec un statut : ${apiResult.status}`);
      }

      const data = await apiResult.json();
      const domainIds = data.product?.periods?.[0]?.timelaps?.domain_ids || [];

      if (domainIds.length === 0) {
        console.warn("Météo-France a renvoyé un tableau domain_ids vide. Structure reçue :", JSON.stringify(data));
        return [];
      }

      return domainIds.map((dep: any) => ({
        department: dep.domain_id,
        maxColorId: dep.max_color_id,
        phenomenons: dep.phenomenon_items?.map((p: any) => ({
          id: p.phenomenon_id,
          colorId: p.phenomenon_max_color_id,
          schedule: p.timelaps_items?.map((t: any) => ({
            begin: t.begin_time,
            end: t.end_time,
            color: t.color_id,
          })) || []
        })) || []
      }));

    } catch (e) {
      console.error("Error 'async getMeteofranceAPI' : ", e);
      return [];
    }
  };



  async getPlaneSpotterApi(icao24: string)
  {
      const existInDatabase = await this.prisma.planes.findUnique({
          where: { id: icao24 },
      });

      if (existInDatabase) {
          return existInDatabase;
      }

      try
      {
          const url = `https://api.planespotters.net/pub/photos/hex/${icao24}`;
          const result = await fetch(url, {
              headers: {
                  'User-Agent': 'polarview/1.0 (+mailto:thomasmilin1@gmail.com)',
              },
          });
          const json = await result.json();
          const photo = json.photos?.[0];

          if (!photo) {
              return null;
          }

          const saved = await this.prisma.planes.create({
              data: {
                  id: icao24,
                  link: photo.link ?? null,
                  photographer: photo.photographer ?? null,
                  thumbnailSrc: photo.thumbnail_large?.src ?? photo.thumbnail?.src ?? null,
                  thumbnailWidth: photo.thumbnail_large?.size?.width ?? photo.thumbnail?.size?.width ?? null,
                  thumbnailHeight: photo.thumbnail_large?.size?.height ?? photo.thumbnail?.size?.height ?? null,
              },
          });

          return saved;
      }
      catch (e)
      {
          console.error(`Erreur 'getPlaneSpotterApi(${icao24})' : `, e);
          return null;
      }
  }

  // APPELER L'API DE https://aisstream.io/documentation pour les bateaux

}

// faire un script qui requete l'api et envoyer les reponse dans une db postgreSQL (framework -> prisma)