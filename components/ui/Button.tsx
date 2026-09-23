import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  // Solid, professional blue. Subtle shadow, clean hover, no glow.
  primary:
    "border border-pulse-600 bg-pulse-600 text-white shadow-card hover:bg-pulse-700 hover:border-pulse-700 active:translate-y-px",
  secondary:
    "border border-void-700 bg-white text-ink hover:border-pulse-500/50 hover:text-pulse-700 active:translate-y-px dark:bg-void-800 dark:hover:border-pulse-400/50 dark:hover:text-pulse-700 dark:text-pulse-300",
  ghost: "text-ink-dim hover:text-ink hover:bg-void-700/50 dark:hover:bg-void-700 active:translate-y-px",
  danger:
    "border border-rose-300 bg-white text-rose-700 hover:border-rose-400 hover:bg-rose-50 active:translate-y-px dark:border-rose-700/60 dark:bg-void-800 dark:text-rose-300 dark:hover:bg-rose-950/40",
  success:
    "border border-mint-600 bg-mint-600 text-white shadow-card hover:bg-mint-700 hover:border-mint-700 active:translate-y-px",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-6 py-3 text-base rounded-lg gap-2",
};

const base =
  "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none select-none";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ariaLabel,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
