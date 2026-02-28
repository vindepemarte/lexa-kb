import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/docs/'],
    },
    sitemap: 'https://app.hellolexa.space/sitemap.xml',
  }
}
