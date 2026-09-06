interface ShipPhotoResult {
    url: string;
    thumbUrl: string;
    title: string;
    sourceUrl: string;
    width: number;
    height: number;
}
export declare function fetchWikimediaCommonsAPI(imo: string): Promise<ShipPhotoResult | null>;
export {};
