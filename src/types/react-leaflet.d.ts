
declare module 'react-leaflet' {
  import * as L from 'leaflet';
  import React from 'react';

  export interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    center: L.LatLngExpression;
    zoom?: number;
    style?: React.CSSProperties;
    className?: string;
    zoomControl?: boolean;
    // Remove the ref property that's causing issues
  }

  export class MapContainer extends React.Component<MapContainerProps> {}
  
  export interface TileLayerProps {
    url: string;
    attribution?: string;
  }
  
  export class TileLayer extends React.Component<TileLayerProps> {}
  
  export interface MarkerProps {
    position: L.LatLngExpression;
    icon?: L.Icon | L.DivIcon;
    // Allow children in Marker component
    children?: React.ReactNode;
  }
  
  export class Marker extends React.Component<MarkerProps> {}
  
  export interface PopupProps {
    children: React.ReactNode;
  }
  
  export class Popup extends React.Component<PopupProps> {}
  
  export function useMap(): L.Map;
}
