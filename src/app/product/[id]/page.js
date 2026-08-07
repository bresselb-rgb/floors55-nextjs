import { doc, getDoc, collection, query, where, getDocs, limit, documentId } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import ProductViewer from "../../../components/ProductViewer";
import ProductAccessories from "../../../components/ProductAccessories";
import SimilarProducts from "../../../components/SimilarProducts";
import Link from "next/link";

// 0. Force Vercel to always fetch fresh data for this page
export const dynamic = 'force-dynamic';

const authenticateServer = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
    }
};

const getGridImgUrl = (data) => {
  const safeName = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const safeSku = (data.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
let folderName = data.imageFolder ? data.imageFolder : 'images'; 
if (!data.imageFolder) {
    if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
    else if (safeName) folderName = safeName;
    folderName = folderName.replace(/-+$/, '');
}

  const displaySku = data.colors?.[0]?.sku || '01';
  const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
  return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
};

export async function generateMetadata({ params, searchParams }) {
  await authenticateServer();
  
  const { id } = await params;
  const resolvedParams = await searchParams;
  const isPrivate = resolvedParams?.private === 'true';

  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: 'Product Not Found | Floors 55' };
  }

  const data = docSnap.data();
  const title = (isPrivate || data.usePrivateName) 
    ? (data.privateName || 'Custom Collection') 
    : (data.name || 'Unnamed Product');

  const imageUrl = getGridImgUrl(data);

  return {
    title: `${title} | Floors 55`,
    description: data.desc || `View the ${title} premium flooring collection at Floors 55.`,
    openGraph: {
        title: `${title} | Floors 55`,
        description: data.desc || `View the ${title} premium flooring collection at Floors 55.`,
        images: [{ url: imageUrl, width: 1200, height: 630 }],
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: `${title} | Floors 55`,
        description: data.desc || `View the ${title} premium flooring collection at Floors 55.`,
        images: [imageUrl]
    },
    alternates: {
      canonical: `https://www.floors55pro.com/product/${id}`,
    }
  };
}

export default async function ProductPageServer({ params, searchParams }) {
  await authenticateServer();
  
  const { id } = await params;
  const resolvedParams = await searchParams;
  const isPrivate = resolvedParams?.private === 'true';

  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
      <main className="bg-white flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't locate the requested product details. It may have been removed or updated.</p>
        <Link href="/category" className="bg-black text-white px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-gold hover:text-black transition-colors" style={{ textDecoration: 'none' }}>
            Return to Collections
        </Link>
      </main>
    );
  }

  const data = docSnap.data();
  const productData = { id: docSnap.id, ...data };
  
  productData.displayTitle = (isPrivate || data.usePrivateName) 
    ? (data.privateName || 'Custom Collection') 
    : (data.name || 'Unnamed Product');

  const currentPrice = parseFloat(data.price) || 0;
  const retailPrice = data.retailPrice ? parseFloat(data.retailPrice).toFixed(2) : (currentPrice * 2.2).toFixed(2);
  const imageUrl = getGridImgUrl(data);
  const baseUrl = "https://www.floors55pro.com";

  const getCategorySlug = (catName) => {
      if (!catName) return '/category';
      if (catName === 'Luxury Vinyl (LVP)') return '/category/luxury-vinyl';
      return `/category/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };
  const catSlug = getCategorySlug(data.category);

  // Fetch Exact Match Accessories (Trims, Moldings)
  let matchingAccessories = [];
  if (data.accessories && Array.isArray(data.accessories) && data.accessories.length > 0) {
      const safeAccessories = data.accessories.slice(0, 10);
      const accessoriesQuery = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'pricing'),
          where(documentId(), 'in', safeAccessories)
      );

      try {
          const accSnap = await getDocs(accessoriesQuery);
          accSnap.forEach((doc) => {
              const accData = doc.data();
              if (accData.isVisible !== false) {
                  matchingAccessories.push({ id: doc.id, ...accData });
              }
          });
      } catch (error) {
          console.error("Error fetching accessories:", error);
      }
  }

  // Fetch Similar Products OR Sibling Trims
  let similarProducts = [];
  let similarTitle = "Similar Options"; // Default Title

  if (data.isAccessory) {
      // It's a trim! Do a reverse lookup to find the parent floor.
      try {
          const parentQuery = query(
              collection(db, 'artifacts', appId, 'public', 'data', 'pricing'),
              where('accessories', 'array-contains', id),
              limit(1)
          );
          const parentSnap = await getDocs(parentQuery);
          
          if (!parentSnap.empty) {
              const parentData = parentSnap.docs[0].data();
              similarTitle = `More Trims for ${parentData.name || 'this Collection'}`;
              
              if (parentData.accessories && parentData.accessories.length > 0) {
                  const safeAccessories = parentData.accessories.slice(0, 10);
                  const siblingsQuery = query(
                      collection(db, 'artifacts', appId, 'public', 'data', 'pricing'),
                      where(documentId(), 'in', safeAccessories)
                  );
                  
                  const siblingsSnap = await getDocs(siblingsQuery);
                  siblingsSnap.forEach((doc) => {
                      const simData = doc.data();
                      // Only add it if it's NOT the trim we are currently viewing
                      if (doc.id !== id && simData.isVisible !== false) {
                          similarProducts.push({ id: doc.id, ...simData });
                      }
                  });
              }
          }
      } catch (error) {
          console.error("Error fetching sibling accessories:", error);
      }
  } else if (currentPrice > 0 && data.category) {
      // Standard Similar Products Logic for normal floors
      const minPrice = currentPrice;
      const maxPrice = currentPrice * 1.30;
      
      const similarProductsQuery = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'pricing'),
          where('category', '==', data.category),
          where('price', '>=', minPrice),
          where('price', '<=', maxPrice),
          limit(10)
      );

      try {
          const similarSnap = await getDocs(similarProductsQuery);
          similarSnap.forEach((doc) => {
              const simData = doc.data();
              if (doc.id !== id && simData.isVisible !== false) {
                  similarProducts.push({ id: doc.id, ...simData });
              }
          });
      } catch (error) {
          console.error("Error fetching similar products:", error);
      }
  }
  
  const displaySimilar = similarProducts.slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.displayTitle,
    "image": imageUrl,
    "description": data.desc || `View the ${productData.displayTitle} premium flooring collection.`,
    "sku": data.sku || data.id,
    "brand": {
      "@type": "Brand",
      "name": data.manufacturer || "Floors 55"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${id}`,
      "priceCurrency": "USD",
      "price": retailPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Floors 55"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": data.category || "Products",
        "item": `${baseUrl}${catSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productData.displayTitle,
        "item": `${baseUrl}/product/${id}`
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
      <div className="bg-white pt-6 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
            <Link href="/" className="hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href={catSlug} className="hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>{data.category || 'Collections'}</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{productData.displayTitle}</span>
        </div>
      </div>

      <ProductViewer initialProduct={productData} hideBadges={isPrivate} />

      {/* Renders accessories only if it's a main floor */}
      <ProductAccessories accessories={matchingAccessories} isPrivate={isPrivate} />

      {/* Renders dynamic similar products OR sibling trims depending on the prop! */}
      <SimilarProducts products={displaySimilar} isPrivate={isPrivate} title={similarTitle} />
    </>
  );
}