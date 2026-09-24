import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { SUBJECTS, subjectSlug } from "@/lib/education";
import { MATERIALS } from "@/lib/materials";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    priority,
  });

  return [
    page("/", 1),
    page("/about", 0.8),
    page("/products/resultsportal", 0.9),
    page("/education", 0.8),
    page("/exams", 0.8),
    page("/chat", 0.5),
    page("/privacy", 0.3),
    page("/terms", 0.3),
    page("/security", 0.3),
    ...SERVICES.map((s) => page(`/services/${s.slug}`, 0.7)),
    ...SUBJECTS.map((s) => page(`/education/${subjectSlug(s)}`, 0.6)),
    ...SUBJECTS.flatMap((s) =>
      MATERIALS.map((m) => page(`/education/${subjectSlug(s)}/${m.key}`, 0.5)),
    ),
  ];
}
