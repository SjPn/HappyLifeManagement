import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || "https://hlm-nu.vercel.app";

const config: CapacitorConfig = {
  appId: "ua.happylife.app",
  appName: "Happy Life",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
