import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://subtitle-extractor.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/srt-to-vtt", "/vtt-to-srt", "/subtitle-cleaner"];
  return routes.map((r) => ({
    url: `${SITE}${r}`,
    lastModified: "2026-10-16",
    changeFrequency: "weekly",
    priority: r === "" ? 1.0 : 0.9,
  }));
}
