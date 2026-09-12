import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velvt-in.vercel.app";
  const adminPrefix = process.env.ADMIN_ROUTE_PREFIX || "/velvt-management";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          adminPrefix,
          `${adminPrefix}/*`,
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
