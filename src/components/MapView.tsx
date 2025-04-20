
import React, { useState } from 'react';
import LeafletMap from './LeafletMap';
import ViewToggle from './map/ViewToggle';

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="relative w-full h-full">
      <LeafletMap showHeatmap={showHeatmap} />
      <ViewToggle showHeatmap={showHeatmap} onToggle={setShowHeatmap} />
    </div>
  );
};

export default MapView;
