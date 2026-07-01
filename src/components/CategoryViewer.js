// src/components/CategoryViewer.js
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore";

let Link;
let usePathname = () => '';
let useRouter = () => ({ push: () => {}, replace: () => {} });
let useSearchParams = () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    return { get: (key) => params.get(key) };
};
let auth, db, appId;

try {
    const nextLink = 'next/link';
    Link = require(nextLink).default || require(nextLink);
    const nextNav = 'next/navigation';
    const nav = require(nextNav);
    usePathname = nav.usePathname;
    useRouter = nav.useRouter;
    useSearchParams = nav.useSearchParams;
} catch (e) {
    Link = ({ href, children, className, style, onClick }) => <a href={href} className={className} style={style} onClick={onClick}>{children}</a>;
    usePathname = () => typeof window !== 'undefined' ? window.location.pathname : '';
    useRouter = () => ({ push: (url) => { if (typeof window !== 'undefined') window.location.href = url; }, replace: (url) => { if (typeof window !== 'undefined') window.location.href = url; } });
    useSearchParams = () => {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
        return { get: (key) => params.get(key) };
    };
}

try {
    const fbPath = '../lib/firebase';
    const fb = require(fbPath);
    auth = fb.auth;
    db = fb.db;
    appId = fb.appId;
} catch (e) {
    console.warn("Firebase lib not found in current environment context.");
}

// Standardizes the labels on the left side of the colon
const normalizeSpecKey = (rawKey) => {
    const k = rawKey.toLowerCase().trim();
    if (k === 'core' || k === 'construction' || k === 'core material' || k === 'core type') return 'Construction / Core';
    if (k === 'pad' || k === 'cushion' || k === 'underlayment' || k === 'attached pad') return 'Attached Pad';
    if (k === 'style' || k === 'pattern' || k === 'style type') return 'Style Type';
    if (k === 'wearlayer' || k === 'wear layer') return 'Wear Layer';
    if (k === 'overall thickness' || k === 'total thickness' || k === 'thickness') return 'Thickness';
    if (k === 'waterproof' || k === 'water resistance') return 'Waterproof';
    if (k === 'face weight' || k === 'ounce weight' || k === 'fiber weight' || k === 'weight' || k === 'oz weight') return 'Face Weight';
    if (k === 'fiber' || k === 'fiber type' || k === 'yarn' || k === 'material') return 'Fiber Type';
    return rawKey.trim();
};

// Standardizes the values on the right side of the colon into specific buckets
const normalizeSpecValue = (key, rawValue, category = '') => {
    const val = rawValue.trim();
    const lowerVal = val.toLowerCase();

    // 1. Thickness Bucketing
    if (key.toLowerCase() === "thickness") {
        const match = val.match(/[\d.]+/);
        if (match) {
            const num = parseFloat(match[0]);
            if (num < 5) return "< 5mm";
            if (num >= 5 && num <= 7) return "5mm - 7mm";
            if (num > 7 && num <= 10) return "7mm - 10mm";
            if (num > 10) return "10mm+";
        }
    }

    // 2. Construction / Core Type Extraction
    if (key.toLowerCase() === "construction / core") {
        // LVP manufacturers often use "Solid Polymer Core" for SPC
        if (category === 'Luxury Vinyl (LVP)' && lowerVal.includes("solid")) return "SPC";
        
        if (lowerVal.includes("solid")) return "Solid";
        if (lowerVal.includes("wpc")) return "WPC";
        if (lowerVal.includes("spc") || lowerVal.includes("rigid")) return "SPC";
        
        // Catch anything that implies engineered hardwood (HDF, Multi-ply, veneer)
        if (lowerVal.includes("engineered") || lowerVal.includes("ply") || lowerVal.includes("hdf") || lowerVal.includes("veneer") || lowerVal.includes("multi")) return "Engineered";
        
        return val;
    }

    // 3. Attached Pad Extraction
    if (key.toLowerCase() === "attached pad" || key.toLowerCase() === "pad") {
        if (lowerVal.includes("cork")) return "Attached Cork";
        if (lowerVal.includes("no") || lowerVal === "none" || lowerVal === "n/a" || lowerVal === "false") return "None";
        return "Attached Pad"; 
    }

    // 4. Carpet Style Type Bucketing
    if (key.toLowerCase() === "style type") {
        if ((lowerVal.includes("texture") || lowerVal.includes("cut pile")) && !lowerVal.includes("loop")) return "Texture / Cut Pile";
        if (lowerVal.includes("pattern") || (lowerVal.includes("cut") && lowerVal.includes("loop"))) return "Pattern / Cut & Loop";
        if (lowerVal.includes("loop") || lowerVal.includes("berber")) return "Loop";
    }

    // 5. Wear Layer Cleanup
    if (key.toLowerCase() === "wear layer") {
         const match = val.match(/(\d+)/);
         if (match) return `${match[1]} mil`;
    }
    
    // 6. Waterproof Normalization
    if (key.toLowerCase() === "waterproof") {
        if (lowerVal.includes("no") || lowerVal === "false") return "None";
        return "100% Waterproof";
    }

    // 7. Fiber Type Normalization
    if (key.toLowerCase() === "fiber type") {
        if (lowerVal.includes("nylon")) return "Nylon";
        if (lowerVal.includes("triexta") || lowerVal.includes("smartstrand") || lowerVal.includes("sorona")) return "Triexta";
        if (lowerVal.includes("wool")) return "Wool";
        if (lowerVal.includes("poly") || lowerVal.includes("pet")) return "Polyester";
        return val;
    }

    // 8. Face Weight Bucketing
    if (key.toLowerCase() === "face weight") {
        const match = val.match(/[\d.]+/);
        if (match) {
            const num = parseFloat(match[0]);
            if (num < 30) return "< 30 oz";
            if (num >= 30 && num < 40) return "30 - 40 oz";
            if (num >= 40 && num < 50) return "40 - 50 oz";
            if (num >= 50 && num < 60) return "50 - 60 oz";
            if (num >= 60) return "60+ oz";
        }
    }

    return val;
};

// Hardcoded sort order so custom buckets don't sort alphabetically
const THICKNESS_ORDER = { "< 5mm": 1, "5mm - 7mm": 2, "7mm - 10mm": 3, "10mm+": 4 };
const FACE_WEIGHT_ORDER = { "< 30 oz": 1, "30 - 40 oz": 2, "40 - 50 oz": 3, "50 - 60 oz": 4, "60+ oz": 5 };

function CategoryViewerContent({ initialCategory }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [clientMargin, setClientMargin] = useState(null);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const [liveProductsRaw, setLiveProductsRaw] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000); 
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [sortMode, setSortMode] = useState('price-asc');
  const [isListView, setIsListView] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activePreviews, setActivePreviews] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3000);
  };

  const handleShare = async (e, p) => {
      e.preventDefault();
      const displaySku = activePreviews[p.id] || (p.colors?.[0]?.sku || '01');
      
      // Calculate the internal path (without the domain)
      let targetPath = `/product/${p.id}?color=${displaySku}`;
      
      if (clientMargin !== null) {
          const encodedMargin = btoa(clientMargin.toString());
          targetPath += `&cm=${encodedMargin}`;
          
          if (user && !user.isAnonymous) {
              targetPath += `&pro=${user.uid}`;
          } else {
              const storedBrand = sessionStorage.getItem('client_brand');
              if (storedBrand) targetPath += `&cb=${btoa(storedBrand)}`;
          }
      }

      // Generate Native Short Link
      const shortCode = Math.random().toString(36).substring(2, 8);
      let finalUrl = `${window.location.origin}/s/${shortCode}`;
      
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'short_links', shortCode), {
              target: targetPath,
              createdAt: new Date().toISOString()
          });
      } catch(err) {
          console.warn("Short link generation failed, using long URL.", err);
          finalUrl = `${window.location.origin}${targetPath}`;
      }

      const title = p.displayTitle;
      const plainText = `${title}\n${finalUrl}`;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (navigator.share && isMobile) {
          navigator.share({ title: title, text: title, url: finalUrl }).catch(console.error);
      } else {
          const copyRichLink = async () => {
              try {
                  await navigator.clipboard.writeText(plainText);
              } catch (e) {
                  const textArea = document.createElement("textarea");
                  textArea.value = plainText;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
              }
              showToast("Product link copied!");
          };
          copyRichLink();
      }
  };

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const prog = searchParams.get('program');
          if (prog === 'propmgt' || prog === 'contractor') {
              setSelectedPrograms([prog]);
          }

          const cmParam = searchParams.get('cm');
          const proParam = searchParams.get('pro');
          const cbParam = searchParams.get('cb'); 
          
          // HARDCODED ABBEY LOGO CONSTANT
          const ABBEY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fabbey-logo.png?alt=media";

          if (proParam) {
                const fetchProBranding = async () => {
                    try {
                        const proDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', proParam));
                        if (proDoc.exists()) {
                            const pData = proDoc.data();
                            sessionStorage.setItem('client_brand', pData.business || 'Premium Floors');
                            if (pData.logoUrl) sessionStorage.setItem('client_logo', pData.logoUrl);
                            else sessionStorage.removeItem('client_logo');
                            
                            sessionStorage.setItem('client_bg', pData.brandBgColor || '#ffffff');
                            sessionStorage.setItem('client_text', pData.brandTextColor || '#000000');
                            
                            if (cmParam) {
                                const decoded = parseInt(atob(cmParam), 10);
                                if (!isNaN(decoded)) sessionStorage.setItem('client_margin', decoded);
                            } else if (pData.clientMargin !== undefined) {
                                sessionStorage.setItem('client_margin', pData.clientMargin);
                            }
                            
                            sessionStorage.setItem('magic_link_client', 'true');
                            window.location.replace(window.location.pathname);
                        }
                    } catch(err) {
                        console.error(err);
                    }
                };
                fetchProBranding();
          } else {
              let shouldReplace = false;
              if (cmParam) {
                  try {
                      const decoded = parseInt(atob(cmParam), 10);
                      if (!isNaN(decoded)) {
                          sessionStorage.setItem('client_margin', decoded);
                          sessionStorage.setItem('magic_link_client', 'true');
                          shouldReplace = true;
                      }
                  } catch(e) {}
              }
              if (cbParam) {
                  try {
                      const decodedBrand = atob(cbParam);
                      sessionStorage.setItem('client_brand', decodedBrand);
                      
                      // INJECT ABBEY BRANDING IF TRIGGERED
                    if (decodedBrand === 'Abbey Carpet & Floor') {
                        sessionStorage.setItem('client_logo', '/images/abbey-logo.png'); // Points to your local public file
                        sessionStorage.setItem('client_bg', '#003057'); // Corporate Abbey Blue
                        sessionStorage.setItem('client_text', '#C5A059'); // Corporate Abbey Gold 
                    }
                      shouldReplace = true;
                  } catch(e) {}
              }
              if (shouldReplace) window.location.replace(window.location.pathname);
          }

          const storedMargin = sessionStorage.getItem('client_margin');
          if (storedMargin !== null) setClientMargin(parseInt(storedMargin, 10));

          if (sessionStorage.getItem('magic_link_client') === 'true') setIsMagicLink(true);
      }
  }, [searchParams]);

  useEffect(() => {
      setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth).catch(() => {}));
            } else {
                await signInAnonymously(auth).catch(() => {});
            }
        }
      } catch (err) {
        console.warn("Auth init error:", err);
      }
    };
    initAuth();
    
    const unsub = onAuthStateChanged(auth, (currentUser) => {
        if (isMounted) {
            setUser(currentUser);
            setIsAuthReady(true);
        }
    });
    return () => {
        isMounted = false;
        unsub();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    let isMounted = true;
    const failsafeTimeout = setTimeout(() => {
        if (isMounted && !isDataLoaded) setIsDataLoaded(true);
    }, 4000);

    const unsubDb = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'), (snap) => {
      if (!isMounted) return;
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

          // SMART AUTO-TAGGER: Fills in the blanks if manufacturers forgot specs!
          const fullDesc = (data.desc || '').toLowerCase();
          let existingSpecs = data.specs || [];
          
          // Helper to safely check if a normalized spec exists
          const hasSpec = (targetKey) => {
              return existingSpecs.some(s => {
                  const parts = s.split(':');
                  return parts.length > 1 && normalizeSpecKey(parts[0]) === targetKey;
              });
          };
          
          if (data.category === 'Luxury Vinyl (LVP)') {
              // Ensure Waterproof exists
              if (!hasSpec('Waterproof')) {
                  existingSpecs.push('Waterproof: 100% Waterproof');
              }
              
              // Ensure Pad exists
              if (!hasSpec('Attached Pad')) {
                  if (fullDesc.includes('cork')) existingSpecs.push('Attached Pad: Attached Cork');
                  else existingSpecs.push('Attached Pad: Attached Pad');
              }

              // Ensure Core exists
              if (!hasSpec('Construction / Core')) {
                  if (fullDesc.includes('wpc')) existingSpecs.push('Construction / Core: WPC');
                  else if (fullDesc.includes('spc') || fullDesc.includes('rigid') || fullDesc.includes('solid')) existingSpecs.push('Construction / Core: SPC');
              }
          } else if (data.category === 'Hardwood') {
              // Ensure Core exists for Hardwood (Engineered vs Solid)
              if (!hasSpec('Construction / Core')) {
                  if (fullDesc.includes('solid') || data.displayTitle.toLowerCase().includes('solid')) {
                      existingSpecs.push('Construction / Core: Solid');
                  } else {
                      existingSpecs.push('Construction / Core: Engineered');
                  }
              }
          } else if (data.category === 'Carpet') {
              // Ensure Fiber Type exists for Carpet
              if (!hasSpec('Fiber Type')) {
                  if (fullDesc.includes('nylon')) existingSpecs.push('Fiber Type: Nylon');
                  else if (fullDesc.includes('triexta') || fullDesc.includes('smartstrand') || fullDesc.includes('sorona')) existingSpecs.push('Fiber Type: Triexta');
                  else if (fullDesc.includes('wool')) existingSpecs.push('Fiber Type: Wool');
                  else if (fullDesc.includes('polyester') || fullDesc.includes(' pet ')) existingSpecs.push('Fiber Type: Polyester');
              }
          } else {
              // Non-LVP/Hardwood auto-tags just in case
              if (fullDesc.includes('cork') && !hasSpec('Attached Pad')) {
                  existingSpecs.push('Attached Pad: Attached Cork');
              }
              
              if (!hasSpec('Construction / Core')) {
                  if (fullDesc.includes('wpc')) existingSpecs.push('Construction / Core: WPC');
                  else if (fullDesc.includes('spc') || fullDesc.includes('rigid') || fullDesc.includes('solid')) existingSpecs.push('Construction / Core: SPC');
              }
          }

          data.specs = existingSpecs;
          arr.push({ id: d.id, ...data });
        }
      });
      setLiveProductsRaw(arr);
      setIsDataLoaded(true);
      clearTimeout(failsafeTimeout);
    }, (error) => {
      if (isMounted) setIsDataLoaded(true);
      clearTimeout(failsafeTimeout);
    });
    
    return () => {
        isMounted = false;
        unsubDb();
        clearTimeout(failsafeTimeout);
    };
  }, [isAuthReady, user]); 

  const uniqueCategoriesList = useMemo(() => {
    return [...new Set(liveProductsRaw.map(p => p.category))].sort();
  }, [liveProductsRaw]);

  const isWholesale = user && !user.isAnonymous;
  const isClientMode = clientMargin !== null;

  const priceBounds = useMemo(() => {
    let min = 0; let max = 15;
    
    const categoryProducts = liveProductsRaw.filter(p => {
        if (activeCategory === "All Products") return p.category !== 'Carpet Cushion';
        if (activeCategory === "Hot Buys") return p.isSale === true;
        return p.category === activeCategory;
    });

    const prices = categoryProducts.map(p => {
        if (isClientMode) return p.price * (1 + clientMargin / 100);
        return isWholesale ? p.price : (p.retailPrice ? parseFloat(p.retailPrice) : p.price * 2.2);
    }).filter(v => !isNaN(v));
    
    if (prices.length > 0) {
        min = Math.floor(Math.min(...prices));
        max = Math.ceil(Math.max(...prices));
    }
    return { min, max };
  }, [liveProductsRaw, activeCategory, isWholesale, isClientMode, clientMargin]);

  useEffect(() => {
     if (liveProductsRaw.length > 0) {
         setMaxPrice(priceBounds.max);
     }
  }, [priceBounds.max, activeCategory]);

  const dynamicBrands = useMemo(() => {
      const brands = new Set();
      const relevantProducts = liveProductsRaw.filter(p => 
          (activeCategory === "All Products" && p.category !== 'Carpet Cushion') || 
          (activeCategory === "Hot Buys" && p.isSale) || 
          p.category === activeCategory
      );
      
      relevantProducts.forEach(p => {
          if (p.manufacturer) {
              brands.add(p.manufacturer.trim());
          }
      });

      return [...brands].sort();
  }, [liveProductsRaw, activeCategory]);

  const dynamicSpecs = useMemo(() => {
      let TARGET_SPECS = [
          "Waterproof",
          "Construction / Core",
          "Thickness",
          "Wear Layer",
          "Attached Pad",
          "Species",
          "Style Type",
          "Fiber Type",
          "Face Weight"
      ];

      // Dynamically remove hard surface filters if the user is looking at Carpet
      if (activeCategory === 'Carpet' || activeCategory === 'Carpet Cushion') {
          TARGET_SPECS = TARGET_SPECS.filter(s => 
              s !== "Construction / Core" && 
              s !== "Thickness" && 
              s !== "Waterproof" && 
              s !== "Wear Layer"
          );
      }
      
      const specMap = {}; 
      
      const relevantProducts = liveProductsRaw.filter(p => 
          (activeCategory === "All Products" && p.category !== 'Carpet Cushion') || 
          (activeCategory === "Hot Buys" && p.isSale) || 
          p.category === activeCategory
      );

      relevantProducts.forEach(p => {
          (p.specs || []).forEach(s => {
              const parts = s.split(':');
              if (parts.length >= 2) {
                  const rawKey = parts[0].trim();
                  const val = parts.slice(1).join(':').trim();
                  
                  const key = normalizeSpecKey(rawKey);
                  const matchedSpec = TARGET_SPECS.find(t => t.toLowerCase() === key.toLowerCase());
                  
                  if (matchedSpec && val.length > 0 && val.length < 40) {
                      // Pass the product category into the normalization engine so it knows context
                      const normalizedVal = normalizeSpecValue(matchedSpec, val, p.category);
                      
                      if (normalizedVal !== "None") {
                          if (!specMap[matchedSpec]) specMap[matchedSpec] = new Set();
                          specMap[matchedSpec].add(normalizedVal);
                      }
                  }
              }
          });
      });

      const result = {};
      TARGET_SPECS.forEach(specName => {
          if (specMap[specName] && specMap[specName].size > 0) { 
              result[specName] = [...specMap[specName]].sort((a, b) => {
                  if (specName === "Thickness") {
                      return (THICKNESS_ORDER[a] || 99) - (THICKNESS_ORDER[b] || 99);
                  }
                  if (specName === "Face Weight") {
                      return (FACE_WEIGHT_ORDER[a] || 99) - (FACE_WEIGHT_ORDER[b] || 99);
                  }
                  const numA = parseFloat(a);
                  const numB = parseFloat(b);
                  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                  return a.localeCompare(b);
              });
          }
      });
      return result;
  }, [liveProductsRaw, activeCategory]);

  const handleProgramToggle = (val) => {
      setSelectedPrograms(prev => prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]);
  };

  const handleBrandToggle = (brand) => {
      setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const handleSpecToggle = (key, val) => {
      setSelectedSpecs(prev => {
          const current = prev[key] || [];
          if (current.includes(val)) {
              const next = current.filter(v => v !== val);
              if (next.length === 0) {
                  const copy = { ...prev };
                  delete copy[key];
                  return copy;
              }
              return { ...prev, [key]: next };
          }
          return { ...prev, [key]: [...current, val] };
      });
  };

  const filteredProducts = useMemo(() => {
    const searchVal = searchQuery.toLowerCase().trim();
    
    return liveProductsRaw.filter(p => {
        const priceValue = isClientMode ? p.price * (1 + clientMargin / 100) : (isWholesale ? p.price : (p.retailPrice ? parseFloat(p.retailPrice) : (p.price * 2.2)));

        const nameLower = (p.displayTitle || '').toLowerCase();
        const skuLower = (p.sku || '').toLowerCase();
        const mfgLower = (p.manufacturer || '').toLowerCase();
        const descLower = (p.desc || '').toLowerCase();
        const specTextCombined = (p.specs || []).join(' ').toLowerCase();
        const catLower = (p.category || '').toLowerCase();
        
        // Map through the colors array and combine names/skus into a searchable string
        const colorsTextCombined = (p.colors || []).map(c => `${c.name || ''} ${c.sku || ''}`).join(' ').toLowerCase();

        // Inject hidden keywords so people searching "pad" find cushions
        const hiddenKeywords = catLower === 'carpet cushion' ? 'pad pads underlayment' : '';

        const matchesSearch = !searchVal || 
                              nameLower.includes(searchVal) || 
                              skuLower.includes(searchVal) || 
                              mfgLower.includes(searchVal) || 
                              descLower.includes(searchVal) || 
                              specTextCombined.includes(searchVal) ||
                              catLower.includes(searchVal) ||
                              colorsTextCombined.includes(searchVal) ||
                              hiddenKeywords.includes(searchVal);

        const matchesCategory = (activeCategory === "All Products" && (searchVal !== '' || p.category !== 'Carpet Cushion')) || 
                                (activeCategory === "Hot Buys" && p.isSale === true) || 
                                (p.category === activeCategory);

        const matchesPrice = isNaN(maxPrice) || (priceValue <= maxPrice);

        let matchesProgs = true;
        if (selectedPrograms.length > 0) {
            matchesProgs = selectedPrograms.every(prog => {
                if (prog === 'propmgt') return p.isPropMgt === true;
                if (prog === 'contractor') return p.isContractor === true;
                return false;
            });
        }

        let matchesBrands = true;
        if (selectedBrands.length > 0) {
            matchesBrands = selectedBrands.includes(p.manufacturer?.trim());
        }

        let matchesSpecs = true;
        if (Object.keys(selectedSpecs).length > 0) {
            matchesSpecs = Object.entries(selectedSpecs).every(([key, vals]) => {
                return p.specs?.some(s => {
                    const parts = s.split(':');
                    if (parts.length >= 2) {
                        const rawKey = parts[0].trim();
                        const pVal = parts.slice(1).join(':').trim();
                        
                        const pKey = normalizeSpecKey(rawKey);
                        
                        if (pKey.toLowerCase() === key.toLowerCase()) {
                            // Pass the category dynamically to correctly map things like Solid hardwood vs SPC LVP
                            const normalizedPVal = normalizeSpecValue(key, pVal, p.category);
                            return vals.includes(normalizedPVal);
                        }
                    }
                    return false;
                });
            });
        }

        return matchesSearch && matchesCategory && matchesPrice && matchesProgs && matchesBrands && matchesSpecs;
        
    }).sort((a, b) => {
        const pA = isClientMode ? a.price * (1 + clientMargin / 100) : (isWholesale ? a.price : (a.retailPrice ? parseFloat(a.retailPrice) : (a.price * 2.2)));
        const pB = isClientMode ? b.price * (1 + clientMargin / 100) : (isWholesale ? b.price : (b.retailPrice ? parseFloat(b.retailPrice) : (b.price * 2.2)));

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
  }, [liveProductsRaw, activeCategory, searchQuery, maxPrice, selectedPrograms, selectedBrands, selectedSpecs, sortMode, isWholesale, isClientMode, clientMargin]);

  const resetAllFilters = () => {
      setSearchQuery('');
      setMaxPrice(priceBounds.max);
      setSelectedPrograms([]);
      setSelectedBrands([]);
      setSelectedSpecs({});
      setSortMode('price-asc');
      if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
  };

  const getCategorySlug = (catName) => {
      if (catName === 'All Products') return '/category';
      if (catName === 'Hot Buys') return '/category/hot-buys';
      if (catName === 'Luxury Vinyl (LVP)') return '/category/luxury-vinyl';
      return `/category/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  const handleCategorySwitch = (catName) => {
      setIsMobileDrawerOpen(false);
      router.push(getCategorySlug(catName), { scroll: true });
  };

  const renderSpecFilters = () => {
      return (
          <>
            {dynamicBrands.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Brands & Manufacturers</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {dynamicBrands.map(brand => (
                            <label key={brand} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gold transition">
                                <input 
                                    type="checkbox" 
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => handleBrandToggle(brand)}
                                    className="accent-gold h-3.5 w-3.5 rounded border-gray-300" 
                                /> 
                                <span className="truncate">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {Object.keys(dynamicSpecs).length > 0 && activeCategory !== 'All Products' && activeCategory !== 'Hot Buys' && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Specifications</label>
                    <div className="space-y-4">
                        {Object.entries(dynamicSpecs).map(([specKey, specVals]) => (
                            <div key={specKey}>
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">{specKey}</div>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {specVals.map(val => (
                                        <label key={val} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gold transition">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSpecs[specKey]?.includes(val) || false}
                                                onChange={() => handleSpecToggle(specKey, val)}
                                                className="accent-gold h-3.5 w-3.5 rounded border-gray-300" 
                                            /> 
                                            <span className="truncate">{val}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
      );
  };

  let heroImage = 'images/heros/main-hero.jpg';
  if (activeCategory === 'Luxury Vinyl (LVP)') heroImage = 'images/heros/lvp.jpg';
  else if (activeCategory === 'Carpet' || activeCategory === 'Carpet Cushion') heroImage = 'images/heros/carpet.jpg';
  else if (activeCategory === 'Laminate') heroImage = 'images/heros/laminate.jpg';
  else if (activeCategory === 'Hardwood') heroImage = 'images/heros/hardwood.jpg';

  const heroFbUrl = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(heroImage)}?alt=media`;
  const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

  const exitBtnBg = typeof window !== 'undefined' ? (sessionStorage.getItem('client_bg') || '#ef4444') : '#ef4444';
  const exitBtnText = typeof window !== 'undefined' ? (sessionStorage.getItem('client_text') || '#ffffff') : '#ffffff';

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      {isClientMode && !isMagicLink && (
          <button 
              onClick={() => { 
                  sessionStorage.removeItem('client_margin'); 
                  sessionStorage.removeItem('client_brand'); 
                  sessionStorage.removeItem('client_logo');
                  sessionStorage.removeItem('client_bg');
                  sessionStorage.removeItem('client_text');
                  sessionStorage.removeItem('magic_link_client');
                  window.location.reload(); 
              }} 
              className="fixed bottom-6 left-6 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl z-[200] transition-opacity hover:opacity-80 flex items-center gap-2 border border-black/10 cursor-pointer"
              style={{ backgroundColor: exitBtnBg, color: exitBtnText }}
          >
              <span>✕</span> Exit Client Mode
          </button>
      )}

      <header 
        className="relative min-h-[250px] md:min-h-[320px] py-12 flex items-center justify-center text-center text-white transition-all duration-500"
        style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('${heroFbUrl}')`, 
            backgroundSize: "cover", 
            backgroundPosition: "center"
        }}
      >
        <div className="max-w-3xl px-4">
            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">{activeCategory === 'Hot Buys' ? '🔥 Hot Buys' : activeCategory}</h1>
            <p className="text-xs md:text-sm text-gray-200 uppercase tracking-widest font-bold">Curated collections of premium flooring solutions</p>
        </div>
      </header>

      <section className="py-6 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24 self-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-y-auto max-h-[85vh]">
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
                        {['All Products', 'Hot Buys', 'Luxury Vinyl (LVP)', 'Hardwood', 'Carpet', 'Laminate', 'Carpet Cushion'].map(cat => {
                            if (cat === 'Hot Buys' && (!isWholesale || isClientMode)) return null;
                            return (
                                <button key={cat} onClick={() => handleCategorySwitch(cat)} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategory === cat ? 'bg-gold text-black font-black' : (cat === 'Hot Buys' ? 'text-red-600 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100')}`}>
                                    {cat === 'All Products' ? '🌐 All Collections' : cat === 'Hot Buys' ? '🔥 Hot Buys (On Sale)' : cat}
                                </button>
                            );
                        })}
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

                {!isClientMode && activeCategory !== 'All Products' && activeCategory !== 'Hot Buys' && (
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
                )}

                {renderSpecFilters()}

                <div className="pt-4 border-t border-gray-100">
                    <button onClick={resetAllFilters} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black border border-gray-200 font-bold text-[10px] uppercase py-2 rounded-xl transition outline-none cursor-pointer">
                        Clear Active Filters
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <button onClick={() => setIsMobileDrawerOpen(true)} className="lg:hidden bg-black text-white hover:bg-gold hover:text-black transition-colors px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 outline-none cursor-pointer shrink-0">
                            <span>⚙️</span> Filters
                        </button>
                        
                        {/* NEW: Mobile-only inline search bar */}
                        <div className="relative flex-1 lg:hidden">
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                placeholder="Search products..." 
                                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-gold" 
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400 text-xs">🔍</span>
                        </div>

                        <span className="hidden sm:inline-block text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">{isDataLoaded ? `Showing ${filteredProducts.length} Results` : 'Loading...'}</span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <span className="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">{isDataLoaded ? `${filteredProducts.length} Results` : '...'}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
                            <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-gold font-bold text-gray-700 cursor-pointer">
                                <option value="default">Category & Name</option>
                                {!isClientMode && <option value="propmgt">Property Mgt First</option>}
                                {!isClientMode && <option value="contractor">Contractor Pro First</option>}
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
                            const finalPrice = isClientMode 
                                ? (p.price * (1 + clientMargin / 100)).toFixed(2)
                                : (isWholesale ? p.price.toFixed(2) : (p.retailPrice ? parseFloat(p.retailPrice).toFixed(2) : (p.price * 2.2).toFixed(2)));
                            
                            const retailPriceValue = p.retailPrice ? parseFloat(p.retailPrice) : (p.price * 2.2);
                            const retailPriceFormatted = !isNaN(retailPriceValue) ? retailPriceValue.toFixed(2) : '--';
                            const wholesalePriceFormatted = p.price ? p.price.toFixed(2) : '--';
                            
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
                            const rawPath = `images/${folderName}/${safePrefix}${displaySku}_${mainType}.jpg`.toLowerCase();
                            const fbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
                            
                            return (
                                <div key={p.id} className={isListView ? "bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row items-center p-4 gap-6 hover:shadow-md transition relative" : "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition relative"}>
                                    
                                    {!isClientMode && (
                                        <div className={`absolute z-10 flex flex-col items-start ${isListView ? 'top-2 left-2 gap-1' : 'top-4 left-4 gap-1.5'}`}>
                                            {p.isSale && <div className={`bg-red-600 text-white font-black rounded-full uppercase tracking-widest shadow-md ${isListView ? 'text-[9px] px-2.5 py-1' : 'text-[9px] px-3 py-1.5 flex items-center gap-1 animate-pulse'}`}><span>🔥</span> HOT BUY</div>}
                                            {p.isPropMgt && <div className={`bg-black text-gold font-black rounded-full uppercase tracking-widest shadow-md flex items-center border border-gold/30 ${isListView ? 'text-[9px] px-2.5 py-1 gap-1.5' : 'text-[9px] px-3 py-1.5 gap-1.5'}`}><span className="text-[12px] bg-white rounded px-0.5 shadow-sm text-black">🏢</span> Prop Mgt</div>}
                                            {p.isContractor && <div className={`bg-purple-100 text-purple-800 font-black rounded-full uppercase tracking-widest shadow-md flex items-center ${isListView ? 'text-[9px] px-2.5 py-1 gap-1' : 'text-[9px] px-3 py-1.5 gap-1'}`}><span>🛠️</span> Pro Select</div>}
                                        </div>
                                    )}

                                    <Link href={`/product/${p.id}`} className={isListView ? "w-full sm:w-40 h-28 rounded-lg overflow-hidden shrink-0 bg-gray-50 mt-8 sm:mt-0 block" : "block overflow-hidden h-52 bg-gray-50 relative"} style={{ textDecoration: 'none' }}>
                                        <img src={fbPath} className="w-full h-full object-cover transition duration-300 hover:scale-105" onError={e => e.target.src=TBD_IMG} />
                                    </Link>

                                    {!isListView && (
                                        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-1.5 min-h-[40px] items-center">
                                            {colors.slice(0, 6).map(c => {
                                                const sType = p.category === 'Carpet' ? 'swatch' : 'main';
                                                const swatchRawPath = `images/${folderName}/${safePrefix}${c.sku}_${sType}.jpg`.toLowerCase();
                                                const swatchFbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(swatchRawPath)}?alt=media`;
                                                return (
                                                    <button key={c.sku} onMouseEnter={() => setActivePreviews(prev => ({...prev, [p.id]: c.sku}))} onClick={(e) => { e.preventDefault(); setActivePreviews(prev => ({...prev, [p.id]: c.sku})); }} className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 transition-transform hover:scale-125 focus:scale-125 focus:outline-none bg-gray-100 cursor-pointer" title={c.name}>
                                                        <img src={swatchFbPath} className="w-full h-full object-cover pointer-events-none" onError={e => e.target.src=TBD_IMG} />
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
                                                {!isClientMode && <span className={isListView ? "text-[10px] text-gray-400 font-bold uppercase font-mono" : ""}>{p.sku}</span>}
                                            </div>
                                            {!isListView && (
                                                <>
                                                <h3 className="text-lg font-bold text-gray-900 truncate"><Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.displayTitle}</Link></h3>
                                                <p className="text-gray-500 text-xs line-clamp-2">{safeDesc}</p>
                                                </>
                                            )}
                                        </div>

                                        {isListView && (
                                            <>
                                                <h3 className="text-lg font-bold text-gray-900 truncate"><Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{p.displayTitle}</Link></h3>
                                                <p className="text-gray-500 text-xs line-clamp-2">{safeDesc}</p>
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1.5">
                                                    {colors.slice(0, 6).map(c => {
                                                        const sType = p.category === 'Carpet' ? 'swatch' : 'main';
                                                        const swatchRawPath = `images/${folderName}/${safePrefix}${c.sku}_${sType}.jpg`.toLowerCase();
                                                        const swatchFbPath = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(swatchRawPath)}?alt=media`;
                                                        return (
                                                            <button key={c.sku} onMouseEnter={() => setActivePreviews(prev => ({...prev, [p.id]: c.sku}))} onClick={(e) => { e.preventDefault(); setActivePreviews(prev => ({...prev, [p.id]: c.sku})); }} className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 transition-transform hover:scale-125 focus:scale-125 focus:outline-none bg-gray-100 cursor-pointer" title={c.name}>
                                                                <img src={swatchFbPath} className="w-full h-full object-cover pointer-events-none" onError={e => e.target.src=TBD_IMG} />
                                                            </button>
                                                        )
                                                    })}
                                                    {colors.length > 6 && <span className="text-[9px] font-bold text-gray-400 self-center ml-1">+{colors.length - 6} more</span>}
                                                </div>
                                            </>
                                        )}

                                        <div className={isListView ? "w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 text-center sm:text-right shrink-0 flex flex-col justify-center" : "space-y-3 pt-3 border-t border-gray-50"}>
                                            
                                            {isClientMode ? (
                                                isListView ? (
                                                    <>
                                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</div>
                                                        <div className="text-xl font-black text-gray-950 mb-3 font-mono">${finalPrice} <span className="text-xs font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between items-baseline mt-1">
                                                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Price</span>
                                                        <span className="text-base font-black text-gray-900 font-mono">${finalPrice} <span className="text-[10px] font-bold text-gray-400 font-sans">/{p.unit || 'sqft'}</span></span>
                                                    </div>
                                                )
                                            ) : isWholesale ? (
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

                                            <div className={`flex gap-2 w-full ${isListView ? 'mt-2' : ''}`}>
                                                <Link href={`/product/${p.id}`} className={isListView ? "flex-1 w-full block text-center bg-black hover:bg-gold text-white hover:text-black font-black uppercase py-2 rounded-lg transition text-[10px] tracking-widest" : "flex-1 w-full block text-center border border-black hover:bg-black text-black hover:text-white font-black uppercase py-2.5 rounded-xl transition text-[10px] tracking-widest"} style={{ textDecoration: 'none' }}>View Details</Link>
                                                <button onClick={(e) => handleShare(e, p)} className={`shrink-0 flex items-center justify-center border border-gray-200 text-gray-500 hover:text-gold hover:border-gold transition-colors cursor-pointer outline-none ${isListView ? 'w-9 rounded-lg' : 'w-10 rounded-xl'}`} title="Share Product">
                                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M15 12a3 3 0 100 6 3 3 0 000-6zm0-6a3 3 0 100 6 3 3 0 000-6z"></path></svg>
                                                </button>
                                            </div>
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

      {/* Mobile Drawer */}
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
                        {['All Products', 'Hot Buys', 'Luxury Vinyl (LVP)', 'Hardwood', 'Carpet', 'Laminate', 'Carpet Cushion'].map(cat => {
                            if (cat === 'Hot Buys' && (!isWholesale || isClientMode)) return null;
                            return (
                                <button key={cat} onClick={() => handleCategorySwitch(cat)} className={`text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${activeCategory === cat ? 'bg-gold text-black font-black' : (cat === 'Hot Buys' ? 'text-red-600 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100')}`}>
                                    {cat === 'All Products' ? '🌐 All Collections' : cat === 'Hot Buys' ? '🔥 Hot Buys (On Sale)' : cat}
                                </button>
                            );
                        })}
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

                {!isClientMode && activeCategory !== 'All Products' && activeCategory !== 'Hot Buys' && (
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
                )}
                
                {renderSpecFilters()}

                <div className="pt-4 flex gap-3">
                    <button onClick={resetAllFilters} className="flex-1 bg-gray-50 border border-gray-200 font-bold text-xs uppercase py-3 rounded-xl transition text-center text-gray-500 outline-none cursor-pointer">Reset</button>
                    <button onClick={() => setIsMobileDrawerOpen(false)} className="flex-1 bg-black hover:bg-gold text-white font-black text-xs uppercase py-3 rounded-xl transition text-center outline-none cursor-pointer">View Results</button>
                </div>
            </div>
          </div>
      )}

      {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] animate-in slide-in-from-bottom-5">
              <span className="font-black text-gold">✓</span>
              <p className="font-bold text-xs uppercase tracking-widest m-0">{toastMessage}</p>
          </div>
      )}
    </main>
  );
}

export default function CategoryViewer(props) {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div>
            </div>
        }>
            <CategoryViewerContent {...props} />
        </Suspense>
    );
}