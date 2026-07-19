import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interactive particle-wave terrain: a grid of points rolling with layered
 * sine waves; the pointer pushes a soft ripple through the field and tilts
 * the camera. Renders only while on screen.
 */
export default function ParticleWave({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const COLS = 150;
    const ROWS = 70;
    const SPREAD_X = 30;
    const SPREAD_Y = 14;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 4.4, 10.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    wrap.appendChild(renderer.domElement);

    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const violet = new THREE.Color('#a78bfa');
    const white = new THREE.Color('#ffffff');
    const tmp = new THREE.Color();

    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        positions[i * 3] = (c / (COLS - 1) - 0.5) * SPREAD_X;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * SPREAD_Y;
        tmp.lerpColors(violet, white, Math.random() * 0.55 + (r / ROWS) * 0.3);
        colors[i * 3] = tmp.r;
        colors[i * 3 + 1] = tmp.g;
        colors[i * 3 + 2] = tmp.b;
        i++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geo, mat));

    const pointer = { x: 0, y: 0, wx: 0, wz: 0, strength: 0 };
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();

    const onPointer = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        pointer.wx = hit.x;
        pointer.wz = hit.z;
        pointer.strength = 1;
      }
    };
    window.addEventListener('pointermove', onPointer);

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);

    let raf = 0;
    let t = 0;
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      t += reduced ? 0 : 0.014;
      pointer.strength *= 0.965;

      let j = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = pos.array[j * 3] as number;
          const z = pos.array[j * 3 + 2] as number;
          let y =
            Math.sin(x * 0.55 + t) * 0.32 +
            Math.cos(z * 0.7 + t * 0.8) * 0.28 +
            Math.sin((x + z) * 0.32 + t * 1.4) * 0.18;
          const dx = x - pointer.wx;
          const dz = z - pointer.wz;
          const d2 = dx * dx + dz * dz;
          y += Math.exp(-d2 * 0.28) * 1.1 * pointer.strength;
          (pos.array as Float32Array)[j * 3 + 1] = y;
          j++;
        }
      }
      pos.needsUpdate = true;

      camera.position.x += (pointer.x * 1.1 - camera.position.x) * 0.04;
      camera.position.y += (4.4 + pointer.y * 0.7 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={wrapRef} className={`absolute inset-0 overflow-hidden bg-black ${className}`} />;
}
