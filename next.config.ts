import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Ensure Turbopack root is explicitly set to this project folder
    root: __dirname,
  },
};

export default nextConfig;
