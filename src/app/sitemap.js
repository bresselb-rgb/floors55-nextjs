// src/app/sitemap.js
import { collection, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, appId } from '../lib/firebase';
import { TIER_1_CITIES } from '../lib/serviceAreasData';

// Force Next.js to dynamically generate this file so it always has your latest products
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://www.floors55pro.com';

  // 1. Map out all of your permanent static routes
  const staticRoutes = [
    '', // Home page
    '/category',
    '/category/luxury-vinyl',
    '/category/carpet',
    '/category/laminate',
    '/category/hardwood',
    '/category/tile',
    '/service-areas', // <-- Main Interactive 3D Metro Service Areas Hub
    '/locations',     // <-- Showroom Locations Page
    '/choosing-your-floor',
    '/floor-care',
    '/installation-prep',
    '/hard-surface-transitions',
    '/flooring-glossary',
    '/faq',
    '/warranties',
    '/become-a-pro',
    '/general-contact',
    '/wholesale-request',
    '/order-sample',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : route === '/service-areas' ? 0.9 : 0.8,
  }));

  // 2. Automatically generate all 15 City SEO Spoke URLs (/service-areas/lake-oswego-or, etc.)
  const serviceAreaCityRoutes = TIER_1_CITIES.map((city) => ({
    url: `${baseUrl}/service-areas/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Dynamically fetch all live products from your Firestore Database
  let productRoutes = [];
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {});
    }

    const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'));
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVisible !== false) {
        productRoutes.push({
          url: `${baseUrl}/product/${doc.id}`,
          lastModified: data.addedAt ? new Date(data.addedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error("Error generating product sitemap:", error);
  }

  // Combine static routes, 15 city SEO pages, and dynamic product routes
  return [...staticRoutes, ...serviceAreaCityRoutes, ...productRoutes];
}