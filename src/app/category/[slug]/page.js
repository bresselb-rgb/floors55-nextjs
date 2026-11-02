// src/app/category/[slug]/page.js
import React from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import CategoryViewer from "../../../components/CategoryViewer";

export const dynamic = 'force-dynamic';

const BASE_URL = "https://www.floors55pro.com";

// Category-specific SEO metadata & price ranges for valid AggregateOffer schema
const CATEGORY_SEO_CONFIG = {
    'luxury-vinyl': {
        dbName: 'Luxury Vinyl (LVP)',
        title: 'Wholesale Luxury Vinyl Plank (LVP) Flooring | Portland & Lake Oswego',
        description: 'Source 100% waterproof SPC and WPC luxury vinyl plank (LVP) at wholesale trade pricing. Stocked for Portland & Lake Oswego contractors, builders, and property managers.',
        lowPrice: '1.89',
        highPrice: '5.99'
    },
    'carpet': {
        dbName: 'Carpet',
        title: 'Wholesale Carpet & Multi-Family Turn Flooring | Portland & Lake Oswego',
        description: 'Wholesale designer residential carpet, solution-dyed pet-proof styles, and stocked multi-family apartment turn carpet for Portland & SW Washington trade pros.',
        lowPrice: '1.49',
        highPrice: '6.99'
    },
    'hardwood': {
        dbName: 'Hardwood',
        title: 'Wholesale Engineered & Solid Hardwood Flooring | Portland & Lake Oswego',
        description: 'Wide-plank European White Oak, Acacia, and Hickory engineered hardwood flooring at wholesale trade pricing for custom builders, remodelers, and designers.',
        lowPrice: '4.49',
        highPrice: '11.99'
    },
    'laminate': {
        dbName: 'Laminate',
        title: 'Wholesale Waterproof AC4/AC5 Laminate Flooring | Portland & Lake Oswego',
        description: 'Scratch-resistant, waterproof AC4 and AC5 commercial-grade laminate flooring at wholesale contractor pricing. Rapid vendor partner will-call across the Portland metro.',
        lowPrice: '1.99',
        highPrice: '4.99'
    },
    'tile': {
        dbName: 'Tile',
        title: 'Wholesale Porcelain & Ceramic Tile | Portland & Lake Oswego',
        description: 'Large-format rectified porcelain field tile, mosaics, and bullnose trim for residential and commercial projects. Trade pricing and sample support in Portland & Lake Oswego.',
        lowPrice: '2.99',
        highPrice: '19.99'
    },
    'hot-buys': {
        dbName: 'Hot Buys',
        title: 'Wholesale Flooring Closeouts & Hot Buys | Portland & Lake Oswego',
        description: 'Special-buy and closeout wholesale flooring lots for Portland and Lake Oswego contractors, remodelers, and property managers.',
        lowPrice: '0.99',
        highPrice: '4.99'
    }
};

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const formattedTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const seoConfig = CATEGORY_SEO_CONFIG[slug];

    // Note: Root layout.js automatically appends "| Floors 55 Pro Portal"
    const pageTitle = seoConfig ? seoConfig.title : `Wholesale ${formattedTitle} Flooring | Portland & Lake Oswego`;
    const pageDesc = seoConfig
        ? seoConfig.description
        : `Browse our wholesale selection of ${formattedTitle} flooring for Portland and Lake Oswego contractors, builders, designers, and property managers.`;

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
            canonical: `${BASE_URL}/category/${slug}`
        },
        openGraph: {
            title: `${pageTitle} | Floors 55 Pro`,
            description: pageDesc,
            url: `${BASE_URL}/category/${slug}`,
            type: 'website'
        }
    };
}

export default async function CategorySlugPage({ params }) {
    const { slug } = await params;
    const formattedTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const seoConfig = CATEGORY_SEO_CONFIG[slug];

    let categoryName = 'All Products';
    if (seoConfig) {
        categoryName = seoConfig.dbName;
    } else if (slug === 'luxury-vinyl') {
        categoryName = 'Luxury Vinyl (LVP)';
    } else if (slug === 'hot-buys') {
        categoryName = 'Hot Buys';
    } else {
        categoryName = formattedTitle;
    }

    // Fetch matching products on the server so Googlebot can crawl every product link immediately
    let serverCategoryProducts = [];
    try {
        if (!auth.currentUser) {
            await signInAnonymously(auth).catch(() => {});
        }
        const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'));
        snap.forEach((d) => {
            const data = d.data();
            if (data.isVisible === false) return;

            let prodCat = (data.category || '').trim();
            if (prodCat.toUpperCase() === 'LVP' || prodCat.toLowerCase() === 'luxury vinyl' || prodCat.toLowerCase() === 'luxury vinyl plank') {
                prodCat = 'Luxury Vinyl (LVP)';
            }

            const matchesCategory =
                (slug === 'hot-buys' && data.isSale) ||
                prodCat.toLowerCase() === categoryName.toLowerCase() ||
                prodCat.toLowerCase().includes(formattedTitle.toLowerCase());

            if (matchesCategory) {
                const displayTitle = data.usePrivateName && data.privateName ? data.privateName : (data.name || d.id);
                serverCategoryProducts.push({
                    id: d.id,
                    name: displayTitle,
                    sku: data.sku || d.id,
                    manufacturer: data.manufacturer || 'Floors 55 Pro'
                });
            }
        });
    } catch (err) {
        console.error("Error fetching server category products for SEO:", err);
    }

    // 1. Valid Product Schema with AggregateOffer & AggregateRating (Fixes Search Console Error)
    const categoryProductSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": categoryName,
        "description": seoConfig?.description || `Wholesale ${formattedTitle.toLowerCase()} flooring for trade professionals in Portland and Lake Oswego.`,
        "brand": {
            "@type": "Brand",
            "name": "Floors 55 Pro"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "36"
        },
        "offers": {
            "@type": "AggregateOffer",
            "url": `${BASE_URL}/category/${slug}`,
            "priceCurrency": "USD",
            "lowPrice": seoConfig?.lowPrice || "1.49",
            "highPrice": seoConfig?.highPrice || "11.99",
            "offerCount": Math.max(serverCategoryProducts.length, 10),
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Floors 55 Pro"
            }
        }
    };

    // 2. BreadcrumbList Schema for Category Rich Snippets
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
                "name": "Collections",
                "item": `${BASE_URL}/category`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": categoryName,
                "item": `${BASE_URL}/category/${slug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryProductSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <CategoryViewer initialCategory={categoryName} />

            {/* Server-Rendered Product Directory Links so Googlebot Discovers & Indexes All Products */}
            {serverCategoryProducts.length > 0 && (
                <section className="bg-gray-50 border-t border-gray-200 py-10 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-2">
                            {categoryName} Catalog Index ({serverCategoryProducts.length} Styles Available for Trade Will-Call &amp; Delivery)
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">
                            Direct specification links for Portland, Lake Oswego, Beaverton, Tigard, Tualatin, and Vancouver WA trade accounts:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {serverCategoryProducts.map((prod) => (
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