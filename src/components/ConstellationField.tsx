import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interactive 3D constellation: drifting nodes joined by proximity lines,
 * slowly rotating, tilting toward the pointer. Renders only while on screen.
 */
export default function ConstellationField({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const N = 110;
    const LINK_DIST = 2.3;
    const BOX = new THREE.Vector3(9, 6, 5);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    wrap.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const nodes = Array.from({ length: N }, () => ({
      p: new THREE.Vector3(
        (Math.random() - 0.5) * BOX.x,
        (Math.random() - 0.5) * BOX.y,
        (Math.random() - 0.5) * BOX.z
      ),
      v: new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008,
        (Math.random() - 0.5) * 0.008
      ),
    }));

    const pointPositions = new Float32Array(N * 3);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.075,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(pGeo, pMat));

    // Worst-case pair capacity; rebuilt every frame with the live link count.
    const MAX_LINKS = 1600;
    const linePositions = new Float32Array(MAX_LINKS * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: '#a78bfa',
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(lGeo, lMat));

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
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
    const pAttr = pGeo.getAttribute('position') as THREE.BufferAttribute;
    const lAttr = lGeo.getAttribute('position') as THREE.BufferAttribute;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        if (!reduced) {
          n.p.add(n.v);
          for (const axis of ['x', 'y', 'z'] as const) {
            if (Math.abs(n.p[axis]) > BOX[axis] / 2) n.v[axis] *= -1;
          }
        }
        pointPositions[i * 3] = n.p.x;
        pointPositions[i * 3 + 1] = n.p.y;
        pointPositions[i * 3 + 2] = n.p.z;
      }
      pAttr.needsUpdate = true;

      let li = 0;
      for (let a = 0; a < N && li < MAX_LINKS; a++) {
        for (let b = a + 1; b < N && li < MAX_LINKS; b++) {
          if (nodes[a].p.distanceToSquared(nodes[b].p) < LINK_DIST * LINK_DIST) {
            linePositions.set([...nodes[a].p.toArray(), ...nodes[b].p.toArray()], li * 6);
            li++;
          }
        }
      }
      lGeo.setDrawRange(0, li * 2);
      lAttr.needsUpdate = true;

      if (!reduced) group.rotation.y += 0.0012;
      group.rotation.x += (pointer.y * 0.18 - group.rotation.x) * 0.03;
      group.rotation.z += (pointer.x * 0.08 - group.rotation.z) * 0.03;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      io.disconnect();
      pGeo.dispose();
      pMat.dispose();
      lGeo.dispose();
      lMat.dispose();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={wrapRef} className={`absolute inset-0 overflow-hidden bg-black ${className}`} />;
}
