"use client";

/**
 * Small wireframe “global node” — infinite reach, corner accent.
 */
export function GlobalNode() {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[35] hidden sm:block"
      aria-hidden
    >
      <div
        className="relative h-14 w-14 opacity-90"
        style={{
          perspective: "180px",
          animation: "cosmic-node-spin 48s linear infinite",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full text-cyan-400/90 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.9"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="9"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.75"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="9"
            ry="22"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.75"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="15"
            stroke="currentColor"
            strokeWidth="0.35"
            opacity="0.45"
            transform="rotate(52 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="15"
            stroke="currentColor"
            strokeWidth="0.35"
            opacity="0.45"
            transform="rotate(-38 32 32)"
          />
          <circle cx="32" cy="32" r="2.2" fill="currentColor" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}
