/**
 * Centralized product logo: brand letter-mark plus wordmark. Rendering is
 * pure and server-safe; every layout that shows the brand uses this so
 * the mark stays identical everywhere.
 */
export function BrandLogo({
  size = "md",
  showWordmark = true,
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}) {
  const box = size === "lg" ? "h-11 w-11 text-xl" : size === "md" ? "h-9 w-9 text-base" : "h-8 w-8 text-sm";
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pulse-600 font-display font-bold text-white`}
      >
        C
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">Cognia&nbsp;Quest</span>
      )}
    </span>
  );
}
