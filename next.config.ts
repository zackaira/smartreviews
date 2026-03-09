import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers from guessing MIME types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block the site from being framed by other origins (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limit referrer information sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict access to browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for 2 years in production (browsers ignore this on localhost)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
