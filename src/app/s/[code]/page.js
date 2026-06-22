import { doc, getDoc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { db, appId } from "../../../lib/firebase";

// 1. THIS BUILDS THE PREVIEW CARD FOR iMESSAGE / FACEBOOK / SLACK
export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const code = unwrappedParams.code;
  
  try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'short_links', code);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
          const target = docSnap.data().target;
          
          // If they shared a product page, let's grab the actual product photo for the text message!
          if (target.includes('/product/')) {
             const productId = target.split('?')[0].split('/').pop();
             const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', productId);
             const prodSnap = await getDoc(prodRef);
             
             if (prodSnap.exists()) {
                 const pData = prodSnap.data();
                 const title = (pData.usePrivateName && pData.privateName) ? pData.privateName : (pData.name || 'Premium Flooring');
                 
                 // Dynamically reconstruct the image path so it shows up in the text message
                 const safeName = (pData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                 const safeSku = (pData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                 let folderName = 'images'; 
                 if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                 else if (safeName) folderName = safeName;
                 folderName = folderName.replace(/-+$/, '');

                 const displaySku = pData.colors?.[0]?.sku || '01';
                 const rawPath = `images/${folderName}/${pData.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
                 const imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

                 return {
                     title: `${title} | Floors 55`,
                     description: pData.desc || `View this premium flooring option in our catalog.`,
                     openGraph: {
                         title: `${title} | Floors 55`,
                         description: pData.desc || `View this premium flooring option in our catalog.`,
                         images: [imageUrl]
                     }
                 };
             }
          }
      }
  } catch (e) {
      console.error("Error generating metadata for short link:", e);
  }
  
  // 2. FALLBACK: If it's a general link or fails, show the standard Floors 55 Logo
  return {
      title: "Shared Presentation | Floors 55",
      description: "View this shared flooring presentation.",
      openGraph: {
          title: "Shared Presentation | Floors 55",
          description: "View this shared flooring presentation.",
          images: ['https://www.floors55pro.com/images/f55-pros-logo.jpg']
      }
  };
}

// 3. THIS HANDLES THE ACTUAL HUMAN USER REDIRECT
export default async function ShortLinkRedirect({ params }) {
  const unwrappedParams = await params;
  const code = unwrappedParams.code;
  
  try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'short_links', code);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.target) {
          redirect(data.target);
        }
      }
  } catch (e) {
      console.error("Error resolving short link:", e);
  }
  
  redirect('/category');
}