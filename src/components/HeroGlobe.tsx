import { useEffect, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';

// Prabhava Labs' point of origin — Colombo, Sri Lanka.
const ORIGIN = { lat: 6.9271, lng: 79.8612 };

// Ambient traffic so the globe feels alive before/without geolocation.
const CITIES: [number, number][] = [
  [37.7749, -122.4194], // San Francisco
  [40.7128, -74.006], // New York
  [51.5074, -0.1278], // London
  [52.52, 13.405], // Berlin
  [35.6762, 139.6503], // Tokyo
  [1.3521, 103.8198], // Singapore
  [-33.8688, 151.2093], // Sydney
  [19.076, 72.8777], // Mumbai
  [55.7558, 37.6173], // Moscow
  [-23.5505, -46.6333], // São Paulo
];

type Arc = { startLat: number; startLng: number; endLat: number; endLng: number; isVisitor?: boolean };

export default function HeroGlobe({
  onLocated,
}: {
  onLocated?: (place: string) => void;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [countries, setCountries] = useState<{ features: object[] }>({ features: [] });
  const [arcs, setArcs] = useState<Arc[]>(
    CITIES.map(([lat, lng]) => ({ startLat: lat, startLng: lng, endLat: ORIGIN.lat, endLng: ORIGIN.lng }))
  );

  // Track container size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Land dots.
  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => r.json())
      .then(setCountries)
      .catch(() => {});
  }, []);

  // Arc from the visitor's location to the origin.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('https://ipwho.is/', { signal: ctrl.signal })
      .then((r) => r.json())
      .then((geo) => {
        if (!geo?.success || typeof geo.latitude !== 'number') return;
        setArcs((prev) => [
          ...prev,
          { startLat: geo.latitude, startLng: geo.longitude, endLat: ORIGIN.lat, endLng: ORIGIN.lng, isVisitor: true },
        ]);
        const place = [geo.city, geo.country].filter(Boolean).join(', ');
        if (place) onLocated?.(place);
        // Face the visitor's part of the world.
        globeRef.current?.pointOfView({ lat: (geo.latitude + ORIGIN.lat) / 2, lng: (geo.longitude + ORIGIN.lng) / 2, altitude: 2.1 }, 1600);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [onLocated]);

  const onReady = () => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false;
    controls.enablePan = false;
    globe.pointOfView({ lat: 12, lng: 60, altitude: 2.1 }, 0);
  };

  const globeMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#0a0a14'),
    transparent: true,
    opacity: 0.95,
    shininess: 8,
  });

  return (
    <div ref={wrapRef} className="h-full w-full cursor-grab active:cursor-grabbing">
      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showGraticules={false}
          atmosphereColor="#7c6fd4"
          atmosphereAltitude={0.16}
          hexPolygonsData={countries.features}
          hexPolygonResolution={3}
          hexPolygonMargin={0.72}
          hexPolygonAltitude={0.006}
          hexPolygonColor={() => 'rgba(255,255,255,0.62)'}
          arcsData={arcs}
          arcColor={(a: object) =>
            (a as Arc).isVisitor
              ? ['rgba(255,255,255,0.95)', 'rgba(167,139,250,1)']
              : ['rgba(167,139,250,0.35)', 'rgba(255,255,255,0.5)']
          }
          arcStroke={(a: object) => ((a as Arc).isVisitor ? 0.9 : 0.42)}
          arcAltitudeAutoScale={0.42}
          arcDashLength={0.45}
          arcDashGap={1.6}
          arcDashAnimateTime={(a: object) => ((a as Arc).isVisitor ? 2100 : 3400)}
          ringsData={[ORIGIN]}
          ringColor={() => (t: number) => `rgba(167,139,250,${Math.max(0, 0.7 * (1 - t))})`}
          ringMaxRadius={4.5}
          ringPropagationSpeed={1.6}
          ringRepeatPeriod={1400}
          onGlobeReady={onReady}
          rendererConfig={{ antialias: true, alpha: true }}
        />
      )}
    </div>
  );
}
