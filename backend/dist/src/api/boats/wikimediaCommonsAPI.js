"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWikimediaCommonsAPI = fetchWikimediaCommonsAPI;
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
async function getCategoryMembers(categoryTitle, cmtype) {
    const url = new URL(COMMONS_API);
    url.search = new URLSearchParams({
        action: "query",
        list: "categorymembers",
        cmtitle: categoryTitle,
        cmtype,
        cmlimit: "10",
        format: "json",
        origin: "*",
    }).toString();
    const res = await fetch(url.toString());
    if (!res.ok)
        return [];
    const data = await res.json();
    return data?.query?.categorymembers ?? [];
}
async function getImageInfo(fileTitle) {
    const url = new URL(COMMONS_API);
    url.search = new URLSearchParams({
        action: "query",
        titles: fileTitle,
        prop: "imageinfo",
        iiprop: "url|size",
        iiurlwidth: "800",
        format: "json",
        origin: "*",
    }).toString();
    const res = await fetch(url.toString());
    if (!res.ok)
        return null;
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0];
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
async function fetchWikimediaCommonsAPI(imo) {
    try {
        const categoryTitle = `Category:IMO ${imo.trim()}`;
        const directFiles = await getCategoryMembers(categoryTitle, "file");
        if (directFiles.length > 0) {
            return await getImageInfo(directFiles[0].title);
        }
        const subcats = await getCategoryMembers(categoryTitle, "subcat");
        if (subcats.length === 0)
            return null;
        const subcatFiles = await getCategoryMembers(subcats[0].title, "file");
        if (subcatFiles.length === 0)
            return null;
        return await getImageInfo(subcatFiles[0].title);
    }
    catch (e) {
        console.error(`Error 'fetchWikimediaCommonsAPI(${imo})':`, e);
        return null;
    }
}
//# sourceMappingURL=wikimediaCommonsAPI.js.map