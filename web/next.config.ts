import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Default 1 MB breaks phone photos in server-action uploads.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default withNextIntl(nextConfig);
