"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db, appId } from "../../../lib/firebase";

export default function ClientBoardPage() {
    const params = useParams();
    const slug = params?.slug;

    const [board, setBoard] = useState(null);
    const [proProfile, setProProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchBoardData = async () => {
            try {
                // 1. Find the board by its unique slug
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where('slug', '==', slug));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    if (isMounted) { setError(true); setIsLoading(false); }
                    return;
                }

                const boardDoc = querySnapshot.docs[0];
                const boardData = boardDoc.data();
                if (isMounted) setBoard(boardData);

                // 2. Fetch the Pro's Profile (for Margin and Business Name)
                if (boardData.proId) {
                    const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', boardData.proId);
                    const proSnap = await getDoc(proRef);
                    if (proSnap.exists()) {
                        if (isMounted) setProProfile(proSnap.data());
                    }
                }

                // 3. Fetch the specific products
                if (boardData.products && boardData.products.length > 0) {
                    const prodPromises = boardData.products.map(async (savedItem) => {
                        const pDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', savedItem.productId));
                        if (pDoc.exists()) {
                            return {
                                id: pDoc.id,
                                ...pDoc.data(),
                                savedColorSku: savedItem.colorSku,
                                savedColorName: savedItem.colorName
                            };
                        }
                        return null;
                    });
                    const resolvedProducts = (await Promise.all(prodPromises)).filter(p => p !== null);
                    if (isMounted) setProducts(resolvedProducts);
                }

            } catch (err) {
                console.error("Error loading client board:", err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        // Authenticate the homeowner anonymously so Firebase allows them to read the board
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                signInAnonymously(auth).catch(() => {});
            } else if (isMounted && slug) {
                fetchBoardData();
            }
        });

        return () => {
            isMounted = false;
            unsub();
        };
    }, [slug]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black border-t-transparent mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Presentation...</p>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
                <h1 className="text-3xl font-black mb-2">Project Not Found</h1>
                <p className="text-gray-500 max-w-md">We couldn&apos;t locate this project board. The link may be invalid or the project was removed by the contractor.</p>
            </div>
        );
    }

    const businessName = proProfile?.business || "Your Flooring Professional";
    const margin = proProfile?.clientMargin || 20;
    
    // Safely encode state to pass to product page via URL
    let cmToken = '';
    let cbToken = '';
    try {
        cmToken = btoa(margin.toString());
        cbToken = btoa(businessName);
    } catch(e) {}

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Custom White-Labeled Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-6 text-center shadow-sm">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-gray-900 leading-none">{businessName}</h1>
                <p className="text-red-600 text-[10px] md:text-xs font-black italic tracking-widest uppercase mt-1">Curated Project Presentation</p>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black mb-3">{board.name}</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">We have hand-selected the following premium flooring options specifically for your project. Click on any product to view details, specifications, and room scenes.</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm italic bg-white border border-gray-200 rounded-2xl">No products have been added to this board yet.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(p => {
                            const finalPrice = (p.price * (1 + margin / 100)).toFixed(2);
                            
                            const safeDesc = p.desc || 'Premium flooring collection.';
                            const safePrefix = p.imgPrefix || '';
                            const displaySku = p.savedColorSku || (p.colors?.[0]?.sku || '01');
                            
                            const safeName = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const safeSku = (p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            let folderName = 'images'; 
                            if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                            else if (safeName) folderName = safeName;
                            folderName = folderName.replace(/-+$/, '');

                            const mainType = p.category === 'Carpet' ? 'main' : 'main';
                            const rawPath = `images/${folderName}/${safePrefix}${displaySku}_${mainType}.jpg`.toLowerCase();
                            const fbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
                            const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

                            const productLink = `/product/${p.id}?cm=${cmToken}&cb=${cbToken}#${p.id}?color=${displaySku}`;

                            return (
                                <div key={p.id + displaySku} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition group">
                                    <Link href={productLink} className="block overflow-hidden h-64 bg-gray-50 relative" style={{ textDecoration: 'none' }}>
                                        <img src={fbPath} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={e => e.target.src=TBD_IMG} />
                                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <span className="text-white font-bold text-sm bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">Color: {p.savedColorName}</span>
                                        </div>
                                    </Link>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1 mb-6">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                <span>{p.category}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">
                                                <Link href={productLink} style={{ textDecoration: 'none', color: 'inherit' }}>{p.displayTitle}</Link>
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mt-2">{safeDesc}</p>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Project Price</span>
                                                <span className="text-xl font-black text-gray-900 font-mono">${finalPrice} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                            </div>
                                            <Link href={productLink} className="w-full block text-center bg-black hover:bg-gold text-white hover:text-black font-black uppercase py-3 rounded-xl transition text-xs tracking-widest" style={{ textDecoration: 'none' }}>
                                                View Details & Photos
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="bg-black text-white py-12 text-center mt-auto">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} {businessName}. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}