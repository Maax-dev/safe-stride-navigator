
declare module 'react-leaflet-heatmap-layer' {
  import { LayerProps } from 'react-leaflet';
  import L from 'leaflet';

  export interface HeatmapLayerProps extends LayerProps {
    points: any[];
    longitudeExtractor?: (point: any) => number;
    latitudeExtractor?: (point: any) => number;
    intensityExtractor?: (point: any) => number;
    max?: number;
    radius?: number;
    minOpacity?: number;
    maxZoom?: number;
    gradient?: Record<string, string>;
    blur?: number;
  }

  export default class HeatmapLayer extends React.Component<HeatmapLayerProps> {}
}
