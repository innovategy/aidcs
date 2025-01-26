import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env: {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    },
};

export default nextConfig;
