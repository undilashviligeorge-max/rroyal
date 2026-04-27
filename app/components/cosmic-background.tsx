type CosmicBackgroundProps = {
  /** When true, backdrop fills a positioned parent (e.g. language gate) instead of the viewport */
  nested?: boolean;
};

/** Cosmic layers: stars, soft orb, horizon — always above page bg, below UI (z-10+). */
export function CosmicBackground({ nested = false }: CosmicBackgroundProps) {
  const shell = nested
    ? "cosmic-backdrop-shell cosmic-backdrop-shell--nested"
    : "cosmic-backdrop-shell";

  return (
    <div className={shell} aria-hidden>
      <div className="cosmic-backdrop-fill">
        <div className="cosmic-starfield" />
        <div className="cosmic-glow-orb" />
        <div className="cosmic-horizon" />
      </div>
    </div>
  );
}
