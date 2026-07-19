import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * "Origin galaxy": a spiral of ~9k particles radiating from a bright core —
 * the ප්‍රභව (origin) idea as an object. Drag to rotate, pointer tilts it,
 * slow idle spin. Renders only while on screen.
 */
export default function OriginGalaxy({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const COUNT = 9000;
    const RADIUS = 4.6;
    const BRANCHES = 4;
    const SPIN = 1.15;
    const RANDOMNESS = 0.38;
    const RANDOM_POWER = 2.6;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 2.4, 5.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    wrap.appendChild(renderer.domElement);

    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const inner = new THREE.Color('#ffffff');
    const mid = new THREE.Color('#c4b5fd');
    const outer = new THREE.Color('#5b21b6');
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const r = Math.random() * RADIUS;
      const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spin = r * SPIN;
      const rand = () =>
        Math.pow(Math.random(), RANDOM_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r;
      positions[i * 3] = Math.cos(branch + spin) * r + rand();
      positions[i * 3 + 1] = rand() * 0.55;
      positions[i * 3 + 2] = Math.sin(branch + spin) * r + rand();

      const t = r / RADIUS;
      if (t < 0.35) tmp.lerpColors(inner, mid, t / 0.35);
      else tmp.lerpColors(mid, outer, (t - 0.35) / 0.65);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    // Soft circular sprite so points render as glows, not squares.
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.045,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    // Bright core.
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    const coreMat = new THREE.PointsMaterial({
      size: 0.7,
      map: sprite,
      color: '#ffffff',
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(coreGeo, coreMat));

    // Drag to rotate with inertia; pointer hover tilts.
    const state = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      velY: 0,
      rotX: 0.35,
      targetTiltX: 0.35,
      pointerX: 0,
    };

    const onDown = (e: PointerEvent) => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      wrap.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      state.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      if (!state.dragging) return;
      state.velY = (e.clientX - state.lastX) * 0.004;
      state.targetTiltX += (e.clientY - state.lastY) * 0.002;
      state.targetTiltX = Math.max(0.05, Math.min(0.9, state.targetTiltX));
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    };
    const onUp = () => {
      state.dragging = false;
    };
    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

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
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const idle = reduced ? 0 : 0.0016;
      galaxy.rotation.y += idle + state.velY;
      state.velY *= 0.94;

      state.rotX += (state.targetTiltX + state.pointerX * 0.04 - state.rotX) * 0.05;
      galaxy.rotation.x = state.rotX;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      ro.disconnect();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      sprite.dispose();
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 cursor-grab overflow-hidden bg-black active:cursor-grabbing ${className}`}
    />
  );
}
