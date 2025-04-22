
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CustomHeatmapLayer from './map/CustomHeatmapLayer';

// Import marker images as data URIs to avoid file resolution issues
const redMarker = 'data:image/png;base64,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';
const yellowMarker = 'data:image/png;base64,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';
const greenMarker = 'data:image/png;base64,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';

// Mock incident data for testing
const mockIncidents = [
  { id: 1, latitude: 34.0522, longitude: -118.2437, riskLevel: 'high' },
  { id: 2, latitude: 37.7749, longitude: -122.4194, riskLevel: 'medium' },
  { id: 3, latitude: 40.7128, longitude: -74.0060, riskLevel: 'low' },
  { id: 4, latitude: 51.5074, longitude: 0.1278, riskLevel: 'high' },
  { id: 5, latitude: 48.8566, longitude: 2.3522, riskLevel: 'medium' },
  { id: 6, latitude: 35.6895, longitude: 139.6917, riskLevel: 'low' }
];

// Function to determine marker icon based on risk level
const getMarkerIcon = (riskLevel: string) => {
  let iconUrl;
  switch (riskLevel) {
    case 'high':
      iconUrl = redMarker;
      break;
    case 'medium':
      iconUrl = yellowMarker;
      break;
    case 'low':
      iconUrl = greenMarker;
      break;
    default:
      iconUrl = greenMarker;
  }

  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LeafletMapProps {
  showHeatmap?: boolean;
  isMounted?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ showHeatmap = false, isMounted = true, containerRef }) => {
  const { theme } = useTheme();
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Default to Los Angeles
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef<L.Map | null>(null);

  // Handle theme changes
  const MapThemeUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      // Leaflet doesn't support direct style changes, we'd need a different approach
      // This is just a placeholder for future theme implementation
      console.log("Theme changed to:", theme);
    }, [theme]);
    
    return null;
  };

  const heatmapData = mockIncidents.map((incident) => [
    incident.latitude,
    incident.longitude,
    incident.riskLevel === 'high' ? 1 : incident.riskLevel === 'medium' ? 0.7 : 0.4
  ]);

  const mapStyle = {
    height: '100%',
    width: '100%',
    ...(isMounted ? {} : { visibility: 'hidden' as const })
  };

  const mapboxAccessToken = 'pk.eyJ1Ijoic2hhaHNhbmthbXJ1bCIsImEiOiJjbHJ4NzJvdG8wMWFmMmhwY3g4ZnIwcHV6In0.mKI2Jc0jLg75vOj5qfKzvw';

  useEffect(() => {
    if (!containerRef?.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={mapZoom} 
      style={mapStyle} 
      ref={mapRef} 
      className="map-container"
      zoomControl={false}
    >
      <MapThemeUpdater />
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/${theme === 'dark' ? 'dark-v11' : 'light-v11'}/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`}
        attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {showHeatmap && (
        <CustomHeatmapLayer
          points={heatmapData}
          options={{
            radius: 15,
            blur: 15,
            maxZoom: 18,
            minOpacity: 0.5,
            max: 1,
            gradient: {0.4: 'green', 0.7: 'yellow', 1: 'red'}
          }}
        />
      )}

      {mockIncidents.map((incident) => (
        <Marker 
          key={incident.id} 
          position={[incident.latitude, incident.longitude]} 
          icon={getMarkerIcon(incident.riskLevel)}
        >
          <Popup>
            Incident ID: {incident.id}<br />
            Risk Level: {incident.riskLevel}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
