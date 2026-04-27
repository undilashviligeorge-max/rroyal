"use client";

import { useState } from "react";

export function DevBrowserHint() {
  const [dismissed, setDismissed] = useState(false);

  if (process.env.NODE_ENV !== "development" || dismissed) {
    return null;
  }

  return (
    <div className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-lg border border-zinc-200 bg-white/95 p-3 text-center text-xs text-zinc-600 shadow-lg backdrop-blur sm:left-auto sm:right-4 sm:text-left">
      <p className="text-[13px] leading-snug text-zinc-800">
        <span className="font-medium">დეველოპმენტი:</span> საიტი იხსნება ბრაუზერში ავტომატურად{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-900">
          npm run dev
        </code>
        -ის შემდეგ. თუ არა — ჩასვი მისამართი ხელით Chrome/Safari-ში.
      </p>
      <p className="mt-1 font-mono text-[11px] text-sky-700">http://localhost:3000</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-2 text-[11px] font-medium text-zinc-400 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600"
      >
        დამალვა
      </button>
    </div>
  );
}
