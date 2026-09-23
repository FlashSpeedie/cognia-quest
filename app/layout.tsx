import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/components/app/ServiceWorkerRegistration";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "AI Quest — Learn AI. Challenge AI. Use AI Responsibly.",
    template: "%s | AI Quest",
  },
  description:
    "AI Quest is an interactive AI literacy platform for grades 9–12. Train models, spot hallucinations, master prompting, and make responsible AI decisions.",
  openGraph: {
    title: "AI Quest — Learn AI. Challenge AI. Use AI Responsibly.",
    description:
      "Become an AI Apprentice: interactive lessons, simulations, AI Detective cases, and ethics missions.",
    type: "website",
  },
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
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-pulse-500 focus:px-4 focus:py-2 focus:text-white"
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
