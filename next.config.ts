import type { NextConfig } from "next";

// Allow optimised images from the project's Supabase Storage bucket when configured.
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for a Hostinger VPS (node .next/standalone/server.js).
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // Browsers request /favicon.ico directly; serve the generated app icon.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
