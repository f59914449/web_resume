declare module "next-pwa" {
  import type { NextConfig } from "next";
  interface PWAOptions {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    publicExcludes?: string[];
    runtimeCaching?: unknown[];
  }
  const withPWA: (options: PWAOptions) => (config: NextConfig) => NextConfig;
  export default withPWA;
}
