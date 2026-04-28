import { Suspense, lazy } from "react";

/**
 * Lazy-load OrbitalCanvas so the Three.js bundle is code-split and never
 * blocks the initial HTML paint.  Suspense fallback = nothing visible (the
 * CSS layers below still appear immediately).
 */
const OrbitalCanvas = lazy(() =>
  import("./orbital-canvas").then((m) => ({ default: m.OrbitalCanvas }))
);

type CosmicBackgroundProps = {
  /** When true, backdrop fills a positioned parent (e.g. language gate) instead of the viewport */
  nested?: boolean;
};

/**
 * Background layers (back → front):
 *   1. CSS starfield        z-1   (very cheap, GPU-accelerated CSS transform)
 *   2. Three.js orbital     z-2   (lazy — doesn't block paint)
 *   3. Emerald horizon line z-2   (CSS, always visible)
 */
export function CosmicBackground({ nested = false }: CosmicBackgroundProps) {
  const shell = nested
    ? "cosmic-backdrop-shell cosmic-backdrop-shell--nested"
    : "cosmic-backdrop-shell";

  return (
    <>
      {/* CSS layer: starfield + horizon */}
      <div className={shell} aria-hidden>
        <div className="cosmic-backdrop-fill">
          <div className="cosmic-starfield" />
          <div className="cosmic-horizon" />
        </div>
      </div>

      {/* Three.js orbital layer — only on non-nested (full viewport) */}
      {!nested && (
        <Suspense fallback={null}>
          <OrbitalCanvas />
        </Suspense>
      )}
    </>
  );
}
