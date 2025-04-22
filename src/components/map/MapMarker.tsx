
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarkerProps {
  position: [number, number];
  map: L.Map;
  isUser?: boolean;
  popup?: string;
}

const MapMarker = ({ position, map, isUser = false, popup = '' }: MapMarkerProps) => {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Check if map is properly initialized before adding marker
    if (!map || typeof map.getContainer !== 'function') {
      console.log("Map not ready in MapMarker, marker creation delayed");
      return;
    }

    try {
      const icon = L.divIcon({
        className: isUser ? 'user-marker' : 'destination-marker',
        html: `<div class="${isUser ? 'pulse' : ''}" style="background-color: ${isUser ? '#33C3F0' : '#6B46C1'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      // Create the marker but don't add it to the map yet
      const marker = L.marker(position, { icon });
      markerRef.current = marker;

      // Add the marker to the map only after we're sure the map is ready
      const addMarker = () => {
        if (map && typeof map.getContainer === 'function') {
          marker.addTo(map);
          if (popup) marker.bindPopup(popup);
        }
      };

      // Try to add marker - both immediately and after a short delay
      addMarker();
      setTimeout(addMarker, 300); // Backup attempt
      
      return () => {
        if (marker && map && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
        markerRef.current = null;
      };
    } catch (error) {
      console.error("Error creating marker:", error);
    }
  }, [position, map, isUser, popup]);

  return null;
};

export default MapMarker;
