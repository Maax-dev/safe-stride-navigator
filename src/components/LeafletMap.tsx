import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';

// Import marker images
import redMarker from '../assets/marker-red.png';
import yellowMarker from '../assets/marker-yellow.png';
import greenMarker from '../assets/marker-green.png';

// Define the type for incident data
interface Incident {
  id: number;
  latitude: number;
  longitude: number;
  riskLevel: 'high' | 'medium' | 'low';
}

// Mock incident data
const mockIncidents: Incident[] = [
  { id: 1, latitude: 34.0522, longitude: -118.2437, riskLevel: 'high' }, // Los Angeles
  { id: 2, latitude: 37.7749, longitude: -122.4194, riskLevel: 'medium' }, // San Francisco
  { id: 3, latitude: 40.7128, longitude: -74.0060, riskLevel: 'low' }, // New York
  { id: 4, latitude: 51.5074, longitude: 0.1278, riskLevel: 'high' }, // London
  { id: 5, latitude: 48.8566, longitude: 2.3522, riskLevel: 'medium' }, // Paris
  { id: 6, latitude: 35.6895, longitude: 139.6917, riskLevel: 'low' }, // Tokyo
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

const LeafletMap = ({ showHeatmap, isMounted, containerRef }) => {
  const { theme } = useTheme();
  const [mapCenter, setMapCenter] = useState([34.0522, -118.2437]); // Default to Los Angeles
  const [mapZoom, setMapZoom] = useState(12);
  const map = useRef(null);

  useEffect(() => {
    if (!map.current) return;
    
    const style = theme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';
    
    map.current.setStyle(style);
  }, [theme]);

  const heatmapData = mockIncidents.map(incident => [incident.latitude, incident.longitude, incident.riskLevel === 'high' ? 1 : incident.riskLevel === 'medium' ? 0.7 : 0.4]);

  const mapStyle = {
    height: '100%',
    width: '100%',
    ...(isMounted ? {} : { visibility: 'hidden' }),
  };

  const mapboxAccessToken = 'pk.eyJ1Ijoic2hhaHNhbmthbXJ1bCIsImEiOiJjbHJ4NzJvdG8wMWFmMmhwY3g4ZnIwcHV6In0.mKI2Jc0jLg75vOj5qfKzvw';

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.invalidateSize();
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
      ref={map}
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`}
        attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {showHeatmap && (
        <HeatmapLayer
          gradient={{ 0.4: 'green', 0.7: 'yellow', 1: 'red' }}
          blur={15}
          maxZoom={18}
          radius={15}
          minOpacity={0.5}
          max={1}
          intensityExtractor={m => m[2]}
          points={heatmapData}
        />
      )}
      {mockIncidents.map(incident => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={getMarkerIcon(incident.riskLevel)}
        >
          <Popup>
            Incident ID: {incident.id}
            <br />
            Risk Level: {incident.riskLevel}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
