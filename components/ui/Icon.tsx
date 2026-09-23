import type { SVGProps } from "react";

/**
 * One coherent icon set - 1.75px stroke, rounded caps, 24px viewBox.
 * Used across navigation, missions, achievements, labs.
 */
export type IconName =
  | "home" | "academy" | "lab" | "detective" | "ethics" | "missions"
  | "achievements" | "progress" | "profile" | "settings" | "search"
  | "bolt" | "badge" | "lock" | "check" | "x" | "arrow-right" | "arrow-left"
  | "spark" | "brain" | "shield" | "eye" | "flag" | "book" | "chart"
  | "cpu" | "chat" | "scale" | "key" | "star" | "flame" | "trophy"
  | "menu" | "sun" | "moon" | "terminal" | "network";

const paths: Record<IconName, string> = {
  home: "M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9",
  academy: "M12 4 2 9l10 5 10-5-10-5ZM6 11.5V17c0 1.5 12 1.5 12 0v-5.5",
  lab: "M9 3h6M10 3v6.3L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 9.3V3M7.5 14h9",
  detective: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.3 15.3 21 21",
  ethics: "M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4ZM9 12l2 2 4-4",
  missions: "M4 5h16M4 12h16M4 19h10M18 16l3 3-3 3",
  achievements: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  progress: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-3.3 3.6-5 8-5s8 1.7 8 5",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2Z",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM21 21l-5.6-5.6",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  badge: "M12 2 14.5 4.6 18 5l.6 3.5L21 11l-2.4 2.5L18 17l-3.5.4L12 20l-2.5-2.6L6 17l-.6-3.5L3 11l2.4-2.5L6 5l3.5-.4L12 2ZM9.5 11.5 11.2 13.2 15 9.5",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11ZM12 15v3",
  check: "M4 12.5 9.5 18 20 6.5",
  x: "M5 5l14 14M19 5 5 19",
  "arrow-right": "M4 12h16M13 5l7 7-7 7",
  "arrow-left": "M20 12H4M11 5l-7 7 7 7",
  spark: "M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2 19 19M19 5l-2.8 2.8M7.8 16.2 5 19",
  brain: "M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3c1 0 2-.4 3-1V4c-1-.6-2-1-3-1ZM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3c-1 0-2-.4-3-1",
  shield: "M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z",
  eye: "M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  flag: "M5 21V4m0 1h13l-2.5 4L18 13H5",
  book: "M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h14",
  chart: "M3 3v18h18M8 16v-5M13 16V8M18 16v-3",
  cpu: "M7 7h10v10H7V7ZM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3",
  chat: "M4 5h16v11H9l-5 4V5Z",
  scale: "M12 3v18M5 21h14M7 6l5-2 5 2M7 6 4 12a3 3 0 0 0 6 0L7 6ZM17 6l-3 6a3 3 0 0 0 6 0l-3-6Z",
  key: "M14 10a4 4 0 1 0-4 4c.5 0 1-.1 1.4-.3L13 15h2v2h2v2h3v-3l-5.7-5.7c.2-.4.7-.9.7-.3Z",
  star: "m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7L12 3Z",
  flame: "M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0C7 9 9.5 7 12 3Zm0 14a2.5 2.5 0 0 0 2.5-2.5c0-1.5-1-3-2.5-4.5-1.5 1.5-2.5 3-2.5 4.5A2.5 2.5 0 0 0 12 17Z",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  menu: "M4 6h16M4 12h16M4 18h16",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 13.5A8 8 0 0 1 10.5 4 6.5 6.5 0 1 0 20 13.5Z",
  terminal: "M4 6h16v12H4V6ZM7 10l3 2-3 2M12 14h5",
  network: "M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 5.5l2.4 1.4M16 5.5l-2.4 1.4M10.7 10.6 7.4 16.6M13.3 10.6l3.3 6",
};

export function Icon({
  name,
  size = 20,
  className = "",
  ...props
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
