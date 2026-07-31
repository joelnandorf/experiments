import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statisk export — sajten körs utan Node-server, precis som dagens GitHub Pages-upplägg.
  output: "export",
  // Ger <slug>/index.html i exporten, vilket matchar /<slug>/-länkarna GitHub Pages förväntar sig.
  trailingSlash: true,
  images: {
    // GitHub Pages saknar en bildoptimerings-endpoint, så next/image kan inte optimera on-demand.
    unoptimized: true,
  },
};

export default nextConfig;
