import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { HalloweenAtmosphere } from "@/components/ui/HalloweenAtmosphere";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
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

export const metadata: Metadata = {
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
  let siteTheme = "legacy";
  try {
    const cookieStore = await cookies();
    const cookieTheme = cookieStore.get("velvt_theme")?.value;
    if (cookieTheme) {
      siteTheme = cookieTheme;
    } else {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: "site_theme" },
      });
      if (setting?.value) {
        siteTheme = setting.value;
      }
    }
  } catch {
    // fallback to legacy
  }

  return (
    <html
      lang="en"
      data-theme={siteTheme}
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${inter.variable}`}
    >
      <head>
        {/* Theme Initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/velvt_theme=([^;]+)/);var s=(m&&m[1])||localStorage.getItem('velvt_theme');if(s){document.documentElement.setAttribute('data-theme',s);}}catch(e){}})();`,
          }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-BMVXLZPMEQ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
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
      <body className="min-h-screen flex flex-col bg-black text-white relative">
        {/* Vercel Web Analytics */}
        <Analytics />

        {/* UNTOLDSURI Texture Layers: Film Grain & Scanlines */}
        <div className="film-grain" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />

        {/* Interactive Custom Cursor */}
        <CustomCursor />

        {/* Ambient Floating Embers (Halloween Touch) */}
        <HalloweenAtmosphere />

        {/* Floating Pill Glass Navigation */}
        <Navigation />

        {/* Route-Aware App Shell: Zero Top-Padding & No Public Footer in Admin Panel */}
        <AppShell
          footer={
            <>
              <ScrollToTop />
              <Footer />
            </>
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
