// src/app/proposal/[id]/page.js
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

        const fetchProposalData = async () => {
            try {
                const quoteRef = doc(db, 'artifacts', appId, 'public', 'data', 'pro_quotes', proposalId);
                const quoteSnap = await getDoc(quoteRef);

                if (!quoteSnap.exists()) {
                    if (isMounted) { setError(true); setIsLoading(false); }
                    return;
                }

                const quoteData = quoteSnap.data();
                if (isMounted) setQuote(quoteData);

                if (quoteData.proId) {
                    const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', quoteData.proId);
                    const proSnap = await getDoc(proRef);
                    if (proSnap.exists() && isMounted) setProProfile(proSnap.data());
                }

                if (quoteData.productId) {
                    const pDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', quoteData.productId));
                    if (pDoc.exists() && isMounted) setProductDetails(pDoc.data());
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
                fetchProposalData();
            }
        });

        return () => {
            isMounted = false;
            unsub();
        };
    }, [proposalId]);

    useEffect(() => {
        if (proProfile && quote) {
            const isAbbey = quote.brandOverride === 'abbey';
            const isF55 = quote.brandOverride === 'f55' || (quote.brandOverride !== 'abbey' && quote.useCustomBranding === false);

            const ABBEY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fabbey-logo.png?alt=media";

            const bName = isAbbey ? "Abbey Carpet & Floor" : (isF55 ? "Floors 55" : (proProfile.business || "Your Flooring Professional"));
            const mgn = quote?.totals?.margin || proProfile.clientMargin || 20;
            const lUrl = isAbbey ? ABBEY_LOGO_URL : (isF55 ? "" : (proProfile.logoUrl || ""));
            const bBg = isAbbey ? "#003366" : (isF55 ? "#000000" : (proProfile.brandBgColor || "#ffffff"));
            const bText = isAbbey ? "#ffffff" : (isF55 ? "#ffffff" : (proProfile.brandTextColor || "#000000"));

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
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 print:hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black border-t-transparent mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Proposal...</p>
            </div>
        );
    }

    if (error || !quote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center print:hidden">
                <h1 className="text-3xl font-black mb-2">Proposal Not Found</h1>
                <p className="text-gray-500 max-w-md">We couldn't locate this proposal. The link may be invalid or the project was removed by your contractor.</p>
            </div>
        );
    }

    const isAbbey = quote.brandOverride === 'abbey';
    const isF55 = quote.brandOverride === 'f55' || (quote.brandOverride !== 'abbey' && quote.useCustomBranding === false);

    const ABBEY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fabbey-logo.png?alt=media";

    const businessName = isAbbey ? "Abbey Carpet & Floor" : (isF55 ? "Floors 55" : (proProfile?.business || "Your Flooring Professional"));
    const logoUrl = isAbbey ? ABBEY_LOGO_URL : (isF55 ? "" : (proProfile?.logoUrl || ""));
    const brandBgColor = isAbbey ? "#003366" : (isF55 ? "#000000" : (proProfile?.brandBgColor || "#ffffff"));
    const brandTextColor = isAbbey ? "#ffffff" : (isF55 ? "#ffffff" : (proProfile?.brandTextColor || "#000000"));
    
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
    
    // Generate clean link (drops the proID if they disabled custom branding so product page loads cleanly)
    let productLink = `/product/${quote.productId}?color=${displaySku}&cm=${cmToken}`;
    if (!isF55 && !isAbbey && quote.proId) {
        productLink += `&pro=${quote.proId}`;
    } else if (isAbbey) {
        productLink += `&cb=${btoa('Abbey Carpet & Floor')}`;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col print:bg-white">
            {/* Force tight page margins for printing so everything fits on one page */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0.4in; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}} />

            {/* BRANDED HEADER - Squashed for print */}
            <header className="border-b border-gray-200 py-6 px-6 print:py-3 print:px-2 text-center shadow-sm print:shadow-none" style={{ backgroundColor: brandBgColor, color: brandTextColor }}>
                {logoUrl ? (
                    <img src={logoUrl} alt={businessName} className="h-16 md:h-20 print:h-10 w-auto mx-auto object-contain" />
                ) : (
                    <h1 className="text-2xl md:text-3xl print:text-xl font-black uppercase tracking-tighter leading-none m-0">{businessName}</h1>
                )}
                <p className="text-[10px] md:text-xs print:text-[8px] font-black italic tracking-widest uppercase mt-2 print:mt-1 opacity-80 m-0">Official Turnkey Proposal</p>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 print:py-4 print:px-0">
                
                {/* ACTION BAR (Hidden on PDF) */}
                <div className="flex justify-end mb-6 print:hidden">
                    <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors flex items-center gap-2 outline-none cursor-pointer shadow-md">
                        <span>📄</span> Download PDF / Print
                    </button>
                </div>

                {/* PROPOSAL TITLE BLOCK - Squashed for print */}
                <div className="bg-white p-8 md:p-10 print:p-4 rounded-3xl print:rounded-xl shadow-sm border border-gray-100 mb-8 print:mb-3 relative overflow-hidden print:border-gray-300 print:shadow-none">
                    <div className="absolute top-0 left-0 w-2 h-full print:w-1" style={{ backgroundColor: brandBgColor }}></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 print:gap-2">
                        <div>
                            <h2 className="text-[10px] print:text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 print:mb-0.5">Prepared For:</h2>
                            <h1 className="text-3xl md:text-4xl print:text-xl font-black text-gray-900 leading-none">{quote.clientName}</h1>
                            <p className="text-lg print:text-xs text-gray-500 mt-2 print:mt-0.5 font-medium">{quote.projectName}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-xs print:text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 print:mb-0">Date Issued</p>
                            <p className="text-sm print:text-[10px] font-bold text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* THE SELECTED PRODUCT - Squashed for print */}
                <div className="bg-white rounded-3xl print:rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 print:mb-3 flex flex-col md:flex-row group print:border-gray-300 print:shadow-none print:break-inside-avoid">
                    <Link href={productLink} className="md:w-2/5 print:w-1/4 h-64 md:h-auto print:h-24 relative overflow-hidden bg-gray-100 block print:pointer-events-none" style={{ textDecoration: 'none' }}>
                        <img src={fbPath} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" onError={e => e.target.src=TBD_IMG} alt={quote.productName} />
                        <div className="absolute bottom-4 left-4 print:bottom-1 print:left-1 bg-black/50 backdrop-blur-md px-3 py-1 print:px-1.5 print:py-0.5 rounded-full border border-white/20 shadow-sm print:bg-black/70">
                            <span className="text-white font-bold text-xs print:text-[7px]">Color: {quote.colorName}</span>
                        </div>
                    </Link>
                    <div className="p-8 print:p-4 flex-1 flex flex-col justify-center">
                        <div className="text-[10px] print:text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-2 print:mb-0.5">{quote.category}</div>
                        <h3 className="text-2xl print:text-sm font-black text-gray-900 mb-4 print:mb-1">{quote.productName}</h3>
                        <p className="text-gray-500 text-sm print:text-[9px] print:leading-tight mb-6 print:mb-0 line-clamp-3 print:line-clamp-2">{productDetails?.desc || 'Premium flooring collection.'}</p>
                        <Link href={productLink} className="inline-block text-center font-black uppercase py-3 px-6 rounded-xl transition text-xs tracking-widest w-full md:w-auto print:hidden" style={{ textDecoration: 'none', backgroundColor: brandBgColor, color: brandTextColor, border: `1px solid ${brandTextColor}` }}>
                            View Photos & Specs
                        </Link>
                    </div>
                </div>

                {/* THE INCLUSIONS CHECKLIST - Squashed for print */}
                <div className="bg-white p-8 md:p-10 print:p-4 rounded-3xl print:rounded-xl shadow-sm border border-gray-100 mb-8 print:mb-3 print:border-gray-300 print:shadow-none print:break-inside-avoid">
                    <h3 className="text-xl print:text-sm font-black text-gray-900 mb-6 print:mb-2 border-b border-gray-100 pb-4 print:pb-1">Project Inclusions</h3>
                    
                    <ul className="space-y-4 print:space-y-1.5 text-base print:text-[10px] text-gray-700">
                        {/* Material */}
                        <li className="flex gap-4 print:gap-2 items-start">
                            <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                            <div>
                                <span className="font-bold text-gray-900 block print:leading-tight">Premium Flooring Material</span>
                                <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">{Math.ceil(quote.measurements.netSqft)} net sqft of {quote.productName} in {quote.colorName}.</span>
                            </div>
                        </li>
                        
                        {/* Pad */}
                        {quote.addons?.pad && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">Carpet Cushion</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">{quote.addons.pad.name}.</span>
                                </div>
                            </li>
                        )}

                        {/* Custom Addons / Trims */}
                        {quote.addons?.customList?.items?.map((item, idx) => (
                            <li key={idx} className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">{item.name}</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">Qty: {item.qty} Included.</span>
                                </div>
                            </li>
                        ))}

                        {/* Legacy Trims */}
                        {!quote.addons?.customList && quote.addons?.trims && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">Transitions & Moldings</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">{trimText} included.</span>
                                </div>
                            </li>
                        )}

                        {/* Prep */}
                        {quote.services?.prep > 0 && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">Tear Out & Prep</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">Removal of old flooring and subfloor preparation.</span>
                                </div>
                            </li>
                        )}

                        {/* Install */}
                        {quote.services?.installTotal > 0 && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">Professional Installation</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">Expert installation of {quote.measurements.netSqft} net sqft.</span>
                                </div>
                            </li>
                        )}

                        {/* Delivery */}
                        {quote.services?.delivery > 0 && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">Materials Delivery</span>
                                    <span className="text-sm print:text-[9px] text-gray-500 print:leading-tight">Logistics and handling to job site.</span>
                                </div>
                            </li>
                        )}

                        {/* Custom Lines */}
                        {quote.services?.custom1 && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">{quote.services.custom1.name}</span>
                                </div>
                            </li>
                        )}
                        {quote.services?.custom2 && (
                            <li className="flex gap-4 print:gap-2 items-start">
                                <span className="w-6 h-6 print:w-4 print:h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 print:mt-0 print:border print:text-[8px]" style={{ backgroundColor: isAbbey ? '#eff6ff' : '#d1fae5', color: isAbbey ? '#1e3a8a' : '#059669', borderColor: isAbbey ? '#1e3a8a' : '#059669' }}>✓</span> 
                                <div>
                                    <span className="font-bold text-gray-900 block print:leading-tight">{quote.services.custom2.name}</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>

                {/* THE GRAND TOTAL - Squashed for print */}
                <div className="bg-gray-900 p-8 md:p-12 print:p-4 rounded-3xl print:rounded-xl shadow-2xl text-center md:text-right text-white mb-12 print:mb-3 print:shadow-none print:bg-gray-100 print:text-black print:border print:border-gray-300 print:break-inside-avoid">
                    <p className="text-xs md:text-sm print:text-[9px] font-bold text-gray-400 print:text-gray-500 uppercase tracking-widest mb-2 print:mb-0.5">Turnkey Project Total</p>
                    <p className="text-4xl md:text-6xl print:text-2xl font-black font-mono text-white print:text-black tracking-tight mb-2 print:mb-0.5">
                        ${quote.totals.turnkeyRetail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] print:text-[7px] text-gray-500 uppercase tracking-widest font-bold m-0">Includes materials, accessories, and labor as detailed above.</p>
                </div>

                {/* TERMS AND CONDITIONS - Squashed for print */}
                <div className="bg-white p-8 md:p-10 print:p-4 rounded-3xl print:rounded-xl shadow-sm border border-gray-100 print:border-gray-300 print:shadow-none print:break-inside-avoid">
                    <h3 className="text-lg print:text-xs font-black text-gray-900 mb-4 print:mb-1.5 border-b border-gray-100 print:border-gray-200 pb-2 print:pb-1">Terms & Conditions</h3>
                    <ul className="text-xs print:text-[8px] text-gray-600 space-y-3 print:space-y-1 list-disc pl-4 leading-relaxed print:leading-tight m-0 mb-8 print:mb-4">
                        <li><strong>Proposal Validity:</strong> This proposal and its pricing are valid for 30 days from the date issued. Following this period, material costs are subject to manufacturer price increases.</li>
                        <li><strong>Site Conditions & Acclimation:</strong> The job site must be climate-controlled (65-75°F with 35-55% humidity) with an operational HVAC system before, during, and after installation to ensure material integrity and maintain manufacturer warranties.</li>
                        <li><strong>Unforeseen Subfloor Issues:</strong> This proposal assumes a standard, structurally sound subfloor. Any hidden damage, dry rot, severe leveling requirements, or moisture issues discovered after the removal of existing flooring will require a separate change order and additional costs.</li>
                        <li><strong>Material Waste & Excess:</strong> Measurements include a standard industry waste factor. It is customary and recommended to keep 1-2 unopened boxes of leftover material stored in a climate-controlled area for future repairs (dye lots will vary over time).</li>
                        <li><strong>Payment Terms:</strong> A standard project deposit is required to order materials and reserve your installation date. The remaining balance is due upon project completion.</li>
                    </ul>

                    {/* SIGNATURE BLOCK */}
                    <div className="pt-8 print:pt-4 border-t-2 border-dashed border-gray-200 print:border-gray-300 mt-8 print:mt-4">
                        <h3 className="text-sm print:text-[10px] font-black uppercase tracking-widest text-gray-900 mb-6 print:mb-4">Proposal Acceptance</h3>
                        <p className="text-xs print:text-[8px] text-gray-600 mb-8 print:mb-6">The prices, specifications, and conditions are satisfactory and are hereby accepted. You are authorized to do the work as specified.</p>
                        
                        <div className="grid grid-cols-2 gap-8 print:gap-6">
                            <div className="border-t border-gray-400 print:border-gray-500 pt-2 print:pt-1">
                                <span className="text-xs print:text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Signature</span>
                            </div>
                            <div className="border-t border-gray-400 print:border-gray-500 pt-2 print:pt-1">
                                <span className="text-xs print:text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Date</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* BRANDED FOOTER */}
            <footer className="py-12 print:py-2 text-center mt-auto border-t border-gray-200 print:hidden" style={{ backgroundColor: brandBgColor, color: brandTextColor }}>
                {logoUrl && (
                    <img src={logoUrl} alt={businessName} className="h-12 w-auto mx-auto object-contain mb-4 opacity-80" style={{ filter: brandBgColor.toLowerCase() === '#ffffff' ? 'none' : 'brightness(0) invert(1) opacity(0.8)' }} />
                )}
                <p className="text-xs uppercase tracking-widest font-bold opacity-80 m-0">
                    © {new Date().getFullYear()} {businessName}. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}