
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Map, Navigation, Flag, Mic, MicOff, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Create a module to store and retrieve the token
const MapTokenManager = {
  getToken: () => {
    // Try to get token from localStorage first
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) return storedToken;
    
    // Fallback to the default token (this should be replaced in production)
    return "pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xvNXFqZzFqMDlnajJpcGlmdnUwczE5ZyJ9.vOzGGDbQJpM-ROiJC8_JJg";
  },
  
  setToken: (token: string) => {
    localStorage.setItem('mapbox_token', token);
  }
};

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ showHeatmap = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(MapTokenManager.getToken());
  
  // Function to initialize the map
  const initializeMap = () => {
    if (mapContainer.current === null) return;
    
    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        
        try {
          // Initialize map
          mapboxgl.accessToken = mapboxToken;
          
          const newMap = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [longitude, latitude],
            zoom: 14,
            failIfMajorPerformanceCaveat: false // This allows map to initialize with software rendering if needed
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
          
          setMapError(null);
          setIsLoading(false);
          
        } catch (error) {
          console.error("Map initialization error:", error);
          setMapError("Failed to initialize map. Please check your Mapbox token or try again later.");
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setMapError("Unable to get your location. Please check your location permissions.");
        setIsLoading(false);
        
        // Default to a central location if user location is not available
        setUserLocation([-74.006, 40.7128]); // New York
      }
    );
  };
  
  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showHeatmap, mapboxToken]);
  
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
  
  // Update token and reinitialize map
  const updateMapboxToken = (newToken: string) => {
    if (newToken && newToken !== mapboxToken) {
      MapTokenManager.setToken(newToken);
      setMapboxToken(newToken);
      
      // Clean up existing map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      toast({
        title: "Mapbox token updated",
        description: "The map will reinitialize with your token.",
      });
      
      // Reinitialize with new token
      setIsLoading(true);
    }
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
      
      {mapError ? (
        <div className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center p-6">
          <div className="mb-4 text-destructive">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2">{mapError}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            To fix this issue, please enter a valid Mapbox access token below:
          </p>
          
          <div className="w-full max-w-md">
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter your Mapbox token" 
                id="mapbox-token-input"
                className="flex-grow"
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={() => updateMapboxToken(mapboxToken)}>
                Update
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Get your token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      )}
      
      {!showHeatmap && !mapError && (
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
