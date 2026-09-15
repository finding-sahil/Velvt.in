import { getLinkTreeData } from "@/app/actions";
import { LinkTreeClient } from "./LinkTreeClient";
import type { Metadata } from "next";
import { cache } from "react";

export const revalidate = 60;

const getCachedData = cache(async () => {
  return await getLinkTreeData();
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCachedData();
  return {
    title: `${config.title} • Official Links & Passes`,
    description: config.bio,
    openGraph: {
      title: `${config.title} • Official Links`,
      description: config.bio,
      url: "https://velvt.in/links",
      siteName: "VELVT.in",
      images: [
        {
          url: "/velvt-logo.png",
          width: 800,
          height: 800,
          alt: config.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} • Official Links & Passes`,
      description: config.bio,
    },
  };
}

export default async function LinksPage() {
  const config = await getCachedData();
  return <LinkTreeClient config={config} />;
}

