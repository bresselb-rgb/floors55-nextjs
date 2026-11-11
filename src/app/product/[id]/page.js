// src/app/product/[id]/page.js
import { doc, getDoc, collection, query, where, getDocs, limit, documentId } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import ProductViewer from "../../../components/ProductViewer";
import ProductAccessories from "../../../components/ProductAccessories";
import SimilarProducts from "../../../components/SimilarProducts";
import Link from "next/link";

// 0. Force Vercel to always fetch fresh data for this page
export const dynamic = 'force-dynamic';

const BASE_URL = "https://www.floors55pro.com";

const authenticateServer = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
    }
};

// Strips confidential internal fields (like landedCost) before serializing props into public HTML
const sanitizePublicProduct = (rawObj) => {
    if (!rawObj) return rawObj;
    const { landedCost, cost, ...safeObj } = rawObj;
    return safeObj;
};

// Truncates meta descriptions cleanly at a word boundary instead of mid-word
const cleanTruncate = (str, maxLen = 155) => {
    if (!str) return '';
    const clean = str.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLen) return clean;
    const sub = clean.substring(0, maxLen - 1);
    const lastSpace = sub.lastIndexOf(' ');
    return (lastSpace > 80 ? sub.substring(0, lastSpace) : sub) + '…';
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
    const isCarpet = (data.category || '').toLowerCase() === 'carpet';
    const viewsUpper = Array.isArray(data.views) ? data.views.map(v => String(v).toUpperCase()) : [];
    let imgType = isCarpet ? 'swatch' : 'main';
    if (viewsUpper.length > 0 && !viewsUpper.includes(imgType.toUpperCase())) {
        const firstValidView = viewsUpper.find(v => v !== 'VIDEO');
        if (firstValidView) imgType = firstValidView.toLowerCase();
    }
    const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_${imgType}.jpg`.toLowerCase();
    return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
};

// Avoids "Tile Tile" or "Carpet Carpet" when the product name already contains the category word
const buildCleanProductHeading = (title, categoryClean) => {
    const tLower = String(title || '').toLowerCase();
    const cLower = String(categoryClean || '').toLowerCase();
    const baseWord = cLower.split(' ')[0];
    if (tLower.includes(cLower) || (baseWord.length > 3 && tLower.includes(baseWord)) || tLower.includes('lvp')) {
        return title;
    }
    return `${title} ${categoryClean}`;
};

export async function generateMetadata({ params, searchParams }) {
  await authenticateServer();
  
  const { id } = await params;
  const resolvedParams = await searchParams;
  const isPrivate = resolvedParams?.private === 'true';

  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: 'Product Not Found' };
  }

  const data = docSnap.data();
  const title = (isPrivate || data.usePrivateName) 
    ? (data.privateName || 'Custom Collection') 
    : (data.name || 'Unnamed Product');

  const currentPrice = parseFloat(data.price) || 0;
  const rawRetail = data.retailPrice ? parseFloat(data.retailPrice) : (currentPrice * 2.2);
  const retailFormatted = (rawRetail > 0 ? rawRetail : 4.99).toFixed(2);
  const unitLabel = data.unit || 'sqft';
  const categoryClean = data.category || 'Flooring';
  const titleWithCat = buildCleanProductHeading(title, categoryClean);
  const fullSeoTitle = `${titleWithCat} | Portland & Lake Oswego`;

  const seoDesc = `Shop ${titleWithCat} with fast local warehouse will-call or turnkey installation. Listed at $${retailFormatted}/${unitLabel} retail—verified pros sign in for trade pricing. Call or text (503) 662-9230 for a quote!`;

  const imageUrl = getGridImgUrl(data);

  return {
    // Root layout.js automatically appends "| Floors 55 Pro Portal"
    title: fullSeoTitle,
    description: seoDesc,
    openGraph: {
        title: `${titleWithCat} | Portland & Lake Oswego Showrooms`,
        description: seoDesc,
        url: `${BASE_URL}/product/${id}`,
        images: [{ url: imageUrl, width: 1200, height: 630 }],
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: `${titleWithCat} | Portland & Lake Oswego Showrooms`,
        description: seoDesc,
        images: [imageUrl]
    },
    alternates: {
      canonical: `${BASE_URL}/product/${id}`,
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
  const productData = sanitizePublicProduct({ id: docSnap.id, ...data });
  
  productData.displayTitle = (isPrivate || data.usePrivateName) 
    ? (data.privateName || 'Custom Collection') 
    : (data.name || 'Unnamed Product');

  const currentPrice = parseFloat(data.price) || 0;
  const rawRetail = data.retailPrice ? parseFloat(data.retailPrice) : (currentPrice * 2.2);
  // Guarantee a valid positive number for Google Schema even if a trim/custom SKU has 0 price in DB
  const retailPrice = (rawRetail > 0 ? rawRetail : 4.99).toFixed(2);
  const imageUrl = getGridImgUrl(data);

  const getCategorySlug = (catName) => {
      if (!catName) return '/category';
      if (catName === 'Luxury Vinyl (LVP)' || catName.toLowerCase().includes('vinyl')) return '/category/luxury-vinyl';
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
                  matchingAccessories.push(sanitizePublicProduct({ id: doc.id, ...accData }));
              }
          });
      } catch (error) {
          console.error("Error fetching accessories:", error);
      }
  }

  // Fetch Similar Products OR Sibling Trims
  let similarProducts = [];
  let similarTitle = "Similar Options";

  // 1. TILE SERIES INTERCEPT
  if (data.category === 'Tile' && data.styleFamily) {
      similarTitle = `Other Formats in the ${data.name?.split(' ')[0] || 'Tile'} Series`;
      
      try {
          const seriesQuery = query(
              collection(db, 'artifacts', appId, 'public', 'data', 'pricing'),
              where('styleFamily', '==', data.styleFamily),
              limit(25)
          );
          const seriesSnap = await getDocs(seriesQuery);
          seriesSnap.forEach((doc) => {
              const simData = doc.data();
              if (doc.id !== id && simData.isVisible !== false) {
                  similarProducts.push(sanitizePublicProduct({ id: doc.id, ...simData }));
              }
          });
      } catch (error) {
          console.error("Error fetching tile series:", error);
      }
      
  // 2. EXISTING TRIM & STANDARD LOGIC
  } else if (data.isAccessory) {
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
                      if (doc.id !== id && simData.isVisible !== false) {
                          similarProducts.push(sanitizePublicProduct({ id: doc.id, ...simData }));
                      }
                  });
              }
          }
      } catch (error) {
          console.error("Error fetching sibling accessories:", error);
      }
  } else if (currentPrice > 0 && data.category) {
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
                  similarProducts.push(sanitizePublicProduct({ id: doc.id, ...simData }));
              }
          });
      } catch (error) {
          console.error("Error fetching similar products:", error);
      }
  }
  
  const displaySimilar = (data.category === 'Tile' && data.styleFamily) 
      ? similarProducts 
      : similarProducts.slice(0, 4);

  const unitLabel = data.unit || 'sqft';
  const categoryClean = data.category || 'Flooring';
  const titleWithCat = buildCleanProductHeading(productData.displayTitle, categoryClean);
  const schemaDesc = `Shop ${titleWithCat} with fast local warehouse will-call or turnkey installation. Listed at $${retailPrice}/${unitLabel} retail—verified pros sign in for trade pricing. Call or text (503) 662-9230 for a quote!`;

  // Map technical specs + carton coverage + color count into structured PropertyValue schema for AI Overviews
  const additionalProperties = [];
  if (Array.isArray(data.specs)) {
    data.specs.forEach((specLine) => {
      const idx = String(specLine).indexOf(':');
      if (idx > 0) {
        additionalProperties.push({
          "@type": "PropertyValue",
          "name": specLine.substring(0, idx).trim(),
          "value": specLine.substring(idx + 1).trim(),
        });
      }
    });
  }
  if (data.cartonSize) {
    additionalProperties.push({
      "@type": "PropertyValue",
      "name": "Carton Coverage",
      "value": `${data.cartonSize} sqft`,
    });
  }
  if (Array.isArray(data.colors) && data.colors.length > 0) {
    additionalProperties.push({
      "@type": "PropertyValue",
      "name": "Available Colorways",
      "value": data.colors.map((c) => c.name).filter(Boolean).join(', '),
    });
  }

  const brandName = (isPrivate || data.usePrivateName)
    ? (data.privateManufacturer || "Floors 55 Pro")
    : (data.manufacturer || "Floors 55 Pro");

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.displayTitle,
    "category": categoryClean,
    "image": imageUrl,
    "description": data.desc ? `${schemaDesc} ${cleanTruncate(data.desc, 160)}` : schemaDesc,
    "sku": (isPrivate || data.usePrivateName) ? (data.privateSku || docSnap.id) : (data.sku || docSnap.id),
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    ...(additionalProperties.length > 0 ? { "additionalProperty": additionalProperties } : {}),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "24"
    },
    "offers": {
      "@type": "Offer",
      "url": `${BASE_URL}/product/${id}`,
      "priceCurrency": "USD",
      "price": retailPrice,
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Floors 55 Pro",
        "telephone": "+1-503-662-9230"
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
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": data.category || "Products",
        "item": `${BASE_URL}${catSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productData.displayTitle,
        "item": `${BASE_URL}/product/${id}`
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

      <ProductAccessories accessories={matchingAccessories} isPrivate={isPrivate} />

      <SimilarProducts products={displaySimilar} isPrivate={isPrivate} title={similarTitle} />
    </>
  );
}