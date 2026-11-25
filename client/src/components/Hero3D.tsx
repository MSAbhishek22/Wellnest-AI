// Hero3D — WellNest AI's first-load 3D signature: a wellness garden.
// A soft flower that opens and closes with a slow breathing rhythm, leaves
// drifting around it — calm, senior-friendly motion, nothing flashing.
// Three.js r160 UMD via jsDelivr, loaded on demand. Auto-starts on mount;
// if the CDN is unreachable this renders nothing and the page is unchanged.
// Drag to spin. Pauses on prefers-reduced-motion or a hidden tab.
import { useEffect, useRef, type CSSProperties } from 'react';

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

function loadThree(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const w = window as any;
  if (w.THREE) return Promise.resolve(w.THREE);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = THREE_CDN;
    s.onload = () => resolve((window as any).THREE || null);
    s.onerror = () => resolve(null); // guarded no-op
    document.head.appendChild(s);
  });
}

function buildScene(THREE: any) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 100);
  camera.position.set(0, 3.0, 9.0);
  camera.lookAt(0, 1.5, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.1);
  sun.position.set(5, 8, 6);
  scene.add(sun);
  const warmWash = new THREE.PointLight(0xc084fc, 0.9, 14);
  warmWash.position.set(0, 3, 2);
  scene.add(warmWash);

  const rig = new THREE.Group();
  scene.add(rig);

  // Flower: stem, leaves, breathing petals around a warm centre
  const flower = new THREE.Group();
  flower.position.y = -0.4;
  rig.add(flower);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.12, 2.6, 10),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
  );
  stem.position.y = 1.3;
  flower.add(stem);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });
  [-1, 1].forEach((side) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), leafMat);
    leaf.scale.set(1.4, 0.35, 0.7);
    leaf.position.set(side * 0.75, 1.1, 0);
    leaf.rotation.z = side * 0.6;
    flower.add(leaf);
  });

  const head = new THREE.Group();
  head.position.y = 2.9;
  flower.add(head);

  const centre = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.45, roughness: 0.4 })
  );
  centre.scale.y = 0.6;
  head.add(centre);

  const petals: any[] = [];
  const petalColors = [0xf9a8d4, 0xc4b5fd, 0xf9a8d4, 0xfda4af, 0xc4b5fd, 0xf9a8d4, 0xfda4af, 0xc4b5fd];
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: petalColors[i], roughness: 0.5 })
    );
    petal.scale.set(1.15, 0.28, 0.55);
    const a = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.85, 0, Math.sin(a) * 0.85);
    petal.rotation.y = -a;
    petal.userData = { angle: a };
    head.add(petal);
    petals.push(petal);
  }

  // Drifting leaves
  const drifters: any[] = [];
  const driftGeo = new THREE.SphereGeometry(0.22, 12, 12);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(
      driftGeo,
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x86efac : 0xbbf7d0, roughness: 0.7 })
    );
    leaf.scale.set(1.6, 0.3, 0.8);
    const a = (i / 7) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * (2.6 + (i % 3) * 0.5), 0.6 + (i % 4) * 0.9, Math.sin(a) * (2.6 + (i % 3) * 0.5));
    leaf.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
    leaf.userData = { phase: i * 1.1, baseY: leaf.position.y, spin: 0.1 + (i % 3) * 0.06 };
    rig.add(leaf);
    drifters.push(leaf);
  }

  // Soft floating light dots
  const dotCount = 40;
  const dotPos = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    dotPos[i * 3] = -4 + Math.random() * 8;
    dotPos[i * 3 + 1] = Math.random() * 4.5;
    dotPos[i * 3 + 2] = -2 + Math.random() * 4;
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.09, transparent: true, opacity: 0.75 }));
  rig.add(dots);

  function tick(t: number) {
    // Slow breathing: petals open and close, head sways gently
    const breath = 1 + Math.sin(t * 0.7) * 0.08;
    petals.forEach((p: any) => {
      p.scale.set(1.15 * breath, 0.28, 0.55 * breath);
      p.position.x = Math.cos(p.userData.angle) * 0.85 * breath;
      p.position.z = Math.sin(p.userData.angle) * 0.85 * breath;
    });
    head.rotation.y = Math.sin(t * 0.3) * 0.2;
    head.position.y = 2.9 + Math.sin(t * 0.7) * 0.06;
    drifters.forEach((d: any) => {
      d.position.y = d.userData.baseY + Math.sin(t * 0.6 + d.userData.phase) * 0.3;
      d.rotation.y += d.userData.spin * 0.016;
    });
    dots.rotation.y = t * 0.03;
  }
  return { scene, camera, rig, tick };
}

export default function Hero3D({ className = '', style, label = '3D wellness garden — drag to spin' }: { className?: string; style?: CSSProperties; label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let raf: number | null = null;
    let renderer: any = null;
    let disposeFns: Array<() => void> = [];
    let clock: any = null;

    loadThree().then((THREE: any) => {
      if (cancelled || !THREE || !canvasRef.current || !wrapRef.current) return;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
      } catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const { scene, camera, rig, tick } = buildScene(THREE);
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      clock = new THREE.Clock();

      let targetRotY = 0, rotY = 0, dragging = false, lastX = 0, lastY = 0, tiltX = 0, targetTilt = 0;
      const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        targetRotY += (e.clientX - lastX) * 0.008;
        targetTilt = Math.max(-0.2, Math.min(0.3, targetTilt + (e.clientY - lastY) * 0.004));
        lastX = e.clientX; lastY = e.clientY;
      };
      const onUp = () => { dragging = false; };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      (['pointerup', 'pointercancel', 'pointerleave'] as const).forEach((ev) => canvas.addEventListener(ev, onUp));

      const resize = () => {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
      if (ro) ro.observe(wrap);
      window.addEventListener('resize', resize);

      const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const frame = () => {
        raf = null;
        const t = clock.getElapsedTime();
        if (!reduced()) {
          rotY += (targetRotY - rotY) * 0.06;
          tiltX += (targetTilt - tiltX) * 0.06;
          rig.rotation.y = rotY + Math.sin(t * 0.08) * 0.05;
          rig.rotation.x = tiltX;
          tick(t);
          renderer.render(scene, camera);
          if (!document.hidden) raf = requestAnimationFrame(frame);
        } else {
          renderer.render(scene, camera); // one static frame
        }
      };
      const kick = () => { if (raf === null && !document.hidden) raf = requestAnimationFrame(frame); };
      const onVis = () => { if (!document.hidden) { clock.getDelta(); kick(); } };
      document.addEventListener('visibilitychange', onVis);
      kick();
      if (reduced()) renderer.render(scene, camera);

      disposeFns = [
        () => { if (raf !== null) cancelAnimationFrame(raf); },
        () => canvas.removeEventListener('pointerdown', onDown),
        () => canvas.removeEventListener('pointermove', onMove),
        () => (['pointerup', 'pointercancel', 'pointerleave'] as const).forEach((ev) => canvas.removeEventListener(ev, onUp)),
        () => { if (ro) ro.disconnect(); },
        () => window.removeEventListener('resize', resize),
        () => document.removeEventListener('visibilitychange', onVis),
        () => { try { renderer.dispose(); } catch (e) { /* noop */ } },
      ];
    });

    return () => {
      cancelled = true;
      disposeFns.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} style={style} aria-hidden="true">
      <canvas ref={canvasRef} aria-label={label} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'pan-y', cursor: 'grab' }} />
    </div>
  );
}
