import { collection, getDocs } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

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
    '/choosing-your-floor',
    '/floor-care',
    '/installation-prep',
    '/hard-surface-transitions', // <-- Added your missing transitions guide
    '/flooring-glossary',
    '/faq',
    '/warranties',
    '/become-a-pro',
    '/general-contact',
    '/wholesale-request',
    '/order-sample',
    '/locations' // <-- Added your new locations page
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8, // Homepage gets highest priority
  }));

  // 2. Dynamically fetch all live products from your Firestore Database
  let productRoutes = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'));
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only index products that are NOT marked as hidden/drafts
      if (data.isVisible !== false) {
        productRoutes.push({
          url: `${baseUrl}/product/${doc.id}`,
          // If the product has an addedAt date, use it. Otherwise, use today.
          lastModified: data.addedAt ? new Date(data.addedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    });
  } catch (error) {
    console.error("Error generating product sitemap:", error);
  }

  // Combine the static routes and the dynamic product routes into one massive map
  return [...staticRoutes, ...productRoutes];
}