import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Avoid blocking production builds on lint plugin resolution issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
