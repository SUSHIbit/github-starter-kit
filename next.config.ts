import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
    };

    // Handle canvas for pdf-parse (Node.js only - used in API routes)
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          canvas: "commonjs canvas",
        });
      }
    }

    return config;
  },
};

export default nextConfig;
