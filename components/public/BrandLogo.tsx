"use client";

import { useState } from "react";

/**
 * Centralized product logo. Renders /public/logo.png once provided; until
 * then a quiet letter mark keeps every layout stable (no broken-image icon,
 * no layout shift). Use this component everywhere the brand appears.
 */
export function BrandLogo({
  size = "md",
  showWordmark = true,
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}) {
  // The wordmark's letter is the default. The PNG replaces it only after a
  // successful load, so a missing asset degrades invisibly.
  const [loaded, setLoaded] = useState(false);
  const box = size === "lg" ? "h-11 w-11 text-xl" : size === "md" ? "h-9 w-9 text-base" : "h-8 w-8 text-sm";
  return (
    <span className="flex items-center gap-2.5">
      <span className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pulse-600 font-display font-bold text-white`}>
        <span aria-hidden={loaded} className={loaded ? "hidden" : undefined}>C</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Cognia Quest logo"
          width={44}
          height={44}
          className={`absolute inset-0 h-full w-full object-contain ${loaded ? "" : "hidden"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">Cognia&nbsp;Quest</span>
      )}
    </span>
  );
}
