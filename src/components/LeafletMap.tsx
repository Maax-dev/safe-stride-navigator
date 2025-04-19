
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

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

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    const initMap = () => {
      // Request user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          try {
            // Create map instance if it doesn't exist
            if (!mapInstanceRef.current && mapRef.current) {
              const map = L.map(mapRef.current).setView([latitude, longitude], 14);
              
              // Add OpenStreetMap tile layer
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
              }).addTo(map);
              
              // Add user marker
              const userMarker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                  className: 'user-marker',
                  html: '<div class="pulse"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map);
              userMarker.bindPopup("Your Location").openPopup();
              
              // Store map instance
              mapInstanceRef.current = map;
              
              // Add CSS for the user marker
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
              
              // If heatmap is enabled, add heat layer
              if (showHeatmap) {
                addHeatmapLayer(map, [latitude, longitude]);
              }
              
              setMapError(null);
            }
            
            setIsLoading(false);
          } catch (error) {
            console.error("Map initialization error:", error);
            setMapError("Failed to initialize map. Please try again later.");
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setMapError("Unable to get your location. Please check your location permissions.");
          setIsLoading(false);
          
          // Default to a central location if user location is not available
          setUserLocation([40.7128, -74.006]); // New York
        }
      );
    };
    
    initMap();
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showHeatmap]);
  
  // Add heatmap layer using canvas rendering instead of leaflet.heat
  const addHeatmapLayer = (map: L.Map, centerCoords: [number, number]) => {
    // Generate dummy crime data
    const points = generateDummyCrimeData(centerCoords[0], centerCoords[1], 100);
    
    // Create a custom overlay for the heatmap
    const heatmapOverlay = L.layerGroup().addTo(map);
    
    // Add circle markers with varying opacity and color based on "intensity"
    points.forEach(point => {
      const intensity = point.properties.intensity;
      
      // Calculate color based on intensity (red for high, yellow for medium, green for low)
      const getColor = (value: number): string => {
        if (value > 0.7) return '#d73027'; // high (red)
        if (value > 0.4) return '#fc8d59'; // medium-high (orange)
        if (value > 0.2) return '#fee090'; // medium (yellow)
        return '#e0f3f8'; // low (light blue)
      };
      
      const marker = L.circleMarker(
        [point.geometry.coordinates[0], point.geometry.coordinates[1]], 
        {
          radius: 8 + (intensity * 12), // Size based on intensity
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
  };
  
  // Generate dummy crime data for the heatmap
  const generateDummyCrimeData = (lat: number, lng: number, count: number) => {
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
            lat + distance * Math.cos(angle), 
            lng + distance * Math.sin(angle)
          ]
        }
      });
    }
    return features;
  };
  
  // Calculate route between user location and destination
  const calculateRoute = () => {
    if (!mapInstanceRef.current || !userLocation || !destination) return;
    
    setIsLoading(true);
    
    // In a real app, this would use a routing API
    // For this demo, we'll just simulate a route with a straight line
    
    // Geocode the destination (in real app would use a real geocoding API)
    const mockDestCoords: [number, number] = [
      userLocation[0] + (Math.random() * 0.02 - 0.01), // Add some randomness
      userLocation[1] + (Math.random() * 0.02 - 0.01)
    ];
    
    // Add destination marker
    const destIcon = L.divIcon({
      className: 'destination-marker',
      html: '<div style="background-color: #6B46C1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    const destMarker = L.marker(mockDestCoords, { icon: destIcon }).addTo(mapInstanceRef.current);
    destMarker.bindPopup("Destination").openPopup();
    
    // Draw route line
    const routePoints = [
      [userLocation[0], userLocation[1]],
      [mockDestCoords[0], mockDestCoords[1]]
    ];
    
    const routeLine = L.polyline(routePoints as L.LatLngExpression[], {
      color: '#33C3F0',
      weight: 5,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);
    
    // Fit map to show both points
    mapInstanceRef.current.fitBounds(routeLine.getBounds(), {
      padding: [100, 100]
    });
    
    setIsLoading(false);
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
            Please check your location permissions or try reloading the page.
          </p>
          
          <Button onClick={() => window.location.reload()}>
            Reload Map
          </Button>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full rounded-lg" />
      )}
      
      {!showHeatmap && !mapError && (
        <div className="absolute bottom-4 left-4 right-4 p-4 shadow-lg bg-background/90 backdrop-blur rounded-lg">
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
              Go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
