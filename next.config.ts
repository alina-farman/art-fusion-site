import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
};

export default nextConfig;
