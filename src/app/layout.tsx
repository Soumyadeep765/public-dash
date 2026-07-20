import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PendingForkRedirect } from "@/components/PendingForkRedirect";
import { SessionProvider } from "@/components/SessionProvider";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-ui",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const site = getSiteUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: `${SITE_NAME} · Public Telegram bots & developers`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "TeleBotHost", url: "https://telebothost.com" }],
  creator: "TeleBotHost",
  publisher: "TeleBotHost",
  category: "technology",
  keywords: [
    "TeleBotHost",
    "Telegram bots",
    "bot templates",
    "Telegram bot store",
    "bot hosting",
    "TeleDevs",
    "teledevs.me",
  ],
  alternates: {
    canonical: site,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/tbh.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <SessionProvider>
            <PendingForkRedirect />
            <SiteJsonLd />
            <Header />
            <main className="flex-1 py-6">{children}</main>
            <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
