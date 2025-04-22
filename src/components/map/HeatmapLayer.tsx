
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  centerCoords: [number, number];
  map: L.Map;
}

const BASE_URL = "http://127.0.0.1:5000"; 

const HeatmapLayer = ({ centerCoords, map }: HeatmapLayerProps) => {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Safety check to ensure map exists and is valid
    if (!map || !map.getContainer) {
      console.error("Map is not properly initialized in HeatmapLayer");
      return;
    }

    try {
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
        if (map && map.getContainer) {
          try {
            // Fetch heatmap data from your backend API
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

                // Only add the layer if map is mounted and valid
                heatmapOverlay.addTo(map);
              })
              .catch(error => {
                console.error("Error fetching heatmap data:", error);
              });
          } catch (err) {
            console.error("Error processing heatmap data:", err);
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
