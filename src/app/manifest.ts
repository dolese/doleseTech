import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dolese Tech",
    short_name: "Dolese Tech",
    description:
      "Dolese Tech — software, cloud infrastructure, cybersecurity, and Tanzania education materials.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F7FB",
    theme_color: "#16235B",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
