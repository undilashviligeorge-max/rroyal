"use client";

/**
 * Wireframe “global node” — visible cyan strokes, above page chrome.
 */
export function GlobalNode() {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6"
      aria-hidden
    >
      <div
        className="relative h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
        style={{
          perspective: "200px",
          animation: "cosmic-node-spin 42s linear infinite",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width="64"
          height="64"
          className="h-full w-full drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]"
          fill="none"
          aria-hidden
        >
          <circle
            cx="32"
            cy="32"
            r="22"
            stroke="#22d3ee"
            strokeWidth="1.1"
            opacity="0.95"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="9"
            stroke="#38bdf8"
            strokeWidth="0.9"
            opacity="0.9"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="9"
            ry="22"
            stroke="#38bdf8"
            strokeWidth="0.9"
            opacity="0.9"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="15"
            stroke="#67e8f9"
            strokeWidth="0.65"
            opacity="0.55"
            transform="rotate(52 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="15"
            stroke="#67e8f9"
            strokeWidth="0.65"
            opacity="0.55"
            transform="rotate(-38 32 32)"
          />
          <circle cx="32" cy="32" r="2.5" fill="#a5f3fc" opacity="0.95" />
        </svg>
      </div>
    </div>
  );
}
