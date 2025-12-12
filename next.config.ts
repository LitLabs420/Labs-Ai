import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    // Fix Firebase module resolution for SSR by treating as externals
    if (isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals];
      config.externals = [
        ...externals,
        'firebase/firestore',
        'firebase/functions',
        'firebase/auth',
        'firebase/app',
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
