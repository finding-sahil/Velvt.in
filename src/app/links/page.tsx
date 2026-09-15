import { getLinkTreeData } from "@/app/actions";
import { LinkTreeClient } from "./LinkTreeClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getLinkTreeData();
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
  const config = await getLinkTreeData();
  return <LinkTreeClient config={config} />;
}
