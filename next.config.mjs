/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * The browser loads only this origin plus Google Fonts (a stylesheet from
 * fonts.googleapis.com, font files from fonts.gstatic.com). Every other
 * outside address on the site is a plain link — WhatsApp, the socials,
 * ResultsPortal — or a server-side call (Resend, Railway, the AI providers),
 * none of which a CSP governs.
 *
 * 'unsafe-inline' for scripts is what Next's App Router needs without a
 * nonce-per-request setup; the rest of the policy still blocks third-party
 * scripts, framing, plugins and form hijacking. Development adds eval and
 * the websocket that hot reload uses.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/**
 * The in-browser code runners (/runners/*) are Web Workers that run learners'
 * Python, SQL and JavaScript. Only these worker scripts may evaluate code and
 * compile WebAssembly; a worker has no access to the page, its cookies or its
 * DOM, and everything it loads comes from this origin. Pages keep the strict
 * policy above.
 */
const runnerCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Two years of HTTPS-only, subdomains included (results.dolese.tech is HTTPS too).
  // Not "preload": joining the browser preload list is hard to undo.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Older browsers' equivalent of frame-ancestors 'none'.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Later entries override earlier ones for the same header key.
      { source: "/runners/:path*", headers: [{ key: "Content-Security-Policy", value: runnerCsp }] },
    ];
  },
};

export default nextConfig;
