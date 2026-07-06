import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  async getAPI()
  { 
    const apiKey = this.configService.get('GOOGLE_API');
    const apiResult = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=live+webcam&maxResults=10&key=${apiKey}`);
    const resJson = await apiResult.json();
    const videoLive = resJson.items || [];
    return videoLive.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));
  }
}


// faire un script qui requete l'api et envoyer les reponse dans une db postgreSQL (framework -> prisma)