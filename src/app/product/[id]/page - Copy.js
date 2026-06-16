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
  const productData = { id: docSnap.id, ...docSnap.data() };
  productData.displayTitle = (productData.usePrivateName && productData.privateName) ? productData.privateName : (productData.name || 'Unnamed Product');

  // Pass the server-fetched data directly into our interactive viewer
  return <ProductViewer initialProduct={productData} />;
}