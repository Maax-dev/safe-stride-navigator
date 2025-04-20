
import { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (!mapRef.current) return;
    
    const initMap = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // MOCKED for testing
          const latitude = 37.8044;
          const longitude = -122.2711;
          setUserLocation([latitude, longitude]);

          try {
            if (!mapInstanceRef.current && mapRef.current) {
              const map = L.map(mapRef.current).setView([latitude, longitude], 14);
              
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
          setUserLocation([40.7128, -74.006]);
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

  const calculateRoute = () => {
    var listOfLists=[]
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/safe_path?destination='+destination+'&start_lat='+userLocation[0]+'&start_lon='+userLocation[1]);
        if (!response.ok) throw new Error('Failed to fetch initial data');
        const data = await response.json();
        console.log("Fetched data:", data); // optional: handle data as needed
        for(var i=0;i<data.route.length;i++){
          let temp=[]
          temp.push(data.route[i][0])
          temp.push(data.route[i][1])
          listOfLists.push(temp)
        }
        
      } catch (error) {
        console.error("API fetch error:", error);
        alert(error)
      }
    };
    fetchInitialData();
    if (!mapInstanceRef.current || !userLocation || !destination) return;
    setIsLoading(true);
    var vari=[[37.8044256, -122.2711217],
    [37.8043196, -122.2711889],
    [37.8042334, -122.2712434],
    [37.8036339, -122.2716226],
    [37.8035573, -122.2716703],
    [37.8030321, -122.2720032],
    [37.8029476, -122.2720567],
    [37.8028669, -122.2721061],
    [37.8023492, -122.2724334],
    [37.8022601, -122.2724916],
    [37.8021942, -122.2725786],
    [37.8018607, -122.2727914],
    [37.8016762, -122.272906],
    [37.8015838, -122.2729634],
    [37.8015032, -122.2730135],
    [37.8008973, -122.2733905],
    [37.8002171, -122.2738351],
    [37.7995337, -122.2742622],
    [37.7989205, -122.2746495],
    [37.7988219, -122.2747118],
    [37.7987541, -122.2747536],
    [37.7981615, -122.2751239],
    [37.7981188, -122.2750181],
    [37.7980191, -122.2748041],
    [37.7978175, -122.2744054],
    [37.797778, -122.2744282],
    [37.7976172, -122.2740284],
    [37.7974934, -122.2740897],
    [37.797206, -122.2742645],
    [37.7970987, -122.2743464],
    [37.7970108, -122.274392],
    [37.7968862, -122.274332],
    [37.7962734, -122.274712],
    [37.7955823, -122.2751414]];
    console.log(vari === listOfLists)
    console.log(vari)
    console.log(listOfLists)
    const simulatedRoute: L.LatLngExpression[] = [[37.8044256, -122.2711217],
    [37.8043196, -122.2711889],
    [37.8042334, -122.2712434],
    [37.8036339, -122.2716226],
    [37.8035573, -122.2716703],
    [37.8030321, -122.2720032],
    [37.8029476, -122.2720567],
    [37.8028669, -122.2721061],
    [37.8023492, -122.2724334],
    [37.8022601, -122.2724916],
    [37.8021942, -122.2725786],
    [37.8018607, -122.2727914],
    [37.8016762, -122.272906],
    [37.8015838, -122.2729634],
    [37.8015032, -122.2730135],
    [37.8008973, -122.2733905],
    [37.8002171, -122.2738351],
    [37.7995337, -122.2742622],
    [37.7989205, -122.2746495],
    [37.7988219, -122.2747118],
    [37.7987541, -122.2747536],
    [37.7981615, -122.2751239],
    [37.7981188, -122.2750181],
    [37.7980191, -122.2748041],
    [37.7978175, -122.2744054],
    [37.797778, -122.2744282],
    [37.7976172, -122.2740284],
    [37.7974934, -122.2740897],
    [37.797206, -122.2742645],
    [37.7970987, -122.2743464],
    [37.7970108, -122.274392],
    [37.7968862, -122.274332],
    [37.7962734, -122.274712],
    [37.7955823, -122.2751414]]
  
    const routeLine = L.polyline(simulatedRoute, {
      color: '#33C3F0',
      weight: 5,
      opacity: 0.8
    }).addTo(mapInstanceRef.current);
  
    mapInstanceRef.current.fitBounds(routeLine.getBounds(), {
      padding: [100, 100]
    });
  
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

    return <div ref={mapRef} className="w-full h-full rounded-lg" />;
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
      
      {renderMap()}
      
      {!showHeatmap && !mapError && mapInstanceRef.current && (
        <DestinationInput
          destination={destination}
          setDestination={setDestination}
          onCalculateRoute={calculateRoute}
          isLoading={isLoading}
        />
      )}

      {mapInstanceRef.current && userLocation && (
        <MapMarker
          position={userLocation}
          map={mapInstanceRef.current}
          isUser={true}
          popup="Your Location"
        />
      )}

      {showHeatmap && mapInstanceRef.current && userLocation && (
        <HeatmapLayer
          centerCoords={userLocation}
          map={mapInstanceRef.current}
        />
      )}
    </div>
  );
};

export default LeafletMap;
