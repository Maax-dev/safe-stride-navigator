
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { useMap } from 'react-leaflet';

interface CustomHeatmapLayerProps {
  points: [number, number, number?][];
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: {[key: number]: string};
  }
}

const CustomHeatmapLayer = ({ points, options = {} }: CustomHeatmapLayerProps) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create heatmap layer
    // Using the module directly without namespaces
    const heatLayer = require('leaflet.heat')(points, {
      radius: options.radius || 15,
      blur: options.blur || 15,
      maxZoom: options.maxZoom || 18,
      max: options.max || 1.0,
      minOpacity: options.minOpacity || 0.5,
      gradient: options.gradient || { 0.4: 'green', 0.7: 'yellow', 1: 'red' }
    });

    // Add to map
    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // Clean up on unmount
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, options]);

  // This component doesn't render anything directly
  return null;
};

export default CustomHeatmapLayer;
