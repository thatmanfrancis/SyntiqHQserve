import type { MetadataRoute } from "next";

const siteUrl = process.env.PUBLIC_SITE_URL || "https://syntiqhq.com";

// Add each new public page here once it exists
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/industries/healthcare`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
