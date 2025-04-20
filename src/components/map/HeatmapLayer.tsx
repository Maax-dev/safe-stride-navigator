
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';

interface HeatmapLayerProps {
  centerCoords: [number, number];
  map: L.Map;
}

const HeatmapLayer = ({ centerCoords, map }: HeatmapLayerProps) => {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Safety check to ensure map exists and is valid
    if (!map || !map._loaded) {
      console.error("Map is not properly initialized in HeatmapLayer");
      return;
    }

    try {
      const generateDummyCrimeData = (lat: number, lng: number, count: number) => {
        const features = [];
        for (let i = 0; i < count; i++) {
          // Randomize the position around the center
          const angle = Math.random() * Math.PI * 2;
          const distance = 0.02 * Math.pow(Math.random(), 0.5);
          
          // Create feature with random type and intensity
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

      // Clean up previous layer if it exists
      if (heatmapLayerRef.current) {
        if (map.hasLayer(heatmapLayerRef.current)) {
          map.removeLayer(heatmapLayerRef.current);
        }
      }

      // Create a new layer group
      const heatmapOverlay = L.layerGroup();
      heatmapLayerRef.current = heatmapOverlay;
      
      // Short delay to ensure map is ready
      setTimeout(() => {
        if (map && map._loaded) {
          try {
            const points = generateDummyCrimeData(centerCoords[0], centerCoords[1], 100);
            
            // Add markers to the layer group
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
            
            // Only add the layer if map is mounted and valid
            heatmapOverlay.addTo(map);
          } catch (err) {
            console.error("Error creating markers:", err);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error in HeatmapLayer:", error);
    }

    return () => {
      // Safety cleanup
      try {
        if (heatmapLayerRef.current && map && map.hasLayer && typeof map.hasLayer === 'function') {
          if (map.hasLayer(heatmapLayerRef.current)) {
            map.removeLayer(heatmapLayerRef.current);
          }
          heatmapLayerRef.current = null;
        }
      } catch (err) {
        console.error("Error during HeatmapLayer cleanup:", err);
      }
    };
  }, [centerCoords, map]);

  return null;
};

export default HeatmapLayer;
