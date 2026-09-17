export class ToolsMap
{
    constructor() {}

    private MapIsExpanded: boolean = false;

    setMapIsExpanded(newdata: boolean){this.MapIsExpanded = newdata};
    getMapIsExpanded(){return this.MapIsExpanded}
}

export const mapGestion = new ToolsMap();