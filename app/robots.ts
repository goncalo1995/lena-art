// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',           // Block all admin routes
          '/pt/admin/', 
          '/en/admin/', 
          '/api/',
          '/*/admin/',         // Block any locale admin
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      }
    ],
    sitemap: 'https://helenacolaco.com/sitemap.xml',
  }
}