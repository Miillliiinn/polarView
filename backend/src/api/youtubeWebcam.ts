const BLACKLIST = [
  'illinois', 'usa', 'los angeles', 'thailand', 'indonesia', 'italia'
];

export function sanitize(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterAndMapVideos(videoLive: any[], city: string) {
  const cleanCity = sanitize(city);

  const strictVideos = videoLive.filter((item: any) => {
    const title = sanitize(item.snippet.title);
    const description = sanitize(item.snippet.description);
    const channel = sanitize(item.snippet.channelTitle);

    const isBlacklisted = BLACKLIST.some((term) => title.includes(term));
    if (isBlacklisted) return false;

    const hasCity = title.includes(cleanCity) || description.includes(cleanCity) || channel.includes(cleanCity);
    const isCam = title.includes('webcam') || title.includes('live') || title.includes('cam') || title.includes('direct');

    return hasCity && isCam;
  });

  return strictVideos.map((item: any) => ({
    youtubeVideoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    channel: item.snippet.channelTitle,
    city,
  }));
}

/**
 * Cherche des webcams live YouTube pour une ville donnée.
 * Retourne [] en cas d'erreur (jamais de throw).
 */
export async function fetchYoutubeWebcams(apiKey: string, city: string) {
  try {
    const query = encodeURIComponent(`webcam ${city}`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=${query}&relevanceLanguage=fr&regionCode=FR&maxResults=50&key=${apiKey}`;

    const apiResult = await fetch(url);
    const resJson = await apiResult.json();

    if (resJson.error) {
      console.error(`❌ Erreur API YouTube pour "${city}" :`, resJson.error.message);
      return [];
    }

    const videoLive = resJson.items || [];
    return filterAndMapVideos(videoLive, city);
  }
  catch (e) {
    console.error(`Error 'fetchYoutubeWebcams(${city})' : `, e);
    return [];
  }
}