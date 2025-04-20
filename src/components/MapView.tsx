
import React, { useState, useEffect } from 'react';
import LeafletMap from './LeafletMap';
import ViewToggle from './map/ViewToggle';

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ showHeatmap: initialShowHeatmap }) => {
  const [showHeatmap, setShowHeatmap] = useState(initialShowHeatmap !== undefined ? initialShowHeatmap : false);
  
  useEffect(() => {
    if (initialShowHeatmap !== undefined) {
      setShowHeatmap(initialShowHeatmap);
    }
    
    // Dispatch resize event when component mounts to ensure proper dimensions
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [initialShowHeatmap]);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ minHeight: "600px", height: "calc(100vh - 200px)" }}>
      <LeafletMap showHeatmap={showHeatmap} />
      <ViewToggle showHeatmap={showHeatmap} onToggle={setShowHeatmap} />
    </div>
  );
};

export default MapView;
