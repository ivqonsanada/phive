import type { NextConfig } from "next";

// Uploads are served by the API host, so it has to be an allowed image source.
const apiUrl = new URL(process.env.API_URL ?? "http://localhost:8000");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/storage/**",
      },
      // The two placeholder services the demo fixtures point at, so a deployment with
      // no backend shows faces and covers rather than a page of silhouettes.
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
