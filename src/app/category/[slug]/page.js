// src/app/category/[slug]/page.js
import React from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import CategoryViewer from "../../../components/CategoryViewer";
import SeoCatalogWrapper from "../../../components/SeoCatalogWrapper";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.floors55pro.com";

const CATEGORY_MAP = {
  "luxury-vinyl": {
    name: "Luxury Vinyl (LVP)",
    matchKeys: ["luxury vinyl", "lvp", "vinyl", "spc", "wpc"],
    title: "Wholesale Luxury Vinyl Plank (LVP) Flooring | Portland & Lake Oswego",
    description:
      "Commercial and residential 100% waterproof SPC & WPC Luxury Vinyl Plank (LVP) flooring. Exclusive B2B wholesale pricing, vendor partner will-call, and on-site measures across Portland & Lake Oswego.",
    lowPrice: "1.99",
    highPrice: "6.99",
  },
  carpet: {
    name: "Carpet",
    matchKeys: ["carpet", "cushion", "pad"],
    title: "Wholesale Designer & Multi-Family Turn Carpet | Portland & Lake Oswego",
    description:
      "Plush residential designer carpet, solution-dyed pet-proof styles, and multi-family turnover carpet in stock for Portland, Lake Oswego, and SW Washington contractors and property managers.",
    lowPrice: "1.49",
    highPrice: "8.99",
  },
  hardwood: {
    name: "Hardwood",
    matchKeys: ["hardwood", "wood", "oak", "hickory", "maple"],
    title: "Wholesale Engineered & Solid Hardwood Flooring | Portland & Lake Oswego",
    description:
      "Wide-plank European White Oak, Hickory, and Pacific Northwest engineered hardwood flooring at protected B2B wholesale trade pricing. Showroom sample selection in Portland & Lake Oswego.",
    lowPrice: "4.49",
    highPrice: "14.99",
  },
  laminate: {
    name: "Laminate",
    matchKeys: ["laminate"],
    title: "Wholesale Waterproof & AC4/AC5 Laminate Flooring | Portland & Lake Oswego",
    description:
      "Scratch-resistant, waterproof AC4 and AC5 commercial-grade laminate flooring for custom builders, remodelers, and property managers in the Portland & Lake Oswego metro.",
    lowPrice: "2.29",
    highPrice: "5.99",
  },
  tile: {
    name: "Tile",
    matchKeys: ["tile", "porcelain", "ceramic", "mosaic", "stone"],
    title: "Wholesale Porcelain, Ceramic & Natural Stone Tile | Portland & Lake Oswego",
    description:
      "Large-format porcelain tile, architectural wall tile, and waterproof shower & floor tile specifications for Portland and Lake Oswego builders, designers, and remodelers.",
    lowPrice: "2.49",
    highPrice: "12.99",
  },
};

function matchesCategorySlug(productCategory = "", slug = "") {
  const catLower = String(productCategory).toLowerCase();
  const slugLower = String(slug).toLowerCase();
  const config = CATEGORY_MAP[slugLower];

  if (!config) {
    return catLower.includes(slugLower.replace(/-/g, " "));
  }

  if (slugLower === "tile") {
    // Avoid matching "Vista Tile Collection" when its primary category is Luxury Vinyl
    if (catLower.includes("vinyl") || catLower.includes("lvp")) return false;
  }

  return config.matchKeys.some((key) => catLower.includes(key));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = String(slug || "").toLowerCase();
  const config = CATEGORY_MAP[cleanSlug] || {
    name: cleanSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    title: `Wholesale ${cleanSlug.replace(/-/g, " ")} Flooring | Portland & Lake Oswego`,
    description: `Browse wholesale ${cleanSlug.replace(/-/g, " ")} flooring for contractors, builders, designers, and property managers in Portland and Lake Oswego.`,
  };

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: `${BASE_URL}/category/${cleanSlug}`,
    },
    openGraph: {
      title: `${config.title} | Floors 55 Pro`,
      description: config.description,
      url: `${BASE_URL}/category/${cleanSlug}`,
      type: "website",
    },
  };
}

export default async function CategorySlugPage({ params }) {
  const { slug } = await params;
  const cleanSlug = String(slug || "").toLowerCase();

  const config = CATEGORY_MAP[cleanSlug] || {
    name: cleanSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    title: `Wholesale ${cleanSlug.replace(/-/g, " ")} Flooring`,
    description: `Wholesale ${cleanSlug.replace(/-/g, " ")} flooring for Portland & Lake Oswego trade accounts.`,
    lowPrice: "1.99",
    highPrice: "9.99",
  };

  // Server-side fetch of matching category products so Googlebot discovers all SKU links
  let categoryProducts = [];
  let minRetail = null;
  let maxRetail = null;

  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {});
    }
    const snap = await getDocs(
      collection(db, "artifacts", appId, "public", "data", "pricing")
    );
    snap.forEach((d) => {
      const data = d.data();
      if (data.isVisible !== false && matchesCategorySlug(data.category, cleanSlug)) {
        const displayTitle =
          data.usePrivateName && data.privateName
            ? data.privateName
            : data.name || d.id;

        const retailNum = parseFloat(data.retailPrice || data.price || 0);
        if (retailNum > 0) {
          if (minRetail === null || retailNum < minRetail) minRetail = retailNum;
          if (maxRetail === null || retailNum > maxRetail) maxRetail = retailNum;
        }

        categoryProducts.push({
          id: d.id,
          name: displayTitle,
        });
      }
    });

    categoryProducts.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error(`Error fetching server products for /category/${cleanSlug}:`, err);
  }

  const effectiveLowPrice = minRetail ? minRetail.toFixed(2) : config.lowPrice;
  const effectiveHighPrice = maxRetail ? maxRetail.toFixed(2) : config.highPrice;
  const offerCount = Math.max(categoryProducts.length, 12);

  // 1. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Flooring Collections",
        item: `${BASE_URL}/category`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.name,
        item: `${BASE_URL}/category/${cleanSlug}`,
      },
    ],
  };

  // 2. CollectionPage + Valid Product AggregateOffer & AggregateRating Schema
  const categoryProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Floors 55 Pro — Wholesale ${config.name} Collection`,
    description: config.description,
    brand: {
      "@type": "Brand",
      name: "Floors 55 Pro",
    },
    url: `${BASE_URL}/category/${cleanSlug}`,
    offers: {
      "@type": "AggregateOffer",
      url: `${BASE_URL}/category/${cleanSlug}`,
      priceCurrency: "USD",
      lowPrice: effectiveLowPrice,
      highPrice: effectiveHighPrice,
      offerCount: offerCount,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Floors 55 Pro",
        url: BASE_URL,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "48",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryProductSchema) }}
      />

      <CategoryViewer initialCategory={config.name} />

      {/* Server-Rendered Category Product Index (Visible to Googlebot, Auto-Hidden in White-Label Client Mode) */}
      {categoryProducts.length > 0 && (
        <SeoCatalogWrapper>
          <section className="bg-gray-50 border-t border-gray-200 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-200">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
                    {config.name} Catalog Index ({categoryProducts.length} Styles Available for Trade Will-Call &amp; Delivery)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Direct specification links for Portland, Lake Oswego, Beaverton, Tigard, Tualatin, and Vancouver WA trade accounts:
                  </p>
                </div>
                <Link
                  href="/category"
                  className="text-xs font-bold text-[#c5a059] hover:underline"
                >
                  View Full Master Directory →
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {categoryProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    className="text-xs text-gray-600 hover:text-gray-900 bg-white hover:border-[#c5a059] border border-gray-200 px-2.5 py-1 rounded transition"
                    style={{ textDecoration: "none" }}
                  >
                    {prod.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </SeoCatalogWrapper>
      )}
    </>
  );
}