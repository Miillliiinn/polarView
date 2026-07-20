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
    try
    {
      const apiKey = this.configService.get('GOOGLE_API');
      const query = encodeURIComponent(`webcam ${city} live`);
      const apiResult = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=${query}&maxResults=50&key=${apiKey}`);
      const resJson = await apiResult.json();
      const videoLive = resJson.items || [];

      return videoLive.map((item) => ({
        youtubeVideoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channel: item.snippet.channelTitle,
        city: city,
      }));
    }
    catch (e)
    {
      console.error(`Error 'async getGoogleAPI(${city})' : `, e);
      return [];
    }
  }



  private OpenskyCache: any = [];
  setOpenskyCache(newData: any) {this.OpenskyCache = newData;};
  getOpenskyCache(){return this.OpenskyCache;};
  async getOpenskyAPI()
  {
    try 
    {
      const clientId = this.configService.get('OPENSKY_CLIENTID');
      const clientsecret = this.configService.get('OPENSKY_CLIENTSECRET');

      const token = Buffer.from(`${clientId}:${clientsecret}`).toString('base64');

      const url = `https://opensky-network.org/api/states/all?lamin=41.0&lamax=51.5&lomin=-5.5&lomax=9.5`;

      const apiResult = await fetch(url, {
        headers: {
          'Authorization': `Basic ${token}`,
          'Accept': `application/json`,
        }
      });
      if (!apiResult.ok)
      {
        throw new Error(`Opensky Network repond avec un statut : ${apiResult.status}`)
      }
      const data = await apiResult.json();
      const state = data.states || [];
      return state
      .filter((f) => f[5] !== null && f[6] !== null)
      .map((f) => ({
        icao24: f[0], // avion id
        callsign: f[1]?.trim(), // numero du vol
        country: f[2], // pays d'origine
        longitude: f[5],
        latitude: f[6],
        altitude: f[7] || f[13] || 0,
        heading: f[10] || 0, // cap / direction en degres (0 = Nord)
        velocity: f[9] || 0,
      }))
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
      { id: 'stop_area:SNCF:87384008', name: 'Paris Gare du Nord' },
      { id: 'stop_area:SNCF:87682005', name: 'Paris Gare d\'Austerlitz' },
      { id: 'stop_area:SNCF:87723163', name: 'Lyon Part-Dieu' },
      { id: 'stop_area:SNCF:87751008', name: 'Marseille Saint-Charles' },
      { id: 'stop_area:SNCF:87581009', name: 'Bordeaux Saint-Jean' },
      { id: 'stop_area:SNCF:87286005', name: 'Lille Flandres' },
      { id: 'stop_area:SNCF:87481002', name: 'Nantes' },
      { id: 'stop_area:SNCF:87212027', name: 'Strasbourg Ville' },
      { id: 'stop_area:SNCF:87611004', name: 'Toulouse Matabiau' }
    ];

    const promessesGares = garesMajeures.map(async (gare) => {
      try {
        const url = `https://api.sncf.com/v1/coverage/sncf/stop_areas/${gare.id}/departures?from_datetime=${datetimeSncf}&count=100`;
        const res = await fetch(url, { headers: { 'Authorization': authHeader } });
        
        if (!res.ok) return []; // Si une gare plante, on renvoie un tableau vide pour ne pas bloquer les autres
        
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
  }
}


// faire un script qui requete l'api et envoyer les reponse dans une db postgreSQL (framework -> prisma)