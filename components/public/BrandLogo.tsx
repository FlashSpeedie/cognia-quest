"use client";

import { useState } from "react";
import Image from "next/image";

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
  const [imageOk, setImageOk] = useState(true);
  const box = size === "lg" ? "h-11 w-11 text-xl" : size === "md" ? "h-9 w-9 text-base" : "h-8 w-8 text-sm";
  return (
    <span className="flex items-center gap-2.5">
      <span className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pulse-600 font-display font-bold text-white`}>
        <span aria-hidden="true">C</span>
        {imageOk && (
          <Image
            src="/logo.png"
            alt="Cognia Quest logo"
            width={44}
            height={44}
            className="absolute inset-0 h-full w-full object-contain"
            onError={() => setImageOk(false)}
          />
        )}
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">Cognia&nbsp;Quest</span>
      )}
    </span>
  );
}
