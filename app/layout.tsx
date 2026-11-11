import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/alegreya/400.css";
import "@fontsource/alegreya/400-italic.css";
import "@fontsource/alegreya/500.css";
import "@fontsource/alegreya/700.css";
import "@fontsource/alegreya-sc/400.css";
import "@fontsource/alegreya-sc/500.css";
import "./globals.css";
import { MobileBar, Spine } from "@/components/Spine";
import { DrawerCloser, ServiceWorker } from "@/components/Client";
import { MODE_BOOT } from "@/lib/shared";

export const metadata: Metadata = {
  title: { default: "Pagini de istorie", template: "%s — Pagini de istorie" },
  description:
    "Istoria clasei a X-a, profil umanist, specializarea științe sociale: lecții, surse istorice, hărți, cronologie și exerciții.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  applicationName: "Pagini de istorie",
};

export const viewport: Viewport = {
  themeColor: "#cdbb8f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-mod="elev" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_BOOT }} />
      </head>
      <body>
        <a href="#continut" className="visually-hidden">
          Sari la conținut
        </a>
        <MobileBar />
        <div className="cadru">
          <Spine />
          <main id="continut" className="fila">
            {children}
          </main>
        </div>
        <DrawerCloser />
        <ServiceWorker />
        <Analytics />
      </body>
    </html>
  );
}
