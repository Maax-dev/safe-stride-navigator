
import React from 'react';
import L from 'leaflet';

interface HeatmapLayerProps {
  centerCoords: [number, number];
  map: L.Map;
}

const HeatmapLayer = ({ centerCoords, map }: HeatmapLayerProps) => {
  React.useEffect(() => {
    const generateDummyCrimeData = (lat: number, lng: number, count: number) => {
      const features = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.02 * Math.pow(Math.random(), 0.5);
        
        features.push({
          type: 'Feature',
          properties: {
            id: i,
            type: ['theft', 'assault', 'harassment'][Math.floor(Math.random() * 3)],
            intensity: Math.random()
          },
          geometry: {
            type: 'Point',
            coordinates: [
              lat + distance * Math.cos(angle), 
              lng + distance * Math.sin(angle)
            ]
          }
        });
      }
      return features;
    };

    const points = generateDummyCrimeData(centerCoords[0], centerCoords[1], 100);
    const heatmapOverlay = L.layerGroup().addTo(map);
    
    points.forEach(point => {
      const intensity = point.properties.intensity;
      
      const getColor = (value: number): string => {
        if (value > 0.7) return '#d73027';
        if (value > 0.4) return '#fc8d59';
        if (value > 0.2) return '#fee090';
        return '#e0f3f8';
      };
      
      const marker = L.circleMarker(
        [point.geometry.coordinates[0], point.geometry.coordinates[1]], 
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

    return () => {
      map.removeLayer(heatmapOverlay);
    };
  }, [centerCoords, map]);

  return null;
};

export default HeatmapLayer;
