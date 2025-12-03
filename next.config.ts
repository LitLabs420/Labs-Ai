import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Allow local network origins in dev to silence the warning
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.56.1:3000",
    ],
  },
  turbopack: {
    // Ensure Turbopack root is explicitly set to this project folder
    root: __dirname,
  },
};

export default nextConfig;
