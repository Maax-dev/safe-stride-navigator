
declare module 'leaflet.heat' {
  import * as L from 'leaflet';
  
  namespace Heat {
    interface HeatLayer extends L.Layer {
      setLatLngs(latlngs: L.LatLngExpression[]): this;
      addLatLng(latlng: L.LatLngExpression): this;
      setOptions(options: HeatLayerOptions): this;
      redraw(): this;
    }

    interface HeatLayerOptions {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: {[key: number]: string};
    }
    
    function heatLayer(
      latlngs: L.LatLngExpression[],
      options?: HeatLayerOptions
    ): HeatLayer;
  }
  
  export = Heat;
}
