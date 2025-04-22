
declare module 'react-leaflet-heatmap-layer' {
  import { LayerGroup } from 'leaflet';
  import { ReactNode } from 'react';

  interface HeatmapLayerProps {
    points: any[];
    radius?: number;
    blur?: number;
    max?: number;
    maxZoom?: number;
    gradient?: { [key: number]: string };
    minOpacity?: number;
    intensityExtractor?: (point: any) => number;
  }

  declare const HeatmapLayer: React.ComponentType<HeatmapLayerProps>;
  export default HeatmapLayer;
}
