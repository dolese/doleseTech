import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { SUBJECTS, subjectSlug } from "@/lib/education";
import { MATERIALS } from "@/lib/materials";
import { CHAPTERS } from "@/content/handbook";
import { SITE_URL } from "@/lib/site";
import { sellingEnabled } from "@/lib/entitlements";
import { LANGUAGES, LEVELS, isAvailable, lessonHref, lessonsInOrder } from "@/lib/programming";

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
    page("/exams/write", 0.6),
    page("/faq", 0.6),
    page("/programming", 0.8),
    page("/handbook", 0.8),
    page("/handbook/glossary", 0.5),
    ...CHAPTERS.filter((c) => c.body).map((c) => page(`/handbook/${c.slug}`, 0.7)),
    page("/chat", 0.5),
    ...(sellingEnabled() ? [page("/pricing", 0.7)] : []),
    page("/privacy", 0.3),
    page("/terms", 0.3),
    page("/security", 0.3),
    ...SERVICES.map((s) => page(`/services/${s.slug}`, 0.7)),
    ...SUBJECTS.map((s) => page(`/education/${subjectSlug(s)}`, 0.6)),
    ...LANGUAGES.filter(isAvailable).flatMap((l) => [
      page(`/programming/${l.slug}`, 0.7),
      ...LEVELS.map((level) => page(`/programming/${l.slug}/${level}`, 0.6)),
      ...lessonsInOrder(l).map(({ level, lesson }) => page(lessonHref(l.slug, level, lesson.slug), 0.6)),
    ]),
    ...SUBJECTS.flatMap((s) =>
      MATERIALS.map((m) => page(`/education/${subjectSlug(s)}/${m.key}`, 0.5)),
    ),
  ];
}
