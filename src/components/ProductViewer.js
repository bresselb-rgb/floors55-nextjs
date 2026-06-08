"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, appId } from "../lib/firebase";

function ProductViewerContent({ initialProduct }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlColorSku = searchParams.get('color');

    const [user, setUser] = useState(null);
    const [productData, setProductData] = useState(initialProduct);

    const [activeColor, setActiveColor] = useState(null);
    const [activeView, setActiveView] = useState('MAIN');
    const [validViews, setValidViews] = useState([]);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    const [calcLength, setCalcLength] = useState('');
    const [calcWidth, setCalcWidth] = useState('');
    const [calcWaste, setCalcWaste] = useState('1.10');
    
    const [clientMargin, setClientMargin] = useState(null);

    const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

    // Client Mode Initialization
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cmParam = searchParams.get('cm');
            if (cmParam) {
                try {
                    const decoded = parseInt(atob(cmParam), 10);
                    if (!isNaN(decoded)) {
                        sessionStorage.setItem('client_margin', decoded);
                        // Clean URL without losing color parameter
                        const colorParam = urlColorSku ? `?color=${urlColorSku}` : '';
                        router.replace(`${window.location.pathname}${colorParam}`, { scroll: false });
                    }
                } catch(e) {}
            }
            const stored = sessionStorage.getItem('client_margin');
            if (stored !== null) setClientMargin(parseInt(stored, 10));
        }
    }, [searchParams, router, urlColorSku]);

    useEffect(() => {
        let isMounted = true;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (isMounted) setUser(currentUser);
        });

        if (!auth.currentUser) {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth).catch(() => {}));
            } else {
                signInAnonymously(auth).catch(() => {});
            }
        }

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', initialProduct.id), (docSnap) => {
            if (docSnap.exists()) {
                const dbData = docSnap.data();
                dbData.displayTitle = (dbData.usePrivateName && dbData.privateName) ? dbData.privateName : (dbData.name || 'Unnamed Product');
                setProductData({ id: docSnap.id, ...dbData });
            }
        }, (error) => {
            if (error.code !== 'permission-denied') console.error("Firestore Error:", error);
        });
        return () => unsub();
    }, [initialProduct.id]);

    useEffect(() => {
         if (productData && productData.colors) {
             if (urlColorSku) {
                 const found = productData.colors.find(c => c.sku === urlColorSku);
                 if (found) {
                     setActiveColor(found);
                     if (activeColor?.sku !== urlColorSku) setActiveView(productData.views?.[0] || 'MAIN');
                 }
             } else if (!activeColor) {
                 setActiveColor(productData.colors[0] || { sku: '01', name: 'Default Colorway' });
                 setActiveView((productData.views && productData.views[0]) || 'MAIN');
             }
         }
    }, [urlColorSku, productData, activeColor]);

    const getMediaPath = (view) => {
        if (!productData || !activeColor) return null;
        const safeName = (productData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeSku = (productData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let folderName = 'images';
        if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
        else if (safeName) folderName = safeName;
        folderName = folderName.replace(/-+$/, '');

        const prefix = productData.imgPrefix || '';
        let path = '';

        if (view === 'ROOM' && productData.roomPrefix) {
            const suffix = productData.roomSuffix || '_room.jpg';
            path = `images/${folderName}/${productData.roomPrefix}${activeColor.sku}${suffix}`;
        } else if (view === 'VIDEO') {
            path = `images/${folderName}/${prefix}${activeColor.sku}_video.mp4`;
        } else {
            path = `images/${folderName}/${prefix}${activeColor.sku}_${view}.jpg`;
        }
        
        return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path.toLowerCase())}?alt=media`;
    };

    useEffect(() => {
        if (!productData?.views) return;
        
        const standardViews = productData.views.filter(v => v !== 'VIDEO');
        setValidViews(standardViews);

        if (productData.views.includes('VIDEO')) {
            const videoUrl = getMediaPath('VIDEO');
            if (videoUrl) {
                const vid = document.createElement('video');
                vid.onloadedmetadata = () => {
                    setValidViews(prev => {
                        if (!prev.includes('VIDEO')) return [...prev, 'VIDEO'];
                        return prev;
                    });
                };
                vid.src = videoUrl;
            }
        }
    }, [productData, activeColor]);

    const handleZoomPan = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        setZoomPos({ x, y });
    };

    const shareProduct = () => {
        const url = `${window.location.origin}/product/${productData.id}?color=${activeColor?.sku || ''}`;
        if (navigator.share) {
            navigator.share({ title: `${productData.displayTitle} | Floors 55`, url }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    const isClientMode = clientMargin !== null;

    // Dynamic Pricing Calculation
    const basePrice = productData?.price || 0;
    const finalPrice = isClientMode ? basePrice * (1 + clientMargin / 100) : basePrice;
    
    const wsPrice = finalPrice.toFixed(2);
    const retailPrice = productData?.retailPrice ? parseFloat(productData.retailPrice).toFixed(2) : (basePrice * 2.2).toFixed(2);

    const isCarpet = productData?.category === 'Carpet' || (productData?.category || '').toLowerCase().includes('carpet');
    const isSqft = !productData?.unit || productData?.unit === 'sqft';
    
    const sqydWsPrice = isCarpet && isSqft ? (finalPrice * 9).toFixed(2) : null;
    const sqydRetailPrice = isCarpet && isSqft ? (parseFloat(retailPrice) * 9).toFixed(2) : null;

    let cartonSqft = parseFloat(productData?.cartonSize);
    if (isNaN(cartonSqft) || cartonSqft <= 0) cartonSqft = parseFloat(productData?.boxSqft);

    if (!cartonSqft && productData?.specs && Array.isArray(productData.specs)) {
        const specText = productData.specs.join(' ').toLowerCase();
        const sqftMatch = specText.match(/([\d.]+)\s*(sq\.?ft\.?|sq\s*ft|sf)/);
        if (sqftMatch && parseFloat(sqftMatch[1]) > 0) cartonSqft = parseFloat(sqftMatch[1]);
    }
    cartonSqft = cartonSqft || 20;

    const l = parseFloat(calcLength) || 0;
    const w = parseFloat(calcWidth) || 0;
    const calcNet = l * w;
    const totalWithWaste = calcNet * parseFloat(calcWaste);
    const calcTotal = isCarpet ? (totalWithWaste / 9).toFixed(2) : Math.ceil(totalWithWaste / cartonSqft);

    return (
        <div className="flex-1 max-w-[1400px] mx-auto px-4 py-10 w-full flex flex-col md:flex-row gap-10 relative">
          
          {isClientMode && (
              <button 
                  onClick={() => { sessionStorage.removeItem('client_margin'); window.location.reload(); }} 
                  className="fixed bottom-6 left-6 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl z-[200] transition-colors flex items-center gap-2"
              >
                  <span>✕</span> Exit Client Mode
              </button>
          )}

          <div className="flex-1 min-w-[350px] sticky top-24 self-start z-10">
            <div
                className="w-full aspect-[4/3] rounded-lg bg-gray-50 border border-gray-200 overflow-hidden relative cursor-zoom-in group"
                onClick={() => activeView !== 'VIDEO' && setIsLightboxOpen(true)}
            >
                {activeView === 'VIDEO' ? (
                    <video src={getMediaPath('VIDEO') || ''} className="w-full h-full object-cover" controls autoPlay loop muted playsInline />
                ) : (
                    <img
                       src={getMediaPath(activeView) || TBD_IMG}
                       alt="Product"
                       className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-85"
                       onError={(e) => e.target.src = TBD_IMG}
                       style={{ objectFit: activeView === '1TO1' ? 'contain' : 'cover' }}
                    />
                )}
            </div>

            {validViews.length > 0 && (
                <div className="mt-4 flex gap-3">
                    {validViews.map(v => (
                         <img
                            key={v}
                            src={v === 'VIDEO' ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23c5a059" width="48px" height="48px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>' : (getMediaPath(v) || TBD_IMG)}
                            className={`w-[75px] h-[75px] object-cover border-2 rounded cursor-pointer transition ${activeView === v ? 'border-gold shadow-md' : 'border-gray-200 bg-gray-100'}`}
                            onClick={() => setActiveView(v)}
                            onError={(e) => e.target.src = TBD_IMG}
                            alt={`View ${v}`}
                         />
                    ))}
                </div>
            )}

            {!isClientMode && (
                <div className="flex gap-4 mt-6">
                    <Link href={`/quote?product=${encodeURIComponent(productData.displayTitle)}&color=${encodeURIComponent(activeColor?.name || '')}`} className="flex-1 bg-black text-white text-center py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gold transition-colors border-2 border-black hover:border-gold" style={{ textDecoration: 'none' }}>Request Quote</Link>
                    <Link href={`/order-sample?product=${encodeURIComponent(productData.displayTitle)}&color=${encodeURIComponent(activeColor?.name || '')}`} className="flex-1 bg-white text-black text-center py-4 rounded font-bold uppercase tracking-widest text-sm hover:text-gold transition-colors border-2 border-gray-200 hover:border-gold" style={{ textDecoration: 'none' }}>Order Sample</Link>
                </div>
            )}
          </div>

          <div className="flex-1 min-w-[320px]">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold m-0 leading-tight">{productData.displayTitle}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest">{productData.category}</span>
                        
                        {!isClientMode && user && !user.isAnonymous && productData.manufacturer && (
                            <span className="inline-block px-3 py-1 bg-[#fdfdfd] border border-gray-200 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <span className="text-gray-400 font-normal mr-1">Mfg:</span> {productData.manufacturer} {productData.sku ? `(${productData.sku})` : ''}
                            </span>
                        )}
                        {!isClientMode && user && !user.isAnonymous && productData.isSale && <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">🔥 HOT BUY</span>}
                        {!isClientMode && productData.isPropMgt && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-gold border border-gold/30 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><span className="text-[12px] bg-white rounded px-0.5 shadow-sm text-black">🏢</span> Prop Mgt</span>}
                        {!isClientMode && productData.isContractor && <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><span>🛠️</span> Pro Select</span>}
                        {!isClientMode && productData.isVisible === false && <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-widest">⚠️ Unlisted Draft</span>}
                    </div>
                </div>
                <button onClick={shareProduct} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition-all shadow-sm text-sm font-bold shrink-0 mt-1 cursor-pointer outline-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M15 12a3 3 0 100 6 3 3 0 000-6zm0-6a3 3 0 100 6 3 3 0 000-6z"></path></svg>
                    Share
                </button>
            </div>

            <p className="text-[1.05rem] text-gray-500 mb-6 italic">{productData.desc || 'Premium flooring collection.'}</p>
            <h2 className="text-xl font-bold mb-4">Select a Color: {activeColor?.name}</h2>

            <div className="my-5 p-4 border-l-4 border-gold bg-[#fdfdfd] relative overflow-hidden">
                {isClientMode ? (
                    <>
                        <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">
                            Client Pricing
                        </div>
                        <div className="mt-1">
                            <span className="text-[1.1rem] text-gray-900 font-bold mr-2">Price:</span>
                            <span className="text-[2.2rem] text-gray-900 font-black leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/{productData.unit || 'sqft'}</span></span>
                        </div>
                        {isCarpet && isSqft && <div className="text-sm text-gray-500 font-bold mt-1">That's ${sqydWsPrice} per sqyd</div>}
                    </>
                ) : user && !user.isAnonymous ? (
                    <>
                        <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse"></span> Wholesale Live
                        </div>
                        <span className="text-[0.9rem] text-gray-500 line-through mb-1 block">Retail: ${retailPrice} <span className="text-sm">/</span><span className="text-sm">{productData.unit || 'sqft'}</span></span>
                        {isCarpet && isSqft && <span className="text-[0.8rem] text-gray-400 italic block -mt-1 mb-2">(That's ${sqydRetailPrice} / sqyd)</span>}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-end gap-2">
                                <span className="text-[1.1rem] text-gray-900 font-bold text-gold mb-1">Wholesale Price:</span>
                                <span className="text-[2rem] text-red-700 font-bold leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/</span><span className="text-sm font-normal text-gray-500">{productData.unit || 'sqft'}</span></span>
                            </div>
                            {isCarpet && isSqft && <div className="text-sm text-gray-500 font-bold mt-1">That's ${sqydWsPrice} per sqyd</div>}
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-[1.5rem] text-gray-900 font-bold mb-1 block">Retail: ${retailPrice} <span className="text-sm">/</span><span className="text-sm">{productData.unit || 'sqft'}</span></span>
                        {isCarpet && isSqft && <span className="text-[1rem] text-gray-500 font-bold italic block mb-2">That's ${sqydRetailPrice} per sqyd</span>}
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <button onClick={() => window.dispatchEvent(new Event('open-login-modal'))} className="block w-full text-left text-[10px] font-bold uppercase tracking-widest text-gold hover:text-black transition-colors underline bg-transparent border-none cursor-pointer outline-none">Log in for wholesale pricing</button>
                            <Link href="/wholesale-request" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gold" style={{ textDecoration: 'none' }}>Request access here</Link>
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(85px,1fr))] gap-3 my-6">
                {productData.colors?.map(c => {
                    const swatchType = productData.category === 'Carpet' ? 'swatch' : 'main';
                    const safeName = (productData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const safeSku = (productData.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    let folderName = 'images';
                    if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                    else if (safeName) folderName = safeName;
                    folderName = folderName.replace(/-+$/, '');

                    const rawPath = `images/${folderName}/${productData.imgPrefix || ''}${c.sku}_${swatchType}.jpg`.toLowerCase();
                    const fbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;

                    return (
                        <div key={c.sku} className="cursor-pointer text-center group" onClick={() => {
                            router.replace(`/product/${productData.id}?color=${c.sku}`, { scroll: false });
                            setActiveColor(c);
                        }}>
                            <img 
                                src={fbPath} 
                                onError={(e) => e.target.src = TBD_IMG} 
                                className={`w-full aspect-square object-cover border-2 rounded-md transition duration-200 bg-gray-100 ${activeColor?.sku === c.sku ? 'border-gold shadow-[0_0_8px_rgba(197,160,89,0.4)]' : 'border-transparent group-hover:border-gray-300'}`} 
                                alt={c.name} 
                            />
                            <span className="text-[11px] mt-1.5 block text-gray-600 h-[2.5em] overflow-hidden leading-tight">{c.name}</span>
                        </div>
                    );
                })}
            </div>

            {productData.specs && productData.specs.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg mt-8 border border-gray-200">
                    <h4 className="mt-0 uppercase tracking-widest text-gold text-sm font-bold mb-4">Technical Specifications</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                        {productData.specs.map((s, i) => {
                            const [label, ...rest] = s.split(':');
                            if (rest.length === 0) return <li key={i}>{s}</li>;
                            return <li key={i}><strong>{label}:</strong> {rest.join(':')}</li>;
                        })}
                    </ul>
                </div>
            )}
          </div>

          {/* Calc and Lightbox Logic */}
          <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 bg-black text-white px-5 py-3 md:px-6 md:py-4 rounded-full cursor-pointer font-bold shadow-xl z-40 transition-colors border-2 border-black hover:bg-gold hover:text-black hover:border-gold flex items-center gap-2 text-sm md:text-base" onClick={() => setIsCalcOpen(!isCalcOpen)}>
              <span className="mr-1">📐</span> Room Calculator
          </div>

          {isCalcOpen && (
              <div className="fixed bottom-20 right-5 md:bottom-24 md:right-8 w-[280px] bg-white rounded-xl shadow-2xl z-50 p-5 border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                  <h4 className="m-0 mb-4 font-bold">Project Estimator</h4>
                  <div className="mb-3">
                      <label className="block text-xs mb-1 font-bold uppercase text-gray-600">Room Length (ft)</label>
                      <input type="number" value={calcLength} onChange={e => setCalcLength(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-gold outline-none text-sm" />
                  </div>
                  <div className="mb-3">
                      <label className="block text-xs mb-1 font-bold uppercase text-gray-600">Room Width (ft)</label>
                      <input type="number" value={calcWidth} onChange={e => setCalcWidth(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-gold outline-none text-sm" />
                  </div>
                  <div className="mb-3">
                      <label className="block text-xs mb-1 font-bold uppercase text-gray-600">Waste Factor</label>
                      <select value={calcWaste} onChange={e => setCalcWaste(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-gold outline-none text-sm bg-white">
                          <option value="1.05">5%</option>
                          <option value="1.10">10%</option>
                          <option value="1.15">15%</option>
                      </select>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4 border-l-4 border-gold">
                      <div className="flex justify-between text-sm mb-1 text-gray-600"><span>Net Area:</span> <span><span className="font-bold text-gray-900">{calcNet.toFixed(2)}</span> sq.ft</span></div>
                      <div className="flex justify-between text-[1.1rem] font-bold border-t border-gray-200 pt-2 mt-2">
                          <span className="text-gray-800">{isCarpet ? 'Square Yards:' : 'Cartons Needed:'}</span> 
                          <span className="text-red-700">{calcTotal}</span>
                      </div>
                      {!isCarpet && <div className="text-[9px] text-gray-500 font-normal mt-1 text-right">*Based on {cartonSqft} sq.ft. per carton</div>}
                  </div>
              </div>
          )}

          {isLightboxOpen && (
              <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity" onClick={(e) => { if (e.target === e.currentTarget) setIsLightboxOpen(false); }}>
                  <button className="absolute top-5 right-5 bg-black/60 text-white border-2 border-white rounded-full w-11 h-11 text-2xl flex items-center justify-center cursor-pointer hover:bg-gold hover:border-gold hover:text-black transition-colors z-[10000] outline-none" onClick={() => setIsLightboxOpen(false)}>✕</button>
                  <div 
                      className="w-[90vw] max-w-[1200px] h-[85vh] relative rounded-lg overflow-hidden cursor-crosshair touch-none" 
                      onMouseMove={handleZoomPan} 
                      onTouchMove={handleZoomPan} 
                      onMouseLeave={() => setZoomPos({x:50, y:50})} 
                      onTouchEnd={() => setZoomPos({x:50, y:50})}
                  >
                      <img 
                          src={getMediaPath(activeView) || TBD_IMG} 
                          alt="Zoomed Product" 
                          className="w-full h-full object-contain transition-transform duration-150 ease-out hover:scale-[2.2]"
                          style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
                          onError={(e) => e.target.src = TBD_IMG}
                      />
                  </div>
              </div>
          )}
        </div>
    );
}

// Wrapping in Suspense is required by Next.js when using useSearchParams()
export default function ProductViewer({ initialProduct }) {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div>
            </div>
        }>
            <ProductViewerContent initialProduct={initialProduct} />
        </Suspense>
    );
}