/** The site's public address. Override per environment with SITE_URL. */
export const SITE_URL = (process.env.SITE_URL?.trim() || "https://dolese.tech").replace(/\/$/, "");

export const SITE_NAME = "Dolese Tech";

export const SITE_DESCRIPTION =
  "Dolese Tech builds software, cloud systems, and data infrastructure for organizations that need things done right — and teaching materials for Tanzania's classrooms.";
