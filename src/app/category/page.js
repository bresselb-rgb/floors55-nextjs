// src/app/category/page.js
import React from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../lib/firebase";
import CategoryViewer from "../../components/CategoryViewer";

export const dynamic = 'force-dynamic';

const BASE_URL = "https://www.floors55pro.com";

// Note: Root layout.js automatically appends "| Floors 55 Pro Portal"
export const metadata = {
  title: "All Wholesale Flooring Collections | Portland & Lake Oswego",
  description: "Browse our complete B2B wholesale catalog of luxury vinyl plank (LVP), engineered hardwood, commercial & residential carpet, laminate, and porcelain tile.",
  alternates: {
    canonical: `${BASE_URL}/category`,
  },
  openGraph: {
    title: "All Wholesale Flooring Collections | Floors 55 Pro",
    description: "Browse our complete B2B wholesale catalog of LVP, hardwood, carpet, laminate, and tile for Portland and Lake Oswego pros.",
    url: `${BASE_URL}/category`,
    type: "website",
  },
};

export default async function AllCategoriesPage() {
  // Fetch all visible products on the server so Googlebot can crawl every product link from /category
  let allServerProducts = [];
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {});
    }
    const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'));
    snap.forEach((d) => {
      const data = d.data();
      if (data.isVisible !== false) {
        const displayTitle = data.usePrivateName && data.privateName ? data.privateName : (data.name || d.id);
        allServerProducts.push({
          id: d.id,
          name: displayTitle,
          category: data.category || 'Flooring',
        });
      }
    });
  } catch (err) {
    console.error("Error fetching server products for /category SEO:", err);
  }

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
        "name": "All Flooring Collections",
        "item": `${BASE_URL}/category`
      }
    ]
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "All Wholesale Flooring Collections | Floors 55 Pro",
    "url": `${BASE_URL}/category`,
    "description": "Complete wholesale flooring catalog for Portland, Lake Oswego, and SW Washington contractors, builders, designers, and property managers.",
    "isPartOf": {
      "@id": `${BASE_URL}/#organization`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      <CategoryViewer initialCategory="All Products" />

      {/* Server-Rendered Master Catalog Index so Googlebot Crawls All Products & Categories */}
      {allServerProducts.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
                  Complete B2B Flooring Directory ({allServerProducts.length} Active SKUs)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct product specification links for Portland &amp; Lake Oswego trade accounts:
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <Link href="/category/luxury-vinyl" className="text-gray-700 hover:text-[#c5a059] bg-white px-3 py-1.5 rounded border border-gray-200" style={{ textDecoration: 'none' }}>Luxury Vinyl (LVP)</Link>
                <Link href="/category/hardwood" className="text-gray-700 hover:text-[#c5a059] bg-white px-3 py-1.5 rounded border border-gray-200" style={{ textDecoration: 'none' }}>Hardwood</Link>
                <Link href="/category/carpet" className="text-gray-700 hover:text-[#c5a059] bg-white px-3 py-1.5 rounded border border-gray-200" style={{ textDecoration: 'none' }}>Carpet</Link>
                <Link href="/category/laminate" className="text-gray-700 hover:text-[#c5a059] bg-white px-3 py-1.5 rounded border border-gray-200" style={{ textDecoration: 'none' }}>Laminate</Link>
                <Link href="/category/tile" className="text-gray-700 hover:text-[#c5a059] bg-white px-3 py-1.5 rounded border border-gray-200" style={{ textDecoration: 'none' }}>Tile</Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {allServerProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.id}`}
                  className="text-xs text-gray-600 hover:text-gray-900 bg-white hover:border-[#c5a059] border border-gray-200 px-2.5 py-1 rounded transition"
                  style={{ textDecoration: 'none' }}
                >
                  {prod.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}