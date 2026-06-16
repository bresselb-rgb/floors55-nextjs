"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db, appId } from "../../../lib/firebase";

export default function ProposalPage({ params }) {
    const unwrappedParams = use(params);
    const proposalId = unwrappedParams.id;

    const [quote, setQuote] = useState(null);
    const [proProfile, setProProfile] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProposal = async () => {
            try {
                // 1. Fetch the specific quote
                const quoteRef = doc(db, 'artifacts', appId, 'public', 'data', 'pro_quotes', proposalId);
                const quoteSnap = await getDoc(quoteRef);

                if (!quoteSnap.exists()) {
                    if (isMounted) { setError(true); setIsLoading(false); }
                    return;
                }

                const quoteData = quoteSnap.data();
                if (isMounted) setQuote(quoteData);

                // 2. Fetch the Pro's branding profile
                if (quoteData.proId) {
                    const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', quoteData.proId);
                    const proSnap = await getDoc(proRef);
                    if (proSnap.exists() && isMounted) setProProfile(proSnap.data());
                }

                // 3. Fetch the latest product image/details just in case
                if (quoteData.productId) {
                    const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'pricing', quoteData.productId);
                    const prodSnap = await getDoc(prodRef);
                    if (prodSnap.exists() && isMounted) setProductDetails(prodSnap.data());
                }

            } catch (err) {
                console.error("Error loading proposal:", err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                signInAnonymously(auth).catch(() => {});
            } else if (isMounted && proposalId) {
                fetchProposal();
            }
        });

        return () => {
            isMounted = false;
            unsub();
        };
    }, [proposalId]);

    // Apply Magic Link styling so if they click the product, it keeps the branding
    useEffect(() => {
        if (proProfile) {
            const bName = proProfile.business || "Your Flooring Professional";
            const mgn = quote?.totals?.margin || proProfile.clientMargin || 20;
            const lUrl = proProfile.logoUrl || "";
            const bBg = proProfile.brandBgColor || "#ffffff";
            const bText = proProfile.brandTextColor || "#000000";

            sessionStorage.setItem('client_brand', bName);
            if (lUrl) sessionStorage.setItem('client_logo', lUrl);
            else sessionStorage.removeItem('client_logo');
            
            sessionStorage.setItem('client_bg', bBg);
            sessionStorage.setItem('client_text', bText);
            sessionStorage.setItem('client_margin', mgn);
            sessionStorage.setItem('magic_link_client', 'true');
        }
    }, [proProfile, quote]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black border-t-transparent mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Proposal...</p>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
                <h1 className="text-3xl font-black mb-2">Proposal Not Found</h1>
                <p className="text-gray-500 max-w-md">We couldn't locate this proposal. The link may be invalid or the project was removed by your contractor.</p>
            </div>
        );
    }

    const businessName = proProfile?.business || "Your Flooring Professional";
    const logoUrl = proProfile?.logoUrl || "";
    const brandBgColor = proProfile?.brandBgColor || "#ffffff";
    const brandTextColor = proProfile?.brandTextColor || "#000000";
    
    // Product Image Logic
    const safePrefix = quote.imgPrefix || productDetails?.imgPrefix || '';
    const displaySku = quote.colorSku || '01';
    const safeName = (quote.productName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeSku = (productDetails?.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let folderName = 'images'; 
    if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
    else if (safeName) folderName = safeName;
    folderName = folderName.replace(/-+$/, '');

    const mainType = quote.category === 'Carpet' ? 'main' : 'main';
    const rawPath = `images/${folderName}/${safePrefix}${displaySku}_${mainType}.jpg`.toLowerCase();
    const fbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
    const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

    // Dynamic Trim Text
    let trimParts = [];
    if (quote.addons?.trims?.details) {
        if (quote.addons.trims.details.standard > 0) trimParts.push('Transitions');
        if (quote.addons.trims.details.stairnose > 0) trimParts.push('Stair Noses');
        if (quote.addons.trims.details.quarterRound > 0) trimParts.push('Quarter Round');
    }
    const trimText = trimParts.length > 0 ? `Matching ${trimParts.join(', ').replace(/, ([^,]*)$/, ' and $1')}` : 'Matching transition moldings';

    // Magic Link Generation for Product Image
    let cmToken = '';
    try { cmToken = btoa((quote.totals.margin).toString()); } catch(e) {}
    const productLink = `/product/${quote.productId}?pro=${quote.proId}&cm=${cmToken}#${quote.productId}?color=${displaySku}`;

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* BRANDED HEADER */}
            <header className="border-b border-gray-200 py-6 px-6 text-center shadow-sm" style={{ backgroundColor: brandBgColor, color: brandTextColor }}>
                {logoUrl ? (
                    <img src={logoUrl} alt={businessName} className="h-16 md:h-20 w-auto mx-auto object-contain" />
                ) : (
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">{businessName}</h1>
                )}
                <p className="text-[10px] md:text-xs font-black italic tracking-widest uppercase mt-2 opacity-80">Official Turnkey Proposal</p>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
                
                {/* PROPOSAL TITLE BLOCK */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: brandBgColor }}></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Prepared For:</h2>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-none">{quote.clientName}</h1>
                            <p className="text-lg text-gray-500 mt-2 font-medium">{quote.projectName}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* THE SELECTED PRODUCT */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 flex flex-col md:flex-row group">
                    <Link href={productLink} className="md:w-2/5 h-64 md:h-auto relative overflow-hidden bg-gray-100 block" style={{ textDecoration: 'none' }}>
                        <img src={fbPath} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={e => e.target.src=TBD_IMG} alt={quote.productName} />
                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">
                            <span className="text-white font-bold text-xs">Color: {quote.colorName}</span>
                        </div>
                    </Link>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{quote.category}</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">{quote.productName}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-3">{productDetails?.desc || 'Premium flooring collection.'}</p>
                        <Link href={productLink} className="inline-block text-center font-black uppercase py-3 px-6 rounded-xl transition text-xs tracking-widest w-full md:w-auto" style={{ textDecoration: 'none', backgroundColor: brandBgColor, color: brandTextColor, border: `1px solid ${brandTextColor}` }}>
                            View Photos & Specs
                        </Link>
                    </div>
                </div>

                {/* THE INCLUSIONS CHECKLIST */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">Project Inclusions</h3>
                    
                    <ul className="space-y-4 text-base text-gray-700">
                        {/* Material */}
                        <li className="flex gap-4 items-start">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                            <div>
                                <span className="font-bold text-gray-900 block">Premium Flooring Material</span>
                                <span className="text-sm text-gray-500">{Math.ceil(quote.measurements.coverageSqft)} sqft of {quote.productName} in {quote.colorName}.</span>
                            </div>
                        </li>
                        
                        {/* Pad */}
                        {quote.addons?.pad && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">Carpet Cushion</span>
                                    <span className="text-sm text-gray-500">{quote.addons.pad.name}.</span>
                                </div>
                            </li>
                        )}

                        {/* Trims */}
                        {quote.addons?.trims && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">Transitions & Moldings</span>
                                    <span className="text-sm text-gray-500">{trimText} included.</span>
                                </div>
                            </li>
                        )}

                        {/* Prep */}
                        {quote.services?.prep > 0 && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">Tear Out & Prep</span>
                                    <span className="text-sm text-gray-500">Removal of old flooring and subfloor preparation.</span>
                                </div>
                            </li>
                        )}

                        {/* Install */}
                        {quote.services?.installTotal > 0 && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">Professional Installation</span>
                                    <span className="text-sm text-gray-500">Expert installation of {quote.measurements.netSqft} net sqft.</span>
                                </div>
                            </li>
                        )}

                        {/* Delivery */}
                        {quote.services?.delivery > 0 && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">Materials Delivery</span>
                                    <span className="text-sm text-gray-500">Logistics and handling to job site.</span>
                                </div>
                            </li>
                        )}

                        {/* Custom Lines */}
                        {quote.services?.custom1 && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">{quote.services.custom1.name}</span>
                                </div>
                            </li>
                        )}
                        {quote.services?.custom2 && (
                            <li className="flex gap-4 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 mt-0.5">✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block">{quote.services.custom2.name}</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* THE GRAND TOTAL */}
                <div className="bg-gray-900 p-8 md:p-12 rounded-3xl shadow-2xl text-center md:text-right text-white">
                    <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Turnkey Project Total</p>
                    <p className="text-4xl md:text-6xl font-black font-mono text-white tracking-tight mb-2">
                        ${quote.totals.turnkeyRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Includes materials, accessories, and labor as detailed above.</p>
                </div>

            </main>

            {/* BRANDED FOOTER */}
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