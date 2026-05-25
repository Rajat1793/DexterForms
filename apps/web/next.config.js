/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    // Disable server-side optimization in dev so replaced image files are served fresh
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
