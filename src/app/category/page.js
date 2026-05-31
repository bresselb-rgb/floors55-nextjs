"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db, appId } from "../../lib/firebase";

export default function CategoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [liveProductsRaw, setLiveProductsRaw] = useState([]);
  const [activeCategoryHash, setActiveCategoryHash] = useState('All Products');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000); // Start very high so no products are hidden
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [sortMode, setSortMode] = useState('price-asc');
  const [isListView, setIsListView] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activePreviews, setActivePreviews] = useState({});

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth.currentUser) {
            setIsAuthReady(true);
            return;
        }
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
      } catch (err) {
        await signInAnonymously(auth).catch(() => {});
      } finally {
        setIsAuthReady(true);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const syncHash = () => {
        if (typeof window === 'undefined') return;
        
        // Safely grab the LAST hash if Next.js accidentally doubled them up
        const hashParts = window.location.hash.split('#');
        let rawHash = decodeURIComponent(hashParts[hashParts.length - 1]).trim();
        if (!rawHash || rawHash === '') rawHash = 'All Products';

        let safeCheck = rawHash.toLowerCase().replace(/-/g, ' ');
        
        if (safeCheck.includes('lvp') || safeCheck.includes('luxury vinyl')) {
            setActiveCategoryHash('Luxury Vinyl (LVP)');
        } else if (safeCheck.includes('sale') || safeCheck.includes('clearance') || safeCheck.includes('hot buys')) {
            setActiveCategoryHash('Hot Buys');
        } else if (safeCheck === 'all products') {
            setActiveCategoryHash('All Products');
        } else {
            setActiveCategoryHash(rawHash);
        }
    };
    
    // Run immediately, and run again in 100ms to catch Next.js delayed routing.
    syncHash();
    const timeoutId = setTimeout(syncHash, 100);
    
    window.addEventListener('hashchange', syncHash);
    
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    
    const unsubDb = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'), (snap) => {
      const arr = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.isVisible !== false) {
          data.displayTitle = (data.usePrivateName && data.privateName) ? data.privateName : (data.name || 'Unnamed Product');
          
          let cat = (data.category || '').trim();
          if (cat.toUpperCase() === 'LVP' || cat.toLowerCase() === 'luxury vinyl' || cat.toLowerCase() === 'luxury vinyl plank') {
              data.category = 'Luxury Vinyl (LVP)';
          } else {
              data.category = cat || 'Uncategorized';
          }
          
          arr.push({ id: d.id, ...data });
        }
      });
      setLiveProductsRaw(arr);
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Firestore Category Listener Error:", error);
      setIsDataLoaded(true);
    });
    return () => unsubDb();
  }, [user, isAuthReady]);

  const uniqueCategoriesList = useMemo(() => {
    return [...new Set(liveProductsRaw.map(p => p.category))].sort();
  }, [liveProductsRaw]);

  const isWholesale = user && !user.isAnonymous;

  const priceBounds = useMemo(() => {
    let min = 0; let max = 15;
    const prices = liveProductsRaw.map(p => isWholesale ? p.price : (p.retailPrice ? parseFloat(p.retailPrice) : p.price * 2.2)).filter(v => !isNaN(v));
    if (prices.length > 0) {
        min = Math.floor(Math.min(...prices));
        max = Math.ceil(Math.max(...prices));
    }
    return { min, max };
  }, [liveProductsRaw, isWholesale]);

  useEffect(() => {
     if (liveProductsRaw.length > 0) {
         if (maxPrice === 10000 || maxPrice > priceBounds.max || maxPrice < priceBounds.min) {
             setMaxPrice(priceBounds.max);
         }
     }
  }, [priceBounds.max, priceBounds.min, liveProductsRaw.length]);

  const filteredProducts = useMemo(() => {
    const searchVal = searchQuery.toLowerCase().trim();
    
    return liveProductsRaw.filter(p => {
        const priceValue = isWholesale ? p.price : (p.retailPrice ? parseFloat(p.retailPrice) : (p.price * 2.2));

        const nameLower = (p.displayTitle || '').toLowerCase();
        const skuLower = (p.sku || '').toLowerCase();
        const mfgLower = (p.manufacturer || '').toLowerCase();
        const descLower = (p.desc || '').toLowerCase();
        const specTextCombined = (p.specs || []).join(' ').toLowerCase();

        const matchesSearch = !searchVal || 
                              nameLower.includes(searchVal) || 
                              skuLower.includes(searchVal) || 
                              mfgLower.includes(searchVal) || 
                              descLower.includes(searchVal) || 
                              specTextCombined.includes(searchVal);

        const matchesCategory = (activeCategoryHash === "All Products") || 
                                (activeCategoryHash === "Hot Buys" && p.isSale === true) || 
                                (p.category === activeCategoryHash);

        const matchesPrice = isNaN(maxPrice) || (priceValue <= maxPrice);

        let matchesProgs = true;
        if (selectedPrograms.length > 0) {
            matchesProgs = selectedPrograms.every(prog => {
                if (prog === 'propmgt') return p.isPropMgt === true;
                if (prog === 'contractor') return p.isContractor === true;
                return false;
            });
        }

        return matchesSearch && matchesCategory && matchesPrice && matchesProgs;
        
    }).sort((a, b) => {
        const pA = isWholesale ? a.price : (a.retailPrice ? parseFloat(a.retailPrice) : (a.price * 2.2));
        const pB = isWholesale ? b.price : (b.retailPrice ? parseFloat(b.retailPrice) : (b.price * 2.2));

        if (sortMode === 'propmgt') {
            if (a.isPropMgt && !b.isPropMgt) return -1;
            if (!a.isPropMgt && b.isPropMgt) return 1;
        }
        if (sortMode === 'contractor') {
            if (a.isContractor && !b.isContractor) return -1;
            if (!a.isContractor && b.isContractor) return 1;
        }
        if (sortMode === 'price-asc') return pA - pB;
        if (sortMode === 'price-desc') return pB - pA;
        if (sortMode === 'name-asc') return (a.displayTitle || '').localeCompare(b.displayTitle || '');
        
        const catCompare = (a.category || '').localeCompare(b.category || '');
        if (catCompare !== 0) return catCompare;
        return (a.displayTitle || '').localeCompare(b.displayTitle || '');
    });
  }, [liveProductsRaw, activeCategoryHash, searchQuery, maxPrice, selectedPrograms, sortMode, isWholesale]);

  const handleProgramToggle = (val) => {
      setSelectedPrograms(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
  };

  const resetAllFilters = () => {
      setSearchQuery('');
      setMaxPrice(priceBounds.max);
      setSelectedPrograms([]);
      setSortMode('price-asc');
      if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
  };

  // Safely tell Next.js to update the URL so the back button knows the history
  const handleCategorySwitch = (hash) => {
      router.push(`${pathname}#${hash}`, { scroll: false });
      setIsMobileDrawerOpen(false);
      
      // Force the native event so the page instantly filters
      setTimeout(() => {
          window.dispatchEvent(new Event('hashchange'));
      }, 50);
  };

  let heroImage = '/images/heros/main-hero.jpg';
  if (activeCategoryHash === 'Luxury Vinyl (LVP)') heroImage = '/images/heros/lvp.jpg';
  else if (activeCategoryHash === 'Carpet') heroImage = '/images/heros/carpet.jpg';
  else if (activeCategoryHash === 'Laminate') heroImage = '/images/heros/laminate.jpg';
  else if (activeCategoryHash === 'Hardwood') heroImage = '/images/heros/hardwood.jpg';

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      <header 
        className="relative min-h-[250px] md:min-h-[320px] py-12 flex items-center justify-center text-center text-white transition-all duration-500"
        style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('${heroImage}')`, 
            backgroundSize: "cover", 
            backgroundPosition: "center"
        }}
      >
        <div className="max-w-3xl px-4">
            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">{activeCategoryHash === 'Hot Buys' ? '🔥 Hot Buys' : activeCategoryHash}</h1>
            <p className="text-xs md:text-sm text-gray-200 uppercase tracking-widest font-bold">Curated collections of premium flooring solutions</p>
        </div>
      </header>

      <section className="py-6 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24 self-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Search Catalog</label>
                    <div className="relative">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Product, SKU, specs..." className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-gold" />
                        <span className="absolute right-3 top-3 text-gray-400 text-xs">🔍</span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Collections</label>
                    <div className="space-y-1.5 flex flex-col">
                        <button onClick={() => handleCategorySwitch('All Products')} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategoryHash === 'All Products' ? 'bg-gold text-black font-black' : 'text-gray-500 hover:bg-gray-100'}`}>🌐 All Collections</button>
                        <button onClick={() => handleCategorySwitch('Hot Buys')} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold animate-pulse transition-all outline-none cursor-pointer ${activeCategoryHash === 'Hot Buys' ? 'bg-red-50 text-red-700 font-black' : 'text-red-50 hover:bg-red-50'}`}>🔥 Hot Buys (On Sale)</button>
                        {uniqueCategoriesList.map(cat => (
                            <button key={cat} onClick={() => handleCategorySwitch(encodeURIComponent(cat))} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategoryHash === cat ? 'bg-gold text-black font-black' : 'text-gray-500 hover:bg-gray-100'}`}>{cat}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Max Price Limit</label>
                        <span className="text-xs font-bold text-gold font-mono">${maxPrice.toFixed(2)}</span>
                    </div>
                    <input type="range" min={priceBounds.min} max={priceBounds.max} step="0.5" value={maxPrice} onChange={(e) => setMaxPrice(parseFloat(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                        <span>${priceBounds.min.toFixed(2)}</span>
                        <span>${priceBounds.max.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2.5">Exclusive Programs</label>
                    <div className="space-y-2 text-xs font-bold text-gray-600">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition">
                            <input type="checkbox" checked={selectedPrograms.includes('propmgt')} onChange={() => handleProgramToggle('propmgt')} className="accent-gold h-4 w-4 rounded" /> 🏠 Property Management
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition">
                            <input type="checkbox" checked={selectedPrograms.includes('contractor')} onChange={() => handleProgramToggle('contractor')} className="accent-gold h-4 w-4 rounded" /> 🛠️ Contractor Pro
                        </label>
                    </div>
                </div>

                <button onClick={resetAllFilters} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black border border-gray-200 font-bold text-[10px] uppercase py-2 rounded-xl transition outline-none cursor-pointer">
                    Clear Active Filters
                </button>
            </aside>

            <div className="flex-1 flex flex-col">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileDrawerOpen(true)} className="lg:hidden bg-black text-white hover:bg-gold hover:text-black transition-colors px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 outline-none cursor-pointer">
                            <span>⚙️</span> Filters
                        </button>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isDataLoaded ? `Showing ${filteredProducts.length} of ${liveProductsRaw.length}` : 'Loading...'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
                            <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-gold font-bold text-gray-700 cursor-pointer">
                                <option value="default">Category & Name</option>
                                <option value="propmgt">Property Mgt First</option>
                                <option value="contractor">Contractor Pro First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>
                        <div className="hidden sm:flex border border-gray-200 rounded-xl p-0.5 bg-gray-50">
                            <button onClick={() => setIsListView(false)} className={`p-1.5 rounded-lg transition text-xs outline-none cursor-pointer ${!isListView ? 'bg-white shadow-sm text-gold' : 'text-gray-400 hover:text-gold'}`}>📱 Grid</button>
                            <button onClick={() => setIsListView(true)} className={`p-1.5 rounded-lg transition text-xs outline-none cursor-pointer ${isListView ? 'bg-white shadow-sm text-gold' : 'text-gray-400 hover:text-gold'}`}>📋 List</button>
                        </div>
                    </div>
                </div>

                {!isDataLoaded ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm italic bg-white border border-gray-200 rounded-2xl">No products matched your currently selected active filters.</div>
                ) : (
                    <div className={isListView ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
                        {filteredProducts.map(p => {
                            const retailPriceValue = p.retailPrice ? parseFloat(p.retailPrice) : (p.price * 2.2);
                            const wholesalePriceValue = p.price;
                            const retailPriceFormatted = !isNaN(retailPriceValue) ? retailPriceValue.toFixed(2) : '--';
                            const wholesalePriceFormatted = !isNaN(wholesalePriceValue) ? wholesalePriceValue.toFixed(2) : '--';
                            
                            const safeDesc = p.desc || 'Premium flooring collection.';
                            const safePrefix = p.imgPrefix || '';
                            const colors = Array.isArray(p.colors) ? p.colors : [{ sku: '01', name: 'Default' }];
                            
                            const displaySku = activePreviews[p.id] || (colors[0] ? colors[0].sku : '01');
                            
                            const safeName = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const safeSku = (p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            let folderName = 'images'; 
                            if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
                            else if (safeName) folderName = safeName;
                            folderName = folderName.replace(/-+$/, '');

                            const mainType = p.category === 'Carpet' ? 'main' : 'main';
                            const lowerPath = `/images/${folderName}/${safePrefix}${displaySku}_${mainType}.jpg`.toLowerCase();
                            
                            return (
                                <div key={p.id} className={isListView ? "bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row items-center p-4 gap-6 hover:shadow-md transition relative" : "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition relative"}>
                                    
                                    <div className={`absolute z-10 flex flex-col items-start ${isListView ? 'top-2 left-2 gap-1' : 'top-4 left-4 gap-1.5'}`}>
                                        {p.isSale && <div className={`bg-red-600 text-white font-black rounded-full uppercase tracking-widest shadow-md ${isListView ? 'text-[9px] px-2.5 py-1' : 'text-[9px] px-3 py-1.5 flex items-center gap-1 animate-pulse'}`}><span>🔥</span> HOT BUY</div>}
                                        {p.isPropMgt && <div className={`bg-black text-gold font-black rounded-full uppercase tracking-widest shadow-md flex items-center border border-gold/30 ${isListView ? 'text-[9px] px-2.5 py-1 gap-1.5' : 'text-[9px] px-3 py-1.5 gap-1.5'}`}><span className="text-[12px] bg-white rounded px-0.5 shadow-sm text-black">🏢</span> Prop Mgt</div>}
                                        {p.isContractor && <div className={`bg-purple-100 text-purple-800 font-black rounded-full uppercase tracking-widest shadow-md flex items-center ${isListView ? 'text-[9px] px-2.5 py-1 gap-1' : 'text-[9px] px-3 py-1.5 gap-1'}`}><span>🛠️</span> Pro Select</div>}
                                    </div>

                                    <Link href={`/product#${p.id}`} className={isListView ? "w-full sm:w-40 h-28 rounded-lg overflow-hidden shrink-0 bg-gray-50 mt-8 sm:mt-0 block" : "block overflow-hidden h-52 bg-gray-50 relative"} style={{ textDecoration: 'none' }}>
                                        <img src={lowerPath} className="w-full h-full object-cover transition duration-300 hover:scale-105" onError={e => e.target.src='/images/tbd.jpg'} />
                                    </Link>

                                    {!isListView && (
                                        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-1.5 min-h-[40px] items-center">
                                            {colors.slice(0, 6).map(c => {
                                                const sType = p.category === 'Carpet' ? 'swatch' : 'main';
                                                const swatchPath = `/images/${folderName}/${safePrefix}${c.sku}_${sType}.jpg`.toLowerCase();
                                                return (
                                                    <button key={c.sku} onMouseEnter={() => setActivePreviews(prev => ({...prev, [p.id]: c.sku}))} onClick={(e) => { e.preventDefault(); setActivePreviews(prev => ({...prev, [p.id]: c.sku})); }} className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 transition-transform hover:scale-125 focus:scale-125 focus:outline-none bg-gray-100 cursor-pointer" title={c.name}>
                                                        <img src={swatchPath} className="w-full h-full object-cover pointer-events-none" onError={e => e.target.src='/images/tbd.jpg'} />
                                                    </button>
                                                )
                                            })}
                                            {colors.length > 6 && <span className="text-[9px] font-bold text-gray-400 self-center ml-1">+{colors.length - 6} more</span>}
                                        </div>
                                    )}

                                    <div className={isListView ? "flex-1 min-w-0 space-y-1 text-center sm:text-left" : "p-5 flex-1 flex flex-col justify-between"}>
                                        <div className={isListView ? "flex items-center justify-center sm:justify-start gap-2 mt-4 sm:mt-0" : "space-y-1 mb-4"}>
                                            <div className={isListView ? "flex items-center gap-2" : "flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider"}>
                                                <span className={isListView ? "text-[10px] font-black text-gold uppercase tracking-widest" : ""}>{p.category}</span>
                                                <span className={isListView ? "text-[10px] text-gray-400 font-bold uppercase font-mono" : ""}>{p.sku}</span>
                                            </div>
                                            {!isListView && (
                                                <>
                                                    <h3 className="text-lg font-bold text-gray-950 truncate"><Link href={`/product#${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.displayTitle}</Link></h3>
                                                    <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed">{safeDesc}</p>
                                                </>
                                            )}
                                        </div>
                                        
                                        {isListView && (
                                            <>
                                                <h3 className="text-lg font-bold text-gray-900 truncate"><Link href={`/product#${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.displayTitle}</Link></h3>
                                                <p className="text-gray-500 text-xs line-clamp-2">{safeDesc}</p>
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1.5">
                                                    {colors.slice(0, 6).map(c => {
                                                        const sType = p.category === 'Carpet' ? 'swatch' : 'main';
                                                        const swatchPath = `/images/${folderName}/${safePrefix}${c.sku}_${sType}.jpg`.toLowerCase();
                                                        return (
                                                            <button key={c.sku} onMouseEnter={() => setActivePreviews(prev => ({...prev, [p.id]: c.sku}))} onClick={(e) => { e.preventDefault(); setActivePreviews(prev => ({...prev, [p.id]: c.sku})); }} className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 transition-transform hover:scale-125 focus:scale-125 focus:outline-none bg-gray-100 cursor-pointer" title={c.name}>
                                                                <img src={swatchPath} className="w-full h-full object-cover pointer-events-none" onError={e => e.target.src='/images/tbd.jpg'} />
                                                            </button>
                                                        )
                                                    })}
                                                    {colors.length > 6 && <span className="text-[9px] font-bold text-gray-400 self-center ml-1">+{colors.length - 6} more</span>}
                                                </div>
                                            </>
                                        )}

                                        <div className={isListView ? "w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 text-center sm:text-right shrink-0 flex flex-col justify-center" : "space-y-3 pt-3 border-t border-gray-50"}>
                                            {isWholesale ? (
                                                isListView ? (
                                                    <>
                                                        <div className="text-[10px] text-gold font-bold uppercase tracking-wider mb-0.5">Wholesale</div>
                                                        <div className="text-xl font-black text-gray-950 mb-0 font-mono">${wholesalePriceFormatted} <span className="text-xs font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></div>
                                                        <div className="text-[9px] text-gray-400 line-through mb-2">Retail: ${retailPriceFormatted}</div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col mt-1">
                                                        <span className="text-[9px] text-gray-400 line-through self-end mb-0.5">Retail: ${retailPriceFormatted}</span>
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-[10px] text-gold uppercase font-black tracking-wider">Wholesale</span>
                                                            <span className="text-base font-black text-gray-900 font-mono">${wholesalePriceFormatted} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                isListView ? (
                                                    <>
                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Est. Retail Price</div>
                                                        <div className="text-xl font-black text-gray-950 mb-3 font-mono">${retailPriceFormatted} <span className="text-xs font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Retail Price</span>
                                                        <span className="text-base font-black text-gray-900 font-mono">${retailPriceFormatted} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                                    </div>
                                                )
                                            )}
                                            <Link href={`/product#${p.id}`} className={isListView ? "w-full block text-center bg-black hover:bg-gold text-white hover:text-black font-black uppercase py-2 rounded-lg transition text-[10px] tracking-widest" : "w-full block text-center border border-black hover:bg-black text-black hover:text-white font-black uppercase py-2.5 rounded-xl transition text-[10px] tracking-widest"} style={{ textDecoration: 'none' }}>View Details</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </section>

      {isMobileDrawerOpen && (
          <div className="fixed inset-0 bg-black/70 z-[100] flex justify-end transition-opacity duration-300">
            <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-6 flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                    <span className="text-base font-black uppercase tracking-wider text-black">Filter Suite</span>
                    <button onClick={() => setIsMobileDrawerOpen(false)} className="text-gray-400 hover:text-black font-black text-lg p-1 outline-none bg-transparent border-none cursor-pointer">✕</button>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Search Catalog</label>
                    <div className="relative">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Product, SKU, specs..." className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-gold" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Collections</label>
                    <div className="space-y-1.5 flex flex-col">
                        <button onClick={() => handleCategorySwitch('All Products')} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategoryHash === 'All Products' ? 'bg-gold text-black font-black' : 'text-gray-500 hover:bg-gray-100'}`}>🌐 All Collections</button>
                        <button onClick={() => handleCategorySwitch('Hot Buys')} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold animate-pulse transition-all outline-none cursor-pointer ${activeCategoryHash === 'Hot Buys' ? 'bg-red-50 text-red-700 font-black' : 'text-red-500 hover:bg-red-50'}`}>🔥 Hot Buys (On Sale)</button>
                        {uniqueCategoriesList.map(cat => (
                            <button key={cat} onClick={() => handleCategorySwitch(encodeURIComponent(cat))} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategoryHash === cat ? 'bg-gold text-black font-black' : 'text-gray-500 hover:bg-gray-100'}`}>{cat}</button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Max Price Limit</label>
                        <span className="text-xs font-bold text-gold font-mono">${maxPrice.toFixed(2)}</span>
                    </div>
                    <input type="range" min={priceBounds.min} max={priceBounds.max} step="0.5" value={maxPrice} onChange={(e) => setMaxPrice(parseFloat(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                        <span>${priceBounds.min.toFixed(2)}</span>
                        <span>${priceBounds.max.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2.5">Exclusive Programs</label>
                    <div className="space-y-2 text-xs font-bold text-gray-600">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition">
                            <input type="checkbox" checked={selectedPrograms.includes('propmgt')} onChange={() => handleProgramToggle('propmgt')} className="accent-gold h-4 w-4 rounded" /> 🏠 Property Management
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-gold transition">
                            <input type="checkbox" checked={selectedPrograms.includes('contractor')} onChange={() => handleProgramToggle('contractor')} className="accent-gold h-4 w-4 rounded" /> 🛠️ Contractor Pro
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button onClick={resetAllFilters} className="flex-1 bg-gray-50 border border-gray-200 font-bold text-xs uppercase py-3 rounded-xl transition text-center text-gray-500 outline-none cursor-pointer">Reset</button>
                    <button onClick={() => setIsMobileDrawerOpen(false)} className="flex-1 bg-black hover:bg-gold text-white font-black text-xs uppercase py-3 rounded-xl transition text-center outline-none cursor-pointer">View Results</button>
                </div>
            </div>
          </div>
      )}
    </main>
  );
}