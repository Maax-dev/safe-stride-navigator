import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DestinationInput from './map/DestinationInput';
import MapMarker from './map/MapMarker';
import HeatmapLayer from './map/HeatmapLayer';

interface LeafletMapProps {
  showHeatmap?: boolean;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ showHeatmap = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<string>("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeLine, setRouteLine] = useState<L.Polyline | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Handle transitions between map modes
  useEffect(() => {
    if (mapRef.current && isMapInitialized) {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [showHeatmap, isMapInitialized]);

  // Initialize the map
  useEffect(() => {
    // Only create a map if none exists yet and container is available
    if (!mapInstanceRef.current && mapRef.current) {
      console.log("Preparing to initialize map");
      
      const initMap = () => {
        try {
          // MOCKED for testing
          const latitude = 37.8044;
          const longitude = -122.2711;
          setUserLocation([latitude, longitude]);

          console.log("Creating map instance");
          const map = L.map(mapRef.current!).setView([latitude, longitude], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
          mapInstanceRef.current = map;
          
          if (!document.getElementById('leaflet-styles')) {
            const style = document.createElement('style');
            style.id = 'leaflet-styles';
            style.innerHTML = `
              .user-marker {
                background-color: transparent;
              }
              .pulse {
                border-radius: 50%;
                height: 14px;
                width: 14px;
                background: rgba(51, 195, 240, 1);
                border: 3px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 0 0 rgba(51, 195, 240, 0.4);
                animation: pulse 2s infinite;
              }
              @keyframes pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(51, 195, 240, 0.4);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(51, 195, 240, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(51, 195, 240, 0);
                }
              }
            `;
            document.head.appendChild(style);
          }
          
          // Force a re-render by invalidating map size
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
          
          setMapError(null);
          setIsMapInitialized(true);
          setIsLoading(false);
          console.log("Map successfully initialized");
        } catch (error) {
          console.error("Map initialization error:", error);
          setMapError("Failed to initialize map. Please try again later.");
          setIsLoading(false);
        }
      };
      
      // Use setTimeout to ensure the container is fully rendered
      setTimeout(initMap, 100);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map instance");
        try {
          if (routeLine) {
            mapInstanceRef.current.removeLayer(routeLine);
          }
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          setIsMapInitialized(false);
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, []); // Empty dependency array to run only once

  // Update map display when showHeatmap prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, [showHeatmap]);

  const calculateRoute = async () => {
    if (!mapInstanceRef.current || !userLocation || !destination) return;
    setIsLoading(true);
  
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/safe_path?destination=${encodeURIComponent(destination)}&start_lat=${userLocation[0]}&start_lon=${userLocation[1]}`
      );
  
      if (!response.ok) throw new Error('Failed to fetch route');
  
      const data = await response.json();
      console.log("Fetched data:", data);
  
      const listOfCoords: L.LatLngExpression[] = data.route.map(
        (coord: [number, number]) => [coord[0], coord[1]]
      );
  
      if (listOfCoords.length === 0) throw new Error("Empty route");
  
      // Remove existing route line if present and map exists
      if (routeLine && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLine);
      }
  
      // Only add new line if map still exists
      if (mapInstanceRef.current) {
        const newLine = L.polyline(listOfCoords, {
          color: '#33C3F0',
          weight: 5,
          opacity: 0.8
        }).addTo(mapInstanceRef.current);
    
        mapInstanceRef.current.fitBounds(newLine.getBounds(), {
          padding: [100, 100]
        });
    
        setRouteLine(newLine);  // Save current line in state
      }
    } catch (error) {
      console.error("API fetch error:", error);
      alert(`Route error: ${error}`);
    }
  
    setIsLoading(false);
  };

  const renderMap = () => {
    if (mapError) {
      return (
        <div className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center p-6">
          <div className="mb-4 text-destructive">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2">{mapError}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Please check your location permissions or try reloading the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Map
          </Button>
        </div>
      );
    }

    return <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "500px" }} />;
  };

  return (
    <div className="w-full h-full flex-grow relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      <div className={`w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {renderMap()}
      </div>
      
      <DestinationInput
        destination={destination}
        setDestination={setDestination}
        onCalculateRoute={calculateRoute}
        isLoading={isLoading}
      />

      {mapInstanceRef.current && userLocation && isMapInitialized && (
        <MapMarker
          position={userLocation}
          map={mapInstanceRef.current}
          isUser={true}
          popup="Your Location"
        />
      )}

      {showHeatmap && mapInstanceRef.current && userLocation && isMapInitialized && (
        <HeatmapLayer
          centerCoords={userLocation}
          map={mapInstanceRef.current}
        />
      )}
    </div>
  );
};

export default LeafletMap;
