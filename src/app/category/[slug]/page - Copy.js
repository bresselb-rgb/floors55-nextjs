import CategoryViewer from "../../../components/CategoryViewer";

// 1. Next.js Magic: This dynamically injects SEO tags based on the exact URL!
export async function generateMetadata({ params }) {
    const { slug } = await params;
    
    // Convert "luxury-vinyl" into "Luxury Vinyl" for Google
    const formattedTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    return {
        title: `${formattedTitle} Flooring | Floors 55`,
        description: `Browse our premium selection of ${formattedTitle} flooring. Filter by price, search, and find the perfect material for your project.`,
    };
}

// 2. The Server Page: Maps the URL slug to the correct filter
export default async function CategorySlugPage({ params }) {
    const { slug } = await params;
    
    const formattedTitle = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    // Map URL slugs back to the exact naming conventions you use in Firebase
    let categoryName = 'All Products';
    if (slug === 'luxury-vinyl') categoryName = 'Luxury Vinyl (LVP)';
    else if (slug === 'hot-buys') categoryName = 'Hot Buys';
    else categoryName = formattedTitle;

    // SEO: Dynamically generate Local Business Schema with OfferCatalog
    const categorySchema = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        "name": "Floors 55 Pro",
        "description": `Wholesale ${formattedTitle.toLowerCase()} flooring portal for trade professionals in Portland and Lake Oswego.`,
        "areaServed": [
            { "@type": "City", "name": "Portland", "region": "OR" },
            { "@type": "City", "name": "Lake Oswego", "region": "OR" }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": formattedTitle,
            "description": `Premium wholesale ${formattedTitle.toLowerCase()} collections.`,
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": categoryName,
                        "category": "Flooring Materials"
                    }
                }
            ]
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
            />
            <CategoryViewer initialCategory={categoryName} />
        </>
    );
}