import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: no server at runtime, so next/image's optimization API
  // isn't available. Images must be pre-optimized (or use placeholders) and
  // served as-is.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
