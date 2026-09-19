import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Barlow_Condensed, Inter, Playfair_Display } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { HalloweenAtmosphere } from "@/components/ui/HalloweenAtmosphere";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { getCachedSiteSettings } from "@/lib/settings-cache";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://velvt.in"),
  title: {
    default: "VELVT — It starts as a thought, ends as a memory",
    template: "%s — VELVT",
  },
  description:
    "VELVT is an event organization focused on creating immersive experiences, bringing communities together, and turning creative ideas into memorable events.",
  keywords: ["VELVT", "events", "experiences", "community", "velvt.in"],
  openGraph: {
    type: "website",
    siteName: "VELVT",
    title: "VELVT — It starts as a thought, ends as a memory",
    description:
      "Curating experiences, building communities, and turning ideas into unforgettable moments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELVT — It starts as a thought, ends as a memory",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getCachedSiteSettings();
  const siteTheme = siteSettings.site_theme || "legacy";

  // Helper inside layout for feature toggles
  const isEnabled = (key: string, def = true) => {
    if (siteSettings[key] === undefined || siteSettings[key] === "") return def;
    return siteSettings[key] === "true" || siteSettings[key] === "1";
  };

  return (
    <html
      lang="en"
      data-theme={siteTheme}
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${inter.variable} ${playfairDisplay.variable}`}
    >
      <head>
        {/* Theme Initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/velvt_theme=([^;]+)/);var s=(m&&m[1])||localStorage.getItem('velvt_theme');if(s){document.documentElement.setAttribute('data-theme',s);}}catch(e){}})();`,
          }}
        />
        {/* Google Analytics (gtag.js) - loaded with lazyOnload to protect TBT and FCP */}
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-BMVXLZPMEQ"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BMVXLZPMEQ');
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-white relative overflow-x-hidden">
        <ThemeProvider>
          {/* Vercel Web Analytics */}
          <Analytics />

          {/* UNTOLDSURI Texture Layers: Film Grain & Scanlines */}
          {isEnabled("feature_film_grain", true) && (
            <>
              <div className="film-grain" aria-hidden="true" />
              <div className="scanlines" aria-hidden="true" />
            </>
          )}

          {/* Interactive Custom Cursor */}
          {isEnabled("feature_custom_cursor", true) && <CustomCursor />}

          {/* Ambient Floating Embers (Halloween Touch) */}
          {isEnabled("feature_thematic_atmosphere", true) && <HalloweenAtmosphere />}

          {/* Floating Pill Glass Navigation */}
          <Navigation />

          {/* Route-Aware App Shell: Zero Top-Padding & No Public Footer in Admin Panel */}
          <AppShell
            footer={
              <>
                {isEnabled("feature_scroll_to_top", true) && <ScrollToTop />}
                <Footer />
              </>
            }
          >
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
