export async function fetchWikimediaCommonsAPI(id: string): Promise<any | null>
{
    try
    {
        const categoryTitle = `Category:IMO ${id.trim()}`;
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmtype=file&cmlimit=10&format=json&origin=*`;

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok)
            return null;

        const searchData = await searchResponse.json();
        const members = searchData?.query?.categorymembers ?? [];

        if (members.length === 0)
            return null;

        const fileTitle: string = members[0].title;

        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size&iiurlwidth=800&format=json&origin=*`;

        const infoResponse = await fetch(infoUrl);
        if (!infoResponse.ok)
            return null;

        const infoData = await infoResponse.json();
        const pages = infoData?.query?.pages ?? {};
        const page: any = Object.values(pages)[0];
        const imageInfo = page?.imageinfo?.[0];

        if (!imageInfo)
            return null;

        return {
            url: imageInfo.url,
            thumbUrl: imageInfo.thumburl ?? imageInfo.url,
            title: fileTitle,
            sourceUrl: imageInfo.descriptionurl,
            width: imageInfo.width,
            height: imageInfo.height,
        };
    }
    catch (e)
    {
        console.error("Error 'fetchShipSpottingAPI' :", e);
        return null;
    }
}