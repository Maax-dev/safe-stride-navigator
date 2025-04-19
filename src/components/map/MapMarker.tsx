
import React from 'react';
import L from 'leaflet';

interface MapMarkerProps {
  position: [number, number];
  map: L.Map;
  isUser?: boolean;
  popup?: string;
}

const MapMarker = ({ position, map, isUser = false, popup = '' }: MapMarkerProps) => {
  React.useEffect(() => {
    const icon = L.divIcon({
      className: isUser ? 'user-marker' : 'destination-marker',
      html: `<div class="${isUser ? 'pulse' : ''}" style="background-color: ${isUser ? '#33C3F0' : '#6B46C1'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker(position, { icon }).addTo(map);
    if (popup) marker.bindPopup(popup).openPopup();

    return () => {
      map.removeLayer(marker);
    };
  }, [position, map, isUser, popup]);

  return null;
};

export default MapMarker;
