"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db, appId } from "../../../lib/firebase";

export default function ClientBoardPage({ params }) {
    const unwrappedParams = use(params);
    const slug = unwrappedParams.slug;

    const [board, setBoard] = useState(null);
    const [proProfile, setProProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchBoardData = async () => {
            try {
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where('slug', '==', slug));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    if (isMounted) { setError(true); setIsLoading(false); }
                    return;
                }

                const boardDoc = querySnapshot.docs[0];
                const boardData = boardDoc.data();
                if (isMounted) setBoard(boardData);

                if (boardData.proId) {
                    const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', boardData.proId);
                    const proSnap = await getDoc(proRef);
                    if (proSnap.exists() && isMounted) setProProfile(proSnap.data());
                }

                if (boardData.products && boardData.products.length > 0) {
                    const prodPromises = boardData.products.map(async (savedItem) => {
                        const pDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', savedItem.productId));
                        if (pDoc.exists()) {
                            return {
                                id: pDoc.id,
                                ...pDoc.data(),
                                savedColorSku: savedItem.colorSku,
                                savedColorName: savedItem.colorName,
                                quote: savedItem.quote || null 
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

    useEffect(() => {
        if (board) {
            const bName = board.businessName || proProfile?.business || "Your Flooring Professional";
            const mgn = board.margin !== undefined ? board.margin : (proProfile?.clientMargin || 20);
            const lUrl = board.logoUrl || proProfile?.logoUrl || "";
            const bBg = board.brandBgColor || proProfile?.brandBgColor || "#ffffff";
            const bText = board.brandTextColor || proProfile?.brandTextColor || "#000000";

            sessionStorage.setItem('client_brand', bName);
            if (lUrl) sessionStorage.setItem('client_logo', lUrl);
            else sessionStorage.removeItem('client_logo');
            
            sessionStorage.setItem('client_bg', bBg);
            sessionStorage.setItem('client_text', bText);
            sessionStorage.setItem('client_margin', mgn);
            sessionStorage.setItem('magic_link_client', 'true');
        }
    }, [board, proProfile]);

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
                <p className="text-gray-500 max-w-md">We couldn't locate this project board. The link may be invalid or the project was removed by the contractor.</p>
            </div>
        );
    }

    const businessName = board?.businessName || proProfile?.business || "Your Flooring Professional";
    const margin = board?.margin !== undefined ? board.margin : (proProfile?.clientMargin || 20);
    const logoUrl = board?.logoUrl || proProfile?.logoUrl || "";
    const brandBgColor = board?.brandBgColor || proProfile?.brandBgColor || "#ffffff";
    const brandTextColor = board?.brandTextColor || proProfile?.brandTextColor || "#000000";
    
    let cmToken = '';
    let cbToken = '';
    try {
        cmToken = btoa(margin.toString());
        cbToken = btoa(businessName);
    } catch(e) {}

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <header className="border-b border-gray-200 py-6 px-6 text-center shadow-sm" style={{ backgroundColor: brandBgColor, color: brandTextColor }}>
                {logoUrl ? (
                    <img src={logoUrl} alt={businessName} className="h-16 md:h-20 w-auto mx-auto object-contain" />
                ) : (
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">{businessName}</h1>
                )}
                <p className="text-[10px] md:text-xs font-black italic tracking-widest uppercase mt-2 opacity-80">Curated Project Presentation</p>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black mb-3">{board.name}</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">We have hand-selected the following premium flooring options specifically for your project. Click on any product to view details, specifications, and room scenes.</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm italic bg-white border border-gray-200 rounded-2xl">No products have been added to this board yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {products.map(p => {
                            const displayTitle = (p.usePrivateName && p.privateName) ? p.privateName : (p.name || 'Unnamed Product');
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

                            const productLink = `/product/${p.id}?pro=${board.proId || ''}&cm=${cmToken}#${p.id}?color=${displaySku}`;

                            const hasQuote = p.quote && p.quote.totals;

                            // Format the trim text dynamically based on what they selected
                            let trimParts = [];
                            if (p.quote?.addons?.trims?.details) {
                                if (p.quote.addons.trims.details.standard > 0) trimParts.push('Transitions');
                                if (p.quote.addons.trims.details.stairnose > 0) trimParts.push('Stair Noses');
                                if (p.quote.addons.trims.details.quarterRound > 0) trimParts.push('Quarter Round');
                            }
                            const trimText = trimParts.length > 0 ? `Matching ${trimParts.join(', ').replace(/, ([^,]*)$/, ' and $1')}` : 'Matching transition moldings';

                            return (
                                <div key={p.id + displaySku} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition group">
                                    <Link href={productLink} className="block overflow-hidden h-64 bg-gray-50 relative" style={{ textDecoration: 'none' }}>
                                        <img src={fbPath} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={e => e.target.src=TBD_IMG} />
                                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <span className="text-white font-bold text-sm bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">Color: {p.savedColorName}</span>
                                        </div>
                                    </Link>

                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                <span>{p.category}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight mb-6">
                                                <Link href={productLink} style={{ textDecoration: 'none', color: 'inherit' }}>{displayTitle}</Link>
                                            </h3>

                                            {hasQuote ? (
                                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-3">Proposal Inclusions</h4>
                                                    <ul className="space-y-2.5 text-sm text-gray-700">
                                                        <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>{Math.ceil(p.quote.measurements.coverageSqft)} sqft of {displayTitle} in {p.savedColorName}</span></li>
                                                        
                                                        {p.quote.addons?.pad && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>{p.quote.addons.pad.name}</span></li>}
                                                        {p.quote.addons?.trims && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>{trimText}</span></li>}
                                                        
                                                        {p.quote.services?.prep > 0 && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>Tear out and subfloor preparation</span></li>}
                                                        {p.quote.services?.installTotal > 0 && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>Professional installation</span></li>}
                                                        {p.quote.services?.delivery > 0 && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>Materials delivery & logistics</span></li>}
                                                        
                                                        {p.quote.services?.custom1 && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>{p.quote.services.custom1.name}</span></li>}
                                                        {p.quote.services?.custom2 && <li className="flex gap-2 items-start"><span className="text-emerald-500 font-bold">✓</span> <span>{p.quote.services.custom2.name}</span></li>}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm line-clamp-3 mb-6">{p.desc || 'Premium flooring collection.'}</p>
                                            )}
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-gray-100">
                                            {hasQuote ? (
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm text-gray-400 uppercase font-black tracking-wider">Turnkey Project Total</span>
                                                    <span className="text-3xl font-black text-gray-900 font-mono">${p.quote.totals.turnkeyRetail.toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-xs text-gray-400 uppercase font-black tracking-wider">Material Price</span>
                                                    <span className="text-2xl font-black text-gray-900 font-mono">${(p.price * (1 + margin / 100)).toFixed(2)} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                                </div>
                                            )}
                                            
                                            <Link href={productLink} className="w-full block text-center hover:opacity-80 font-black uppercase py-4 rounded-xl transition text-xs tracking-widest mt-2 shadow-sm hover:shadow-md" style={{ textDecoration: 'none', backgroundColor: brandBgColor, color: brandTextColor, border: `1px solid ${brandTextColor}` }}>
                                                View Product Details & Photos
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="py-12 text-center mt-auto border-t border-gray-200" style={{ backgroundColor: brandBgColor, color: brandTextColor }}>
                {logoUrl && (
                    <img src={logoUrl} alt={businessName} className="h-12 w-auto mx-auto object-contain mb-4 opacity-80" style={{ filter: brandBgColor.toLowerCase() === '#ffffff' ? 'none' : 'brightness(0) invert(1) opacity(0.8)' }} />
                )}
                <p className="text-xs uppercase tracking-widest font-bold opacity-80">
                    © {new Date().getFullYear()} {businessName}. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}