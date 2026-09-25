import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dolese Tech",
    short_name: "Dolese Tech",
    description:
      "Dolese Tech — software, cloud infrastructure, cybersecurity, and Tanzania education materials.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F6F8",
    theme_color: "#1B2435",
    // PNGs on the brand-kit navy tile for home screens, where a transparent
    // mark would sit on whatever wallpaper the person has. The maskable one is
    // full-bleed with the mark inside Android's safe zone, so launcher shapes
    // (circle, squircle) never crop it.
    icons: [
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
      { src: "/dolese-mark.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
