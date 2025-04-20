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
  }, [initialShowHeatmap]);

  return (
    <div className="relative w-full h-full">
      <LeafletMap showHeatmap={showHeatmap} />
      <ViewToggle showHeatmap={showHeatmap} onToggle={setShowHeatmap} />
    </div>
  );
};

export default MapView;
