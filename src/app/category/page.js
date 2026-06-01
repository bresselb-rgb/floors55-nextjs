import CategoryViewer from "../../components/CategoryViewer";

// 1. Next.js Magic: This instantly injects perfect SEO tags into the <head> of the website!
export const metadata = {
  title: "All Flooring Collections | Floors 55",
  description: "Browse our complete premium selection of hardwood, luxury vinyl, carpet, and tile.",
};

export default function AllCategoriesPage() {
  // 2. It passes "All Products" down to your new interactive UI!
  return <CategoryViewer initialCategory="All Products" />;
}