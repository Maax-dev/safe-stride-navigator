
import React, { useState, useEffect, useRef } from 'react';
import LeafletMap from './LeafletMap';
import ViewToggle from './map/ViewToggle';

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ showHeatmap: initialShowHeatmap }) => {
  const [showHeatmap, setShowHeatmap] = useState(initialShowHeatmap !== undefined ? initialShowHeatmap : false);
  const mapMountedRef = useRef(false);
  
  useEffect(() => {
    if (initialShowHeatmap !== undefined) {
      setShowHeatmap(initialShowHeatmap);
    }
    
    // Mark component as mounted
    mapMountedRef.current = true;
    
    // Dispatch resize event when component mounts to ensure proper dimensions
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    
    return () => {
      clearTimeout(timer);
      mapMountedRef.current = false;
    };
  }, [initialShowHeatmap]);

  return (
    <div className="relative w-full h-full flex flex-col bg-background" style={{ minHeight: "600px", height: "calc(100vh - 200px)" }}>
      <LeafletMap showHeatmap={showHeatmap} isMounted={mapMountedRef.current} />
      <ViewToggle showHeatmap={showHeatmap} onToggle={setShowHeatmap} />
    </div>
  );
};

export default MapView;
