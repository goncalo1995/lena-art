import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.helenacolaco.pt',
      },
      {
        protocol: 'https',
        hostname: 'pub-c3ef294cbf37482f8764f9b4817684df.r2.dev',
        port: '',
        pathname: '/**', // Permitir qualquer caminho nesse hostname
      },
      // Pode adicionar mais hostnames aqui, como os do Pexels para as imagens dummy
      {
        protocol: 'https',
        hostname: 'vm-ok0lbwbwrv1e1agczur0la.vusercontent.net',
      }
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