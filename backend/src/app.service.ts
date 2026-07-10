import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiService {
  constructor(private configService: ConfigService) {}
  async getGoogleAPI()
  { 
    try 
    {
      const apiKey = this.configService.get('GOOGLE_API');
      const apiResult = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=live+webcam+france&maxResults=10&key=${apiKey}`);
      const resJson = await apiResult.json();
      const videoLive = resJson.items || [];
      return videoLive.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channel: item.snippet.channelTitle,
        
    }));
  }
  catch (e)
  {
    console.error("Error 'async getGoogleAPI()' : ", e);
    return {error: "Impossible de joindre l'API de google"};
  }
  }

  async getOpenskyAPI()
  {
    // a faire : cree un compte gratuit sur opensky pour passer en "basic auth" et pouvoir faire des requete api oute les 5 secondes au lieu de 10 max sans compte
    try 
    {
      const apiResult = await fetch(`https://opensky-network.org/api/states/all?lamin=41.5&lamax=51.5&lomin=-5.5&lomax=10.0`);
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
      return {error: "Impossible de joindre l'API de Opensky Network"};
    }
  }
  
  async getSncfAPI()
  {
    try
    {
      const apiKey = this.configService.get('SNCF_API');
      const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
      const apiResult = await fetch(`https://api.sncf.com/v1/coverage/sncf/vehicle_positions`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });
      const data = await apiResult.json();
      return data.vehicle_positions.flatMap((vp) => {
        const typeTransport = vp.line?.physical_modes?.[0]?.name || 'Inconnu';
        const operateur = vp.line?.commercial_mode?.name || 'Inconnu';
        return (vp.vehicle_journey_positions || []).map((vjp) => ({
          id: vjp.vehicle_journey?.id,
          trainNumber: vjp.vehicle_journey?.name || vjp.vehicle_journey?.headsign,
          type: typeTransport,
          operator: operateur,
          latitude: vjp.coord?.lat || null, 
          longitude: vjp.coord?.lon || null,
        }));
      });
    }
    catch (e)
    {
      console.error("Error 'async getOpenskyAPI()' : ", e);
      return {error: "Impossible de joindre l'API de la SNCF"};
    }
  }

  async getMeteofranceAPI()
  {
    try 
    {
      
    }
    catch (e)
    {
      console.error("Error 'async getMeteofranceAPI' : ", e);
      return {error: "Impossible de joindr l'API de Meteo France"};
    }
  }
}


// faire un script qui requete l'api et envoyer les reponse dans une db postgreSQL (framework -> prisma)