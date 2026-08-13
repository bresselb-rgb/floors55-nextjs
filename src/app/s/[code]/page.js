import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";

// Helper to ensure the server is authenticated before asking Firebase for data
const authenticateServer = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
    }
};

// 1. THIS BUILDS THE PREVIEW CARD FOR GOOGLE MESSAGES / iMESSAGE / FACEBOOK / SLACK
export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const code = unwrappedParams.code;
  
  await authenticateServer();
  
  try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'short_links', code);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
          const target = docSnap.data().target;
          
          // SCENARIO A: They shared a specific Product Page
          if (target.includes('/product/')) {
             const productId = target.split('?')[0].split('/').pop();
             const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', productId);
             const prodSnap = await getDoc(prodRef);
             
             if (prodSnap.exists()) {
                 const pData = prodSnap.data();
                 const title = (pData.usePrivateName && pData.privateName) ? pData.privateName : (pData.name || 'Premium Flooring');
                 
                 // FIX: Respect the database imageFolder field!
                 const safeName = (pData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                 const safeSku = (pData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                 let folderName = pData.imageFolder ? pData.imageFolder : 'images'; 
                 if (!pData.imageFolder) {
                     if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                     else if (safeName) folderName = safeName;
                     folderName = folderName.replace(/-+$/, '');
                 }

                 const displaySku = pData.colors?.[0]?.sku || '01';
                 const rawPath = `images/${folderName}/${pData.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
                 const imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

                 return {
                     title: `${title} | Floors 55`,
                     description: pData.desc || `View this premium flooring option in our catalog.`,
                     openGraph: {
                         title: `${title} | Floors 55`,
                         description: pData.desc || `View this premium flooring option in our catalog.`,
                         images: [{ url: imageUrl, width: 1200, height: 630 }],
                         type: 'website'
                     },
                     twitter: {
                         card: 'summary_large_image',
                         title: `${title} | Floors 55`,
                         description: pData.desc || `View this premium flooring option in our catalog.`,
                         images: [imageUrl]
                     }
                 };
             }
          }

          // SCENARIO B: They shared a Turnkey Proposal
          if (target.includes('/proposal/')) {
             const proposalId = target.split('?')[0].split('/').pop();
             const propRef = doc(db, 'artifacts', appId, 'public', 'data', 'pro_quotes', proposalId);
             const propSnap = await getDoc(propRef);
             
             if (propSnap.exists()) {
                 const pData = propSnap.data();
                 const title = `Project Proposal: ${pData.clientName}`;
                 
                 let imageUrl = 'https://www.floors55pro.com/images/f55-pros-logo.jpg';
                 if (pData.productId) {
                     const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', pData.productId);
                     const prodSnap = await getDoc(prodRef);
                     if (prodSnap.exists()) {
                         const prodData = prodSnap.data();
                         // FIX: Respect the database imageFolder field!
                         const safeName = (prodData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                         const safeSku = (prodData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                         let folderName = prodData.imageFolder ? prodData.imageFolder : 'images'; 
                         if (!prodData.imageFolder) {
                             if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                             else if (safeName) folderName = safeName;
                             folderName = folderName.replace(/-+$/, '');
                         }
                         const displaySku = pData.colorSku || prodData.colors?.[0]?.sku || '01';
                         const rawPath = `images/${folderName}/${prodData.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
                         imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
                     }
                 }
                 return {
                     title: `${title} | Floors 55`,
                     description: `View the custom flooring proposal for ${pData.projectName || 'your project'}.`,
                     openGraph: {
                         title: title,
                         description: `View the custom flooring proposal for ${pData.projectName || 'your project'}.`,
                         images: [{ url: imageUrl, width: 1200, height: 630 }],
                         type: 'website'
                     },
                     twitter: { card: 'summary_large_image', title, description: `View the custom flooring proposal for ${pData.projectName || 'your project'}.`, images: [imageUrl] }
                 };
             }
          }

          // SCENARIO C: They shared a Client Presentation Board
          if (target.includes('/client/')) {
             const boardSlug = target.split('?')[0].split('/').pop();
             const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where('slug', '==', boardSlug));
             const boardSnap = await getDocs(q);
             
             if (!boardSnap.empty) {
                 const bData = boardSnap.docs[0].data();
                 const title = `Project Presentation: ${bData.name}`;
                 
                 let imageUrl = 'https://www.floors55pro.com/images/f55-pros-logo.jpg';
                 if (bData.products && bData.products.length > 0) {
                      const firstProd = bData.products[0];
                      const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', firstProd.productId);
                      const prodSnap = await getDoc(prodRef);
                      if (prodSnap.exists()) {
                          const prodData = prodSnap.data();
                          // FIX: Respect the database imageFolder field!
                          const safeName = (prodData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          const safeSku = (prodData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          let folderName = prodData.imageFolder ? prodData.imageFolder : 'images'; 
                          if (!prodData.imageFolder) {
                              if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                              else if (safeName) folderName = safeName;
                              folderName = folderName.replace(/-+$/, '');
                          }
                          const displaySku = firstProd.colorSku || prodData.colors?.[0]?.sku || '01';
                          const rawPath = `images/${folderName}/${prodData.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
                          imageUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
                      }
                 }
                 return {
                     title: `${title} | Floors 55`,
                     description: `View the curated flooring options for ${bData.name}.`,
                     openGraph: {
                         title: title,
                         description: `View the curated flooring options for ${bData.name}.`,
                         images: [{ url: imageUrl, width: 1200, height: 630 }],
                         type: 'website'
                     },
                     twitter: { card: 'summary_large_image', title, description: `View the curated flooring options for ${bData.name}.`, images: [imageUrl] }
                 };
             }
          }
      }
  } catch (e) {
      console.error("Error generating metadata for short link:", e);
  }
  
  // FALLBACK: If it's a general link or fails, show the standard Floors 55 Logo
  return {
      title: "Shared Presentation | Floors 55",
      description: "View this shared flooring presentation.",
      openGraph: {
          title: "Shared Presentation | Floors 55",
          description: "View this shared flooring presentation.",
          images: [{ url: 'https://www.floors55pro.com/images/f55-pros-logo.jpg', width: 1200, height: 630 }],
          type: 'website'
      },
      twitter: {
          card: 'summary_large_image',
          title: "Shared Presentation | Floors 55",
          description: "View this shared flooring presentation.",
          images: ['https://www.floors55pro.com/images/f55-pros-logo.jpg']
      }
  };
}

// 2. THIS HANDLES THE ACTUAL HUMAN USER REDIRECT (Client-Side to preserve the Open Graph tags!)
export default async function ShortLinkRedirect({ params }) {
  const unwrappedParams = await params;
  const code = unwrappedParams.code;
  
  await authenticateServer();
  
  let targetUrl = null;

  try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'short_links', code);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.target) {
          targetUrl = data.target;
        }
      }
  } catch (e) {
      console.error("Error resolving short link:", e);
  }
  
  if (targetUrl) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
              {/* Meta refresh fallback for non-JS environments */}
              <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent mb-4"></div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Presentation...</p>
              {/* Immediate JS redirect for human users */}
              <script dangerouslySetInnerHTML={{ __html: `window.location.replace("${targetUrl}");` }} />
          </div>
      );
  }
  
  // If the short code wasn't found in the database
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <meta httpEquiv="refresh" content="0;url=/category" />
          <script dangerouslySetInnerHTML={{ __html: `window.location.replace("/category");` }} />
      </div>
  );
}