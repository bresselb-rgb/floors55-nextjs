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
    
    // Map URL slugs back to the exact naming conventions you use in Firebase
    let categoryName = 'All Products';
    if (slug === 'luxury-vinyl') categoryName = 'Luxury Vinyl (LVP)';
    else if (slug === 'hot-buys') categoryName = 'Hot Buys';
    else categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return <CategoryViewer initialCategory={categoryName} />;
}