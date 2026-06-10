"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, appId } from "../../../lib/firebase";

export default function ClientBoardPage({ params }) {
    // Next.js 15+ safely unwraps params via React.use()
    const unwrappedParams = React.use(params);
    const slug = unwrappedParams.slug;

    const [board, setBoard] = useState(null);
    const [proProfile, setProProfile] = useState(null);
    const [liveProducts, setLiveProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                // 1. Find the board by its unique slug
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where("slug", "==", slug));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setError(true);
                    setIsLoading(false);
                    return;
                }

                const boardData = snapshot.docs[0].data();
                setBoard({ id: snapshot.docs[0].id, ...boardData });

                // 2. Fetch the Pro's profile (for Brand Name and Markup Margin)
                let profileData = null;
                if (boardData.proId) {
                    const proDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', boardData.proId));
                    if (proDoc.exists()) {
                        profileData = proDoc.data();
                        setProProfile(profileData);
                    }
                }

                // 3. Fetch the live product documents to ensure pricing and images are accurate
                if (boardData.products && boardData.products.length > 0) {
                    const prodPromises = boardData.products.map(async (savedItem) => {
                        const pDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', savedItem.productId));
                        if (pDoc.exists()) {
                            return {
                                savedDetails: savedItem, // Contains the specific color picked
                                fullData: { id: pDoc.id, ...pDoc.data() } // Live catalog data
                            };
                        }
                        return null;
                    });
                    
                    const resolvedProds = await Promise.all(prodPromises);
                    // Filter out any products that might have been deleted from the catalog
                    setLiveProducts(resolvedProds.filter(Boolean));
                }
            } catch (err) {
                console.error("Error loading client board:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchBoardData();
    }, [slug]);

    if (isLoading) {
        return (
            <main className="bg-gray-50 flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Presentation...</p>
                </div>
            </main>
        );
    }

    if (error || !board) {
        return (
            <main className="bg-gray-50 flex-1 flex items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-3">Project Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't locate this project board. The link may be invalid or the project was removed by the contractor.</p>
                </div>
            </main>
        );
    }

    const brandName = proProfile?.business || "Premium Flooring Portal";
    const clientMargin = proProfile?.clientMargin !== undefined ? proProfile.clientMargin : 20;

    // We encode the margin and brand name to pass to the product page securely via URL
    const encodedMargin = btoa(clientMargin.toString());
    const encodedBrand = btoa(brandName);

    const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

    return (
        <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1 pb-24">
            
            {/* Elegant Hero Header for the Homeowner */}
            <header className="bg-black text-white py-16 md:py-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <p className="text-gold uppercase tracking-[0.2em] font-bold mb-3 text-[10px] md:text-xs">
                        Curated Exclusively For You By
                    </p>
                    <h2 className="text-xl md:text-2xl font-black text-white/80 mb-6">
                        {brandName}
                    </h2>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        {board.name}
                    </h1>
                    <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                        Review the tailored flooring selections below. Click any product to view room scenes, exact pricing, and full specifications.
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
                
                <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-bold">Selected Options ({liveProducts.length})</h3>
                </div>

                {liveProducts.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
                        <div className="text-4xl mb-4">📂</div>
                        <p className="text-gray-500 font-bold">No products have been added to this board yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {liveProducts.map((item, idx) => {
                            const p = item.fullData;
                            const saved = item.savedDetails;

                            // Calculate their exact retail price based on the Pro's margin
                            const finalPrice = (p.price * (1 + clientMargin / 100)).toFixed(2);
                            
                            // Reconstruct the image path
                            const safeName = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const safeSku = (p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            let folderName = 'images';
                            if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                            else if (safeName) folderName = safeName;
                            folderName = folderName.replace(/-+$/, '');

                            const sType = p.category === 'Carpet' ? 'main' : 'main'; // Use main image
                            const rawPath = `images/${folderName}/${p.imgPrefix || ''}${saved.colorSku}_${sType}.jpg`.toLowerCase();
                            const fbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

                            // Magic Link URL to product page
                            const productUrl = `/product/${p.id}?color=${saved.colorSku}&cm=${encodedMargin}&cb=${encodedBrand}`;

                            return (
                                <Link key={idx} href={productUrl} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative" style={{ textDecoration: 'none' }}>
                                    
                                    {/* Image Container */}
                                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
                                        <img 
                                            src={fbPath} 
                                            alt={p.displayTitle} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                            onError={(e) => e.target.src = TBD_IMG}
                                        />
                                        {/* Floating Category Badge */}
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-800 shadow-sm">
                                            {p.category}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-gold transition-colors">{p.displayTitle}</h3>
                                            <div className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                                                Selected Color: <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{saved.colorName}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-6">{p.desc || "Premium flooring collection."}</p>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Material Price</span>
                                                <span className="text-xl font-black text-gray-900 font-mono">${finalPrice} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                            </div>
                                            <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-gold group-hover:text-black transition-colors shadow-sm">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Footer instructions for homeowner */}
                <div className="mt-16 bg-gray-900 text-white p-8 md:p-12 rounded-3xl text-center shadow-xl">
                    <h3 className="text-2xl font-black mb-4">Ready to move forward?</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        If you love one of these options, click on the product to view detailed specifications, or reach out directly to <strong>{brandName}</strong> to finalize your project measurements and schedule installation.
                    </p>
                </div>

            </div>
        </main>
    );
}