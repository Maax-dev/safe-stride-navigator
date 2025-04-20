
import React from 'react';
import L from 'leaflet';

interface HeatmapLayerProps {
  centerCoords: [number, number];
  map: L.Map;
}
const BASE_URL = "http://127.0.0.1:5000"; 

const HeatmapLayer = ({ centerCoords, map }: HeatmapLayerProps) => {
  React.useEffect(() => {
    const heatmapOverlay = L.layerGroup().addTo(map);
  
    fetch(`${BASE_URL}/heatmap_data`)
      .then(res => res.json())
      .then(points => {
        points.forEach((point: any) => {
          const intensity = point.properties.intensity;
  
          const getColor = (value: number): string => {
            if (value > 0.7) return '#d73027';
            if (value > 0.4) return '#fc8d59';
            if (value > 0.2) return '#fee090';
            return '#e0f3f8';
          };
          console.log("Adding marker at:", point.geometry.coordinates, point.properties.type);

          const marker = L.circleMarker(
            [point.geometry.coordinates[1], point.geometry.coordinates[0]], 
            {
              radius: 8 + (intensity * 12),
              fillColor: getColor(intensity),
              color: 'rgba(0,0,0,0.1)',
              weight: 1,
              opacity: 0.8,
              fillOpacity: 0.6
            }
          );
          
  
          marker.bindPopup(`Reported ${point.properties.type}`);
          heatmapOverlay.addLayer(marker);
        });
      });
  
    return () => {
      map.removeLayer(heatmapOverlay);
    };
  }, [centerCoords, map]);
  

  return null;
};

export default HeatmapLayer;
