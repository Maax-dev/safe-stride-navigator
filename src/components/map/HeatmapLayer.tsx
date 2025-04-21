
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';

interface HeatmapLayerProps {
  centerCoords: [number, number];
  map: L.Map;
  isVisible: boolean; // Visibility prop
}

const BASE_URL = "http://127.0.0.1:5000"; 

const HeatmapLayer = ({ centerCoords, map, isVisible }: HeatmapLayerProps) => {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  // Effect to handle visibility changes
  useEffect(() => {
    // Safety check to ensure map exists and is valid
    if (!map || !map._loaded) {
      console.error("Map is not properly initialized in HeatmapLayer");
      return;
    }

    try {
      // If the layer exists and we're toggling visibility
      if (heatmapLayerRef.current) {
        // Remove existing layer when toggle is off
        if (map.hasLayer(heatmapLayerRef.current) && !isVisible) {
          console.log("Removing heatmap layer due to toggle off");
          map.removeLayer(heatmapLayerRef.current);
          return;
        }
        // Add back the layer if toggle is on and layer exists but isn't on map
        else if (!map.hasLayer(heatmapLayerRef.current) && isVisible) {
          console.log("Re-adding existing heatmap layer due to toggle on");
          heatmapLayerRef.current.addTo(map);
          return;
        }
        // If the correct visibility state is already applied, do nothing
        else if ((map.hasLayer(heatmapLayerRef.current) && isVisible) || 
                (!map.hasLayer(heatmapLayerRef.current) && !isVisible)) {
          return;
        }
      }

      // Only create and add layer if it should be visible and doesn't exist yet
      if (isVisible && !heatmapLayerRef.current) {
        // Create a new layer group
        const heatmapOverlay = L.layerGroup();
        heatmapLayerRef.current = heatmapOverlay;

        // Short delay to ensure map is ready
        setTimeout(() => {
          if (map && map._loaded && isVisible) {
            try {
              // Fetch heatmap data from your backend API
              fetch(`${BASE_URL}/heatmap_data`)
                .then(res => res.json())
                .then(points => {
                  if (!isVisible) return; // Exit if visibility changed during fetch
                  
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

                  // Only add the layer if map is mounted, valid, and still visible
                  if (isVisible) {
                    heatmapOverlay.addTo(map);
                  }
                })
                .catch(error => {
                  console.error("Error fetching heatmap data:", error);
                });
            } catch (err) {
              console.error("Error processing heatmap data:", err);
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error in HeatmapLayer:", error);
    }
  }, [centerCoords, map, isVisible]); // Respond to isVisible changes

  // Cleanup effect when component unmounts
  useEffect(() => {
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
  }, [map]);

  return null;
};

export default HeatmapLayer;
