
import React from 'react';
import LeafletMap from './LeafletMap';

interface MapViewProps {
  showHeatmap?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ showHeatmap = false }) => {
  return <LeafletMap showHeatmap={showHeatmap} />;
};

export default MapView;
