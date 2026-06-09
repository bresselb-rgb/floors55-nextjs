export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin.html', 
        '/db-manager.html', 
        '/my-account'
      ],
    },
    // We will use your official domain here so Google maps it correctly
    sitemap: 'https://www.floors55pro.com/sitemap.xml',
  }
}