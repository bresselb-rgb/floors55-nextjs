import { doc, getDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import ProductViewer from "../../../components/ProductViewer";
import Link from "next/link";

// Helper to ensure the server is authenticated before asking Firebase for data
const authenticateServer = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
    }
};

// 1. Next.js Magic: This injects the precise meta data into the <head> for Google!
export async function generateMetadata({ params }) {
  await authenticateServer();
  
  const { id } = await params;
  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: 'Product Not Found | Floors 55' };
  }

  const data = docSnap.data();
  const title = (data.usePrivateName && data.privateName) ? data.privateName : (data.name || 'Unnamed Product');

  // Format image URL so it renders in text message previews when shared directly
  const safeName = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeSku = (data.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let folderName = 'images'; 
  if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
  else if (safeName) folderName = safeName;
  folderName = folderName.replace(/-+$/, '');

  const displaySku = data.colors?.[0]?.sku || '01';
  const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

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
    // ✅ Canonical URLs tell Google to ignore any tracking parameters in the URL
    alternates: {
      canonical: `https://www.floors55pro.com/product/${id}`,
    }
  };
}

// 2. The Server Page: Fetches data purely on the server before sending HTML to the browser
export default async function ProductPageServer({ params }) {
  await authenticateServer();
  
  const { id } = await params;
  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', id);
  const docSnap = await getDoc(docRef);

  // Handle dead links gracefully with a 404 block
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

  // Prep the data
  const data = docSnap.data();
  const productData = { id: docSnap.id, ...data };
  productData.displayTitle = (data.usePrivateName && data.privateName) ? data.privateName : (data.name || 'Unnamed Product');

  const retailPrice = data.retailPrice ? parseFloat(data.retailPrice).toFixed(2) : ((data.price || 0) * 2.2).toFixed(2);
  
  const safeName = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeSku = (data.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let folderName = 'images'; 
  if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
  else if (safeName) folderName = safeName;
  folderName = folderName.replace(/-+$/, '');

  const displaySku = data.colors?.[0]?.sku || '01';
  const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

  const baseUrl = "https://www.floors55pro.com";

  // Helper to dynamically build the correct parent category URL
  const getCategorySlug = (catName) => {
      if (!catName) return '/category';
      if (catName === 'Luxury Vinyl (LVP)') return '/category/luxury-vinyl';
      return `/category/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };
  const catSlug = getCategorySlug(data.category);

  // ✅ Product Schema (Rich Snippets for Google)
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

  // ✅ Breadcrumb Schema (Creates the clean trail in Google Search results)
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
      
      {/* ✅ The Visual Breadcrumb Trail for Users */}
      <div className="bg-white pt-6 pb-2">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400">
            <Link href="/" className="hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href={catSlug} className="hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>{data.category || 'Collections'}</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{productData.displayTitle}</span>
        </div>
      </div>

      <ProductViewer initialProduct={productData} />
    </>
  );
}