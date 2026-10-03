import type { MetadataRoute } from "next";

const siteUrl = process.env.PUBLIC_SITE_URL || "https://syntiqhq.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
