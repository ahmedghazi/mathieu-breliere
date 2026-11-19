import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // cacheComponents off: next-sanity defineLive (non-strict) auto-resolves draftMode/stega only without it
  // cacheComponents: true,
  // partialPrefetching: true, // requires cacheComponents
  //192.168.1.96:3000
  //add allowedDevOrigins
  allowedDevOrigins: ["192.168.1.96"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { hostname: "cdn.sanity.io" },
      // { hostname: "source.unsplash.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
