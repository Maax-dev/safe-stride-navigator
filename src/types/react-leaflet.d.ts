
declare module 'react-leaflet' {
  import * as L from 'leaflet';
  import React from 'react';

  export interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    center: L.LatLngExpression;
    zoom?: number;
    style?: React.CSSProperties;
    className?: string;
    zoomControl?: boolean;
    ref?: React.Ref<L.Map>;
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
  }
  
  export class Marker extends React.Component<MarkerProps> {}
  
  export interface PopupProps {
    children: React.ReactNode;
  }
  
  export class Popup extends React.Component<PopupProps> {}
  
  export function useMap(): L.Map;
}
