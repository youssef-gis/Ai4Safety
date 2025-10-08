import { CesiumType } from "./types/cesium";


export const basemapsLayers =  ( CesiumJs: CesiumType,)=>{

        /* Per Carto's website regarding basemap attribution: https://carto.com/help/working-with-data/attribution/#basemaps */
    const CartoAttribution = 'Map tiles by <a href="https://carto.com">Carto</a>, under CC BY 3.0. Data by <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, under ODbL.'

    // Create ProviderViewModel based on different imagery sources
    // - these can be used without CesiumJs Ion
    const imageryViewModels = [];

    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'OpenStreetMap',
        iconUrl: CesiumJs.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        tooltip: 'OpenStreetMap (OSM) is a collaborative project to create a free editable \
                    map of the world.\nhttp://www.openstreetmap.org',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: 'abc',
            minimumLevel: 0,
            maximumLevel: 19
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Positron',
        tooltip: 'CartoDB Positron basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/light_all/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Positron without labels',
        tooltip: 'CartoDB Positron without labels basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/rastertiles/light_nolabels/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Dark Matter',
        tooltip: 'CartoDB Dark Matter basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/rastertiles/dark_all/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Dark Matter without labels',
        tooltip: 'CartoDB Dark Matter without labels basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/rastertiles/dark_nolabels/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Voyager',
        tooltip: 'CartoDB Voyager basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'Voyager without labels',
        tooltip: 'CartoDB Voyager without labels basemap',
        iconUrl: 'http://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/5/15/12.png',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png',
            credit: CartoAttribution,
            minimumLevel: 0,
            maximumLevel: 18
        });
        }
    }));
    imageryViewModels.push(new CesiumJs.ProviderViewModel({
        name: 'National Map Satellite',
        tooltip: 'National Map Satellite',
        iconUrl: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/4/6/4',
        creationFunction: function() {
        return new CesiumJs.UrlTemplateImageryProvider({
            url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
            credit: 'Tile data from <a href="https://basemap.nationalmap.gov/">USGS</a>',
            minimumLevel: 0,
            maximumLevel: 16
        });
        }
    }));

    return imageryViewModels;

};

