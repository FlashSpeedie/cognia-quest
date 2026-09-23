import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/components/app/ServiceWorkerRegistration";

const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Cognia Quest | Interactive AI Learning for High School Students",
    template: "%s | Cognia Quest",
  },
  description:
    "An interactive AI learning platform for high school students: understand how AI works, practice with interactive challenges, spot AI mistakes, and learn responsible usage.",
  keywords: [
    "AI literacy",
    "high school AI education",
    "learn artificial intelligence",
    "prompt engineering for students",
    "AI ethics for students",
    "machine learning basics",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cognia Quest | Interactive AI Learning for High School Students",
    description:
      "An interactive AI learning platform for grades 9-12: lessons, simulations, prompt engineering practice, and ethics scenarios with real progress tracking.",
    type: "website",
    url: "/",
    siteName: "Cognia Quest",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cognia Quest - interactive AI learning for high school students" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-pulse-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegistration />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("aq-theme")==="dark")document.documentElement.classList.add("dark");if(localStorage.getItem("aq-motion")==="reduced")document.documentElement.classList.add("reduce-motion")}catch(e){}`,
          }}
        />
      </body>
    </html>
  );
}
