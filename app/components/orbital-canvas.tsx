"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Orbital background — Three.js WebGL canvas.
 *
 * Design principles:
 *  • Orbital rings: thin platinum LineLoop (BufferGeometry, ~60 segments each)
 *  • Planet nodes:  SphereGeometry(r, 8, 6) — minimal polygon count
 *  • No textures, no lights — MeshBasicMaterial only (GPU-cheap)
 *  • PixelRatio capped at 1.5 so retina doesn't thrash
 *  • Mobile: halves orbit count and skips one planet each ring
 *  • All disposals on unmount to prevent memory leaks
 */

const PLATINUM = 0xe2e8f0;
const EMERALD = 0x10b981;
const EMERALD_BRIGHT = 0x34d399;

type OrbitDef = {
  radius: number;
  speed: number;   // rad/s
  tiltX: number;   // ring inclination (X-axis rotation)
  tiltY: number;   // ring inclination (Y-axis rotation)
  planets: number; // nodes on this orbit
  nodeR: number;   // planet sphere radius
  ringAlpha: number;
};

const ORBIT_DEFS: OrbitDef[] = [
  { radius: 2.4, speed: 0.30, tiltX: 0.18, tiltY: 0.05, planets: 1, nodeR: 0.11, ringAlpha: 0.20 },
  { radius: 4.2, speed: 0.18, tiltX: 0.32, tiltY: 0.12, planets: 2, nodeR: 0.09, ringAlpha: 0.16 },
  { radius: 6.2, speed: 0.10, tiltX: 0.52, tiltY: 0.22, planets: 2, nodeR: 0.08, ringAlpha: 0.13 },
  { radius: 8.6, speed: 0.055, tiltX: 0.20, tiltY: 0.40, planets: 3, nodeR: 0.07, ringAlpha: 0.10 },
];

function buildRing(radius: number, segments: number, alpha: number): THREE.LineLoop {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color: PLATINUM, transparent: true, opacity: alpha });
  return new THREE.LineLoop(geo, mat);
}

export function OrbitalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    /* ── Scene / Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(0, 7.5, 17);
    camera.lookAt(0, 0, 0);

    /* ── Central node (the "sun") ── */
    const sunGeo = new THREE.SphereGeometry(0.28, 12, 10);
    const sunMat = new THREE.MeshBasicMaterial({ color: EMERALD_BRIGHT });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    /* ── Orbits and their planet nodes ── */
    type LiveOrbit = {
      ring: THREE.LineLoop;
      tiltX: number;
      tiltY: number;
      planets: Array<{ mesh: THREE.Mesh; phaseOffset: number }>;
      radius: number;
      speed: number;
    };

    const liveOrbits: LiveOrbit[] = [];

    /** On mobile, skip the outermost two rings for performance */
    const defs = isMobile ? ORBIT_DEFS.slice(0, 2) : ORBIT_DEFS;
    const ringSegments = isMobile ? 48 : 64;

    defs.forEach((def) => {
      /* Ring */
      const ring = buildRing(def.radius, ringSegments, def.ringAlpha);
      ring.rotation.x = def.tiltX;
      ring.rotation.y = def.tiltY;
      scene.add(ring);

      /* Planet nodes */
      const planetCount = isMobile ? Math.max(1, def.planets - 1) : def.planets;
      const planets: LiveOrbit["planets"] = [];
      const nodeGeo = new THREE.SphereGeometry(def.nodeR, 8, 6);

      for (let p = 0; p < planetCount; p++) {
        const nodeMat = new THREE.MeshBasicMaterial({
          color: EMERALD,
          transparent: true,
          opacity: 0.75,
        });
        const mesh = new THREE.Mesh(nodeGeo, nodeMat);
        scene.add(mesh);
        planets.push({ mesh, phaseOffset: (p / planetCount) * Math.PI * 2 });
      }

      liveOrbits.push({
        ring,
        tiltX: def.tiltX,
        tiltY: def.tiltY,
        planets,
        radius: def.radius,
        speed: def.speed,
      });
    });

    /* ── Animation loop ── */
    let frameId: number;
    let lastTs = performance.now();
    let elapsed = 0;

    function tick() {
      frameId = requestAnimationFrame(tick);

      const now = performance.now();
      /** Cap delta at 100 ms so a tab-switch doesn't cause a jump */
      const delta = Math.min((now - lastTs) / 1000, 0.1);
      lastTs = now;
      elapsed += delta;

      /* Slow global drift — almost imperceptible on its own */
      scene.rotation.y = elapsed * 0.014;

      liveOrbits.forEach((orbit) => {
        /* Planets orbit in the ring's inclined plane using a 2-D rotation
           projected onto the tilted axes (no extra pivot objects needed). */
        const cosX = Math.cos(orbit.tiltX);
        const sinX = Math.sin(orbit.tiltX);
        const cosY = Math.cos(orbit.tiltY + scene.rotation.y);
        const sinY = Math.sin(orbit.tiltY + scene.rotation.y);

        orbit.planets.forEach(({ mesh, phaseOffset }) => {
          const angle = elapsed * orbit.speed + phaseOffset;
          const cx = Math.cos(angle) * orbit.radius;
          const cz = Math.sin(angle) * orbit.radius;
          /* Apply tilt: X rotation first, then Y */
          mesh.position.x = cx * cosY - cz * sinX * sinY;
          mesh.position.y = cz * cosX;
          mesh.position.z = cx * sinY + cz * sinX * cosY;
        });
      });

      renderer.render(scene, camera);
    }

    tick();

    /* ── Resize handler (debounced) ── */
    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 120);
    }
    window.addEventListener("resize", onResize, { passive: true });

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);

      sunGeo.dispose();
      sunMat.dispose();

      liveOrbits.forEach((orbit) => {
        orbit.ring.geometry.dispose();
        (orbit.ring.material as THREE.Material).dispose();
        orbit.planets.forEach(({ mesh }) => {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        });
      });

      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 2 }}
    />
  );
}
