export declare function sanitize(text: string): string;
export declare function fetchYoutubeWebcams(apiKey: string, city: string): Promise<{
    youtubeVideoId: any;
    title: any;
    thumbnail: any;
    channel: any;
    city: string;
}[]>;
