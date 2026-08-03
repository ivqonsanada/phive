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
    ],
  },
};

export default nextConfig;
