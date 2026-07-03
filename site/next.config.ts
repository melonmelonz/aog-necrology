import type { NextConfig } from "next";

// Static export. When deploying to GitHub Pages under a repo subpath
// (e.g. https://<owner>.github.io/aog-necrology), set AOG_BASE_PATH=/aog-necrology
// so Next emits correct asset URLs. Local dev and root-domain hosting leave it unset.
const basePath = process.env.AOG_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
