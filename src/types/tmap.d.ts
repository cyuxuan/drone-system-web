declare namespace TMap {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  interface MapOptions {
    center: LatLng;
    zoom?: number;
    mapStyleId?: string;
    viewMode?: '2D' | '3D';
    pitch?: number;
    rotation?: number;
    showControl?: boolean;
    baseMap?: {
      type: 'vector' | 'satellite';
      features?: string[];
    };
  }

  class Map {
    constructor(container: HTMLElement | string, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(zoom: number): void;
    setMapStyleId(styleId: string): void;
    destroy(): void;
  }

  interface MarkerStyleOptions {
    width?: number;
    height?: number;
    anchor?: { x: number; y: number };
    src?: string;
  }

  class MarkerStyle {
    constructor(options: MarkerStyleOptions);
  }

  interface Geometry {
    id: string;
    styleId?: string;
    position?: LatLng;
    properties?: Record<string, string | number | boolean | null>;
  }

  interface MultiMarkerOptions {
    map: Map;
    styles?: Record<string, MarkerStyle>;
    geometries?: Geometry[];
  }

  class MultiMarker {
    constructor(options: MultiMarkerOptions);
    setGeometries(geometries: Geometry[]): void;
    on(event: string, callback: (evt: MapEvent) => void): void;
  }

  interface MapEvent {
    geometry: Geometry;
    latLng: LatLng;
    pixel: { x: number; y: number };
    type: string;
  }

  interface PolylineGeometry {
    id: string;
    styleId?: string;
    paths: LatLng[];
  }

  interface PolylineStyleOptions {
    color?: string;
    width?: number;
    borderWidth?: number;
    borderColor?: string;
    lineCap?: 'butt' | 'round' | 'square';
    showArrow?: boolean;
    arrowOptions?: {
      width?: number;
      height?: number;
      space?: number;
    };
  }

  class PolylineStyle {
    constructor(options: PolylineStyleOptions);
  }

  interface MultiPolylineOptions {
    map: Map;
    styles?: Record<string, PolylineStyle>;
  }

  class MultiPolyline {
    constructor(options: MultiPolylineOptions);
    setGeometries(geometries: PolylineGeometry[]): void;
  }
}

interface Window {
  TMap: typeof TMap;
}
