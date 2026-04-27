/** Static cosmic layers (no client JS). */
export function CosmicBackground() {
  return (
    <>
      <div className="cosmic-starfield" aria-hidden />
      <div className="cosmic-glow-orb" aria-hidden />
      <div className="cosmic-horizon" aria-hidden />
    </>
  );
}
