import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { HalloweenAtmosphere } from "@/components/ui/HalloweenAtmosphere";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { prisma } from "@/lib/db";
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
  let siteTheme = "halloween";

  try {
    const themeSetting = await prisma.siteSetting.findUnique({
      where: { key: "site_theme" },
    });
    if (themeSetting?.value) {
      siteTheme = themeSetting.value;
    }
  } catch {
    // Fallback to halloween theme
  }

  return (
    <html
      lang="en"
      data-theme={siteTheme}
      className={`${barlowCondensed.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-black text-white relative">
        {/* UNTOLDSURI Texture Layers: Film Grain & Scanlines */}
        <div className="film-grain" aria-hidden="true" />
        <div className="scanlines" aria-hidden="true" />

        {/* Interactive Custom Cursor */}
        <CustomCursor />

        {/* Ambient Floating Embers (Halloween Touch) */}
        {siteTheme === "halloween" && <HalloweenAtmosphere />}

        {/* Floating Pill Glass Navigation */}
        <Navigation />

        {/* Page Content */}
        <main className="flex-1 pt-24">{children}</main>

        {/* Floating Scroll to Top Button */}
        <ScrollToTop />

        <Footer />
      </body>
    </html>
  );
}
