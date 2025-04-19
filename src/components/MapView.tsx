
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map, Navigation, Flag, Mic, MicOff, MapPin } from "lucide-react";

// Note: In a production app, this would be stored in environment variables
// For this demo, we're using a temporary solution with a placeholder token
const MAPBOX_TOKEN = "YOUR_MAPBOX_PUBLIC_TOKEN";

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ showHeatmap = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Set up the map when component mounts
  useEffect(() => {
    if (mapContainer.current === null) return;
    
    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        
        // Initialize map
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [longitude, latitude],
          zoom: 14
        });
        
        map.current = newMap;
        
        // Add navigation controls
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add user's location marker
        new mapboxgl.Marker({ color: "#33C3F0" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
          .addTo(newMap);
        
        // Add search geocoder
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false
        });
        
        newMap.addControl(geocoder);
        
        // If heatmap mode is enabled, add the heatmap layer
        if (showHeatmap) {
          // This would be where real crime data would be loaded from a backend
          // For demonstration, we'll use dummy data
          newMap.on('load', () => {
            // Add a heatmap layer with dummy crime data
            newMap.addSource('crime-data', {
              'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': generateDummyCrimeData(longitude, latitude, 100)
              }
            });
            
            newMap.addLayer({
              'id': 'crime-heat',
              'type': 'heatmap',
              'source': 'crime-data',
              'maxzoom': 15,
              'paint': {
                // Increase the heatmap weight based on frequency
                'heatmap-weight': 1,
                // Increase the heatmap color weight by zoom level
                'heatmap-intensity': 1,
                // Color ramp for heatmap from blue to red
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33,102,172,0)',
                  0.2, 'rgb(103,169,207)',
                  0.4, 'rgb(209,229,240)',
                  0.6, 'rgb(253,219,199)',
                  0.8, 'rgb(239,138,98)',
                  1, 'rgb(178,24,43)'
                ],
                // Adjust the radius of heatmap points by zoom level
                'heatmap-radius': 15,
                // Opacity transition based on zoom level
                'heatmap-opacity': 0.7
              }
            });
          });
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
        
        // Default to a central location if user location is not available
        const defaultLocation: [number, number] = [-74.006, 40.7128]; // New York
        setUserLocation(defaultLocation);
        
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: defaultLocation,
          zoom: 12
        });
        
        map.current = newMap;
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }
    );
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showHeatmap]);
  
  // Function to calculate route
  const calculateRoute = () => {
    if (!map.current || !userLocation || !destination) return;
    
    setIsLoading(true);
    
    // In a real app, this would use Mapbox Directions API
    // For this demo, we'll just simulate a route with a straight line
    
    // Geocode the destination (in real app would use Mapbox Geocoding API)
    const mockDestCoords: [number, number] = [
      userLocation[0] + (Math.random() * 0.02 - 0.01), // Add some randomness
      userLocation[1] + (Math.random() * 0.02 - 0.01)
    ];
    
    // Add destination marker
    new mapboxgl.Marker({ color: "#6B46C1" })
      .setLngLat(mockDestCoords)
      .setPopup(new mapboxgl.Popup().setHTML("<h3>Destination</h3>"))
      .addTo(map.current);
    
    // Draw route line (in real app would use actual route geometry)
    if (map.current.getSource('route')) {
      (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [userLocation, mockDestCoords]
        }
      });
    } else {
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [userLocation, mockDestCoords]
          }
        }
      });
      
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#33C3F0',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });
    }
    
    // Fit map to show both points
    const bounds = new mapboxgl.LngLatBounds()
      .extend(userLocation)
      .extend(mockDestCoords);
    
    map.current.fitBounds(bounds, {
      padding: 100
    });
    
    setIsLoading(false);
  };
  
  // Generate dummy crime data for the heatmap
  const generateDummyCrimeData = (lng: number, lat: number, count: number) => {
    const features = [];
    for (let i = 0; i < count; i++) {
      // Create cluster effects by using normal distribution
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
            lng + distance * Math.cos(angle), 
            lat + distance * Math.sin(angle)
          ]
        }
      });
    }
    return features;
  };
  
  return (
    <div className="w-full h-[calc(100vh-140px)] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {!showHeatmap && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 shadow-lg bg-background/90 backdrop-blur">
          <div className="flex gap-2">
            <Input
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={calculateRoute}
              className="flex-shrink-0"
              disabled={isLoading || !destination}
            >
              <Navigation className="mr-2 h-4 w-4" /> Go
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapView;
