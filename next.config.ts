import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '5mb',
  //   },
  // },
  typescript: {
    // ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.helenacolaco.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-f07c1a625b1d42f4966b622eed2489fe.r2.dev',
        port: '',
        pathname: '/**', // Permitir qualquer caminho nesse hostname
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin(
  // Specify a custom path here
  './i18n/request.ts'
);

export default withNextIntl(nextConfig);


// if (process.env.NODE_ENV === "development") {
//   // Use a dynamic import to ensure this module is NEVER bundled into your production build.
//   import("@opennextjs/cloudflare").then((module) => {
//     module.initOpenNextCloudflareForDev();
//   });
// }