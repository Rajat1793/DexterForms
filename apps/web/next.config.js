/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
    // Cache RSC payloads for dynamic routes for 30 s (default in Next.js 15 is 0).
    // Prevents the router from re-fetching RSC on every re-render/link hover.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  images: {
    // Disable server-side optimization in dev so replaced image files are served fresh
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
