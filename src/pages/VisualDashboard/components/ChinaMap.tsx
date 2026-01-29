import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Html, useCursor } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as d3 from 'd3-geo';

export interface GeoFeature {
  type: string;
  properties: {
    name: string;
    adcode: string;
    centroid?: [number, number];
    center?: [number, number];
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: [number, number][][] | [number, number][][][];
  };
}

export interface ChinaMapProps {
  selectedProvince: GeoFeature | null;
  onProvinceClick: (province: GeoFeature) => void;
}

interface GeoData {
  features: GeoFeature[];
}

const ChinaMap: React.FC<ChinaMapProps> = ({ selectedProvince, onProvinceClick }) => {
  const [geoData, setGeoData] = useState<GeoData | null>(null);

  // Projection settings
  // Projection settings - adjust based on selected province for centering
  const projection = useMemo(() => {
    if (selectedProvince) {
      // Province view: Center on province and increase scale
      const center = (selectedProvince.properties.centroid ||
        selectedProvince.properties.center || [104, 37.5]) as [number, number];
      return d3.geoMercator().center(center).scale(350).translate([0, 0]);
    }
    // National view: Balanced scale and center to fit perfectly in the view
    return d3.geoMercator().center([104, 36.5]).scale(80).translate([0, 0]);
  }, [selectedProvince]);

  // Fetch GeoJSON with caching
  useEffect(() => {
    const adcode = selectedProvince ? selectedProvince.properties.adcode : '100000';
    const cacheKey = `geojson_${adcode}`;
    const cachedData = localStorage.getItem(cacheKey);

    console.log(`Fetching map data for adcode: ${adcode}`);

    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        console.log('Using cached map data');
        // Wrap in Promise to avoid synchronous setState warning
        Promise.resolve().then(() => setGeoData(data));
        return;
      } catch (e) {
        console.error('Failed to parse cached data:', e);
        localStorage.removeItem(cacheKey);
      }
    }

    const url = selectedProvince
      ? `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
      : 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Map data fetched successfully:', data.features?.length, 'features');
        setGeoData(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      })
      .catch((err) => {
        console.error('Failed to load map data from Aliyun:', err);
        // If Aliyun fails, we might want to provide a fallback or at least more info
      });
  }, [selectedProvince]);

  // Mock data for orders
  const provinceData = useMemo(() => {
    if (!geoData) return {};
    const data: Record<string, { orders: number; drones: number; efficiency: string }> = {};
    // Use adcode as seed for "random" but stable data
    geoData.features.forEach((f) => {
      const seed = parseInt(f.properties.adcode || '100000', 10);
      data[f.properties.name] = {
        orders: Math.floor(seed % 5000) + 500,
        drones: Math.floor(seed % 200) + 20,
        efficiency: (80 + (seed % 200) / 10).toFixed(1),
      };
    });
    return data;
  }, [geoData]);

  if (!geoData) return null;

  return (
    <group>
      {geoData.features.map((feature, index) => {
        const data = provinceData[feature.properties.name];

        return (
          <ProvinceMesh
            key={feature.properties.adcode || index}
            feature={feature}
            projection={projection}
            onHover={() => {}}
            onHoverOut={() => {}}
            onClick={() => onProvinceClick(feature)}
            data={data}
          />
        );
      })}

      {/* Fly Lines (Flow Lines) */}
      {!selectedProvince && <FlowLines projection={projection} features={geoData.features} />}
    </group>
  );
};

interface ProvinceMeshProps {
  feature: GeoFeature;
  projection: d3.GeoProjection;
  onHover: () => void;
  onHoverOut: () => void;
  onClick: () => void;
  data: { orders: number; drones: number; efficiency: string };
}

const ProvinceMesh = ({
  feature,
  projection,
  onHover,
  onHoverOut,
  onClick,
  data,
}: ProvinceMeshProps) => {
  const [hover, setHover] = useState(false);
  const { invalidate } = useThree();
  useCursor(hover);
  const depth = 1.5;

  const shapes = useMemo(() => {
    const { geometry } = feature;
    const shapesList: THREE.Shape[] = [];

    const processCoordinates = (coords: [number, number][]) => {
      const shape = new THREE.Shape();
      coords.forEach((point: [number, number], i: number) => {
        const [x, y] = (projection(point) as [number, number]) || [0, 0];
        if (i === 0) shape.moveTo(x, -y);
        else shape.lineTo(x, -y);
      });
      return shape;
    };

    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates as [number, number][][];
      shapesList.push(processCoordinates(coords[0]));
    } else if (geometry.type === 'MultiPolygon') {
      const coords = geometry.coordinates as [number, number][][][];
      coords.forEach((polygon) => {
        shapesList.push(processCoordinates(polygon[0]));
      });
    }
    return shapesList;
  }, [feature, projection]);

  const extrudeSettings = useMemo(
    () => ({
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    }),
    [depth],
  );

  const center = useMemo(() => {
    const coords = (feature.properties.centroid || feature.properties.center || [104, 37.5]) as [
      number,
      number,
    ];
    const projected = projection(coords);
    const [x, y] = projected || [0, 0];
    // Offset Y slightly to make it look better in 3D
    return [x, -y, depth + 0.2];
  }, [feature, projection, depth]);

  return (
    <group
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHover(true);
        onHover();
        invalidate(); // Manual re-render
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHover(false);
        onHoverOut();
        invalidate(); // Manual re-render
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        invalidate(); // Manual re-render
      }}
    >
      {shapes.map((shape, i) => (
        <mesh key={i} scale={[1, 1, hover ? 1.05 : 1]}>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial
            color={hover ? '#14b8a6' : '#0f172a'}
            emissive={hover ? '#14b8a6' : '#000000'}
            emissiveIntensity={hover ? 0.5 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Border Lines with Multi-layered Glow */}
      {shapes.map((shape, i) => (
        <group key={`line-group-${i}`} position={[0, 0, depth + 0.05]} raycast={() => null}>
          {/* Bottom highlight line */}
          <primitive
            object={
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(shape.getPoints()),
                new THREE.LineBasicMaterial({
                  color: '#2dd4bf',
                  transparent: true,
                  opacity: 0.1,
                }),
              )
            }
            position={[0, 0, -depth]}
            raycast={() => null}
          />
          {/* Main Top Line */}
          <primitive
            object={
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(shape.getPoints()),
                new THREE.LineBasicMaterial({
                  color: hover ? '#5eead4' : '#1e3a8a',
                  transparent: true,
                  opacity: hover ? 1 : 0.8,
                }),
              )
            }
            raycast={() => null}
          />
          {/* Subtle Outer Glow (Constant) */}
          <primitive
            object={
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(shape.getPoints()),
                new THREE.LineBasicMaterial({
                  color: '#2dd4bf',
                  transparent: true,
                  opacity: 0.3,
                }),
              )
            }
            scale={[1.002, 1.002, 1]}
            raycast={() => null}
          />
          {/* Interactive Bright Glow */}
          {hover && (
            <primitive
              object={
                new THREE.Line(
                  new THREE.BufferGeometry().setFromPoints(shape.getPoints()),
                  new THREE.LineBasicMaterial({
                    color: '#5eead4',
                    transparent: true,
                    opacity: 0.4,
                  }),
                )
              }
              scale={[1.01, 1.01, 1]}
              raycast={() => null}
            />
          )}
        </group>
      ))}

      {/* Labels and Data */}
      {data && (
        <group position={[center[0], center[1], center[2]]}>
          <Text
            position={[0, 0, 0.5]}
            fontSize={0.4}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            raycast={() => null}
          >
            {feature.properties.name}
          </Text>
          <Text
            position={[0, -0.6, 0.5]}
            fontSize={0.3}
            color="#2dd4bf"
            anchorX="center"
            anchorY="middle"
            raycast={() => null}
          >
            {data.orders}
          </Text>

          {/* Hover Tooltip using Html */}
          {hover && (
            <Html distanceFactor={15} pointerEvents="none" style={{ pointerEvents: 'none' }}>
              <div className="glass-hud border-brand-500/30 pointer-events-none min-w-[180px] rounded-2xl border p-4 whitespace-nowrap select-none">
                <p className="text-brand-500 mb-2 text-[10px] font-black tracking-widest uppercase">
                  {feature.properties.name}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">实时约机</span>
                    <span className="text-[10px] font-black text-white">{data.orders} 单</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      在线无人机
                    </span>
                    <span className="text-[10px] font-black text-white">{data.drones} 台</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">调度效率</span>
                    <span className="text-[10px] font-black text-emerald-500">
                      {data.efficiency}%
                    </span>
                  </div>
                </div>
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
};

const FlowLines = ({
  projection,
  features,
}: {
  projection: d3.GeoProjection;
  features: GeoFeature[];
}) => {
  const lineRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.getElapsedTime();
      const s = 1 + Math.sin(time * 0.5) * 0.05;
      lineRef.current.scale.set(s, s, s);
      lineRef.current.position.z = 2 + Math.sin(time * 0.5) * 0.5;
      state.invalidate();
    }
  });

  const lines = useMemo(() => {
    const results: THREE.QuadraticBezierCurve3[] = [];
    const beijing = projection([116.4, 39.9]) || [0, 0];

    // Create lines from major cities to others
    const targets = features.slice(0, 8).map((f) => {
      const centerPos = (f.properties.centroid || f.properties.center || [104, 37.5]) as [
        number,
        number,
      ];
      const center = projection(centerPos) || [0, 0];
      return [center[0], -center[1]];
    });

    for (let i = 0; i < targets.length; i++) {
      const start = [beijing[0], -beijing[1], 2];
      const end = [targets[i][0], targets[i][1], 2];

      // Create a quadratic bezier curve for the arc
      const mid = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        8, // Arc height
      ];

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(start[0], start[1], start[2]),
        new THREE.Vector3(mid[0], mid[1], mid[2]),
        new THREE.Vector3(end[0], end[1], end[2]),
      );

      results.push(curve);
    }
    return results;
  }, [projection, features]);

  return (
    <group ref={lineRef}>
      {lines.map((curve, i) => (
        <group key={i}>
          {/* Main Line with Gradient-like effect via opacity */}
          <mesh>
            <tubeGeometry args={[curve, 20, 0.04, 8, false]} />
            <meshBasicMaterial color="#2dd4bf" transparent opacity={0.4} />
          </mesh>
          {/* Glow Line */}
          <mesh>
            <tubeGeometry args={[curve, 20, 0.1, 8, false]} />
            <meshBasicMaterial color="#14b8a6" transparent opacity={0.15} />
          </mesh>
          {/* Animated Point */}
          <FlowPoint curve={curve} />
        </group>
      ))}
    </group>
  );
};

const FlowPoint = ({ curve }: { curve: THREE.QuadraticBezierCurve3 }) => {
  const pointRef = useRef<THREE.Mesh>(null);
  const offset = useRef(0);

  useEffect(() => {
    offset.current = Math.random();
  }, []);

  useFrame((state) => {
    if (pointRef.current) {
      const time = state.clock.getElapsedTime() * 0.2 + offset.current;
      const t = time % 1;
      const point = curve.getPoint(t);
      pointRef.current.position.copy(point);
      state.invalidate();
    }
  });

  return (
    <mesh ref={pointRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshBasicMaterial color="#fff" />
      <pointLight color="#5eead4" intensity={2} distance={2} />
    </mesh>
  );
};

export default ChinaMap;
