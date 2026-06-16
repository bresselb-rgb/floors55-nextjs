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

  return {
    title: `${title} | Floors 55`,
    description: data.desc || `View the ${title} premium flooring collection at Floors 55.`,
    
    // ✅ ACTION ITEM 2: Canonical URLs
    // This tells Google to ignore any tracking/margin parameters in the URL
    // and ONLY index this specific master version of the page.
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

  // Prep the data for the Client Component
  const data = docSnap.data();
  const productData = { id: docSnap.id, ...data };
  productData.displayTitle = (data.usePrivateName && data.privateName) ? data.privateName : (data.name || 'Unnamed Product');

  // ✅ ACTION ITEM 1: Generate Product Schema (Rich Snippets)
  // 1a. Securely calculate the RETAIL price so your wholesale margins are never exposed
  const retailPrice = data.retailPrice ? parseFloat(data.retailPrice).toFixed(2) : ((data.price || 0) * 2.2).toFixed(2);
  
  // 1b. Safely rebuild the main image path for Google Images
  const safeName = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeSku = (data.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let folderName = 'images'; 
  if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
  else if (safeName) folderName = safeName;
  folderName = folderName.replace(/-+$/, '');

  const displaySku = data.colors?.[0]?.sku || '01';
  const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

  // 1c. Build the strict JSON-LD payload
  const jsonLd = {
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
      "url": `https://www.floors55pro.com/product/${id}`,
      "priceCurrency": "USD",
      "price": retailPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Floors 55"
      }
    }
  };

  // Pass the server-fetched data directly into our interactive viewer, 
  // while secretly injecting the schema script at the top!
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewer initialProduct={productData} />
    </>
  );
}