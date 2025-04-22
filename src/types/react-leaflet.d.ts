
declare module 'react-leaflet' {
  import * as L from 'leaflet';
  import React from 'react';

  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    zoomControl?: boolean;
    ref?: React.Ref<L.Map>;
  }

  export const MapContainer: React.ComponentType<MapContainerProps>;
  export const TileLayer: React.ComponentType<any>;
  export const Marker: React.ComponentType<any>;
  export const Popup: React.ComponentType<any>;
}
