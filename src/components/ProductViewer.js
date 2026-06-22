"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { doc, onSnapshot, updateDoc, arrayUnion, collection, query, where, getDocs, getDoc, addDoc, setDoc } from "firebase/firestore";
import { auth, db, appId } from "../lib/firebase";

function ProductViewerContent({ initialProduct }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlColorSku = searchParams.get('color');

    const [user, setUser] = useState(null);
    const [productData, setProductData] = useState(initialProduct);

    const [activeColor, setActiveColor] = useState(() => {
        if (initialProduct?.colors && initialProduct.colors.length > 0) {
            if (urlColorSku) {
                const found = initialProduct.colors.find(c => c.sku === urlColorSku);
                if (found) return found;
            }
            return initialProduct.colors[0];
        }
        return null;
    });
    
    const [activeView, setActiveView] = useState(() => {
        return (initialProduct?.views && initialProduct.views[0]) || 'MAIN';
    });

    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    const [quoteClientName, setQuoteClientName] = useState('');
    const [quoteProjectName, setQuoteProjectName] = useState('');

    const [calcNetSqft, setCalcNetSqft] = useState('');
    const [calcWaste, setCalcWaste] = useState('1.10');
    
    const [padSelection, setPadSelection] = useState('none');
    const [padCost, setPadCost] = useState('0.00');
    
    // Dynamic Addons State
    const [globalAddons, setGlobalAddons] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const [laborPrep, setLaborPrep] = useState(''); 
    const [laborInstallPerSqft, setLaborInstallPerSqft] = useState(''); 
    const [laborDelivery, setLaborDelivery] = useState(''); 
    const [customLabor1Name, setCustomLabor1Name] = useState('');
    const [customLabor1Cost, setCustomLabor1Cost] = useState('');
    const [customLabor2Name, setCustomLabor2Name] = useState('');
    const [customLabor2Cost, setCustomLabor2Cost] = useState('');
    
    const [clientMargin, setClientMargin] = useState(null);
    const [builderMargin, setBuilderMargin] = useState(20);
    const [useCustomBranding, setUseCustomBranding] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isMagicLink, setIsMagicLink] = useState(false);

    const [proBoards, setProBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState('');
    const [isSavingToBoard, setIsSavingToBoard] = useState(false);
    const [boardSaveMessage, setBoardSaveMessage] = useState('');
    
    const [availablePads, setAvailablePads] = useState([]);

    const TBD_IMG = `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/tbd.jpg')}?alt=media`;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cmParam = searchParams.get('cm');
            const proParam = searchParams.get('pro');
            const cbParam = searchParams.get('cb'); 

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
                            
                            let decodedMargin = 20;
                            if (cmParam) {
                                decodedMargin = parseInt(atob(cmParam), 10);
                                if (!isNaN(decodedMargin)) sessionStorage.setItem('client_margin', decodedMargin);
                            } else if (pData.clientMargin !== undefined) {
                                sessionStorage.setItem('client_margin', pData.clientMargin);
                                decodedMargin = pData.clientMargin;
                            }
                            
                            sessionStorage.setItem('magic_link_client', 'true');
                            
                            const colorParam = urlColorSku ? `?color=${urlColorSku}` : '';
                            window.location.replace(`${window.location.pathname}${colorParam}`);
                        }
                    } catch(err) {
                        console.error(err);
                    }
                };
                fetchProBranding();
            } else {
                let updated = false;
                if (cmParam) {
                    try {
                        const decoded = parseInt(atob(cmParam), 10);
                        if (!isNaN(decoded)) {
                            sessionStorage.setItem('client_margin', decoded);
                            sessionStorage.setItem('magic_link_client', 'true');
                            updated = true;
                        }
                    } catch(e) {}
                }
                if (cbParam) {
                    try {
                        const decodedBrand = atob(cbParam);
                        sessionStorage.setItem('client_brand', decodedBrand);
                        updated = true;
                    } catch(e) {}
                }

                if (updated) {
                    const colorParam = urlColorSku ? `?color=${urlColorSku}` : '';
                    window.location.replace(`${window.location.pathname}${colorParam}`);
                }
            }

            const storedMargin = sessionStorage.getItem('client_margin');
            if (storedMargin !== null) {
                setClientMargin(parseInt(storedMargin, 10));
                setBuilderMargin(parseInt(storedMargin, 10));
            }
            if (sessionStorage.getItem('magic_link_client') === 'true') setIsMagicLink(true);
        }
    }, [searchParams, urlColorSku]);

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
        return () => { isMounted = false; unsubscribe(); };
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'pricing', initialProduct.id), (docSnap) => {
            if (docSnap.exists()) {
                const dbData = docSnap.data();
                dbData.displayTitle = (dbData.usePrivateName && dbData.privateName) ? dbData.privateName : (dbData.name || 'Unnamed Product');
                setProductData({ id: docSnap.id, ...dbData });
            }
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

    useEffect(() => {
        if (user && !user.isAnonymous) {
            const fetchBoards = async () => {
                try {
                    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'client_boards'), where("proId", "==", user.uid));
                    const snapshot = await getDocs(q);
                    const boardsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    setProBoards(boardsData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)));
                    if (boardsData.length > 0) setSelectedBoardId(boardsData[0].id);
                } catch (e) {
                    console.error("Error fetching boards", e);
                }
            };
            fetchBoards();
        }
    }, [user]);

    useEffect(() => {
        const isCarpetProd = productData?.category === 'Carpet' || (productData?.category || '').toLowerCase().includes('carpet');
        const isClientModeActual = clientMargin !== null;
        
        if (!isClientModeActual) {
            const fetchConfig = async () => {
                try {
                    if (isCarpetProd) {
                        const padQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'), where("category", "==", "Carpet Cushion"));
                        const padSnap = await getDocs(padQ);
                        // Filter for visible pads directly in JavaScript to bypass Firebase Composite Index crash
                        const pads = padSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isVisible !== false);
                        setAvailablePads(pads);
                    }

                    // Fetch Addon Rules from Firebase (Using hyphenated ID)
                    const addonSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'proposal-addons'));
                    if (addonSnap.exists()) {
                        setGlobalAddons(addonSnap.data());
                    }
                } catch(e) { console.error("Error fetching config", e); }
            };
            fetchConfig();
        }
    }, [productData, clientMargin]);

    useEffect(() => {
        if (padSelection === 'none') {
            setPadCost('0.00');
        } else if (padSelection !== 'custom_legacy') {
            const pad = availablePads.find(p => p.id === padSelection);
            if (pad) {
                // Determine base price based on SF vs SY configurations
                let basePadPrice = pad.price || 0;
                if (pad.unit === 'sqyd') {
                    basePadPrice = basePadPrice / 9; // Convert to per sqft for the UI input
                }
                setPadCost(basePadPrice.toFixed(2));
            }
        }
    }, [padSelection, availablePads]);

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

  const shareProduct = async () => {
      let targetPath = `/product/${productData.id}?color=${activeColor?.sku || ''}`;
      
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

      const title = productData.displayTitle;
      const plainText = `${title}\n${finalUrl}`;
      const htmlText = `<a href="${finalUrl}">${title}</a>`;
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isDesktop = !isMobile;

      if (navigator.share && isMobile) {
          navigator.share({ title: title, text: title, url: finalUrl }).catch(console.error);
      } else {
          const copyRichLink = async () => {
              if (navigator.clipboard && window.ClipboardItem && isDesktop) {
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
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          };
          copyRichLink();
      }
  };

  const isClientMode = clientMargin !== null;
    const basePrice = productData?.price || 0;
    const isCarpet = productData?.category === 'Carpet' || (productData?.category || '').toLowerCase().includes('carpet');
    const isCarpetCushionOnly = productData?.category === 'Carpet Cushion';
    
    let cartonSqft = parseFloat(productData?.cartonSize);
    if (isNaN(cartonSqft) || cartonSqft <= 0) cartonSqft = parseFloat(productData?.boxSqft);
    if (!cartonSqft && productData?.specs && Array.isArray(productData.specs)) {
        const specText = productData.specs.join(' ').toLowerCase();
        const sqftMatch = specText.match(/([\d.]+)\s*(sq\.?ft\.?|sq\s*ft|sf)/);
        if (sqftMatch && parseFloat(sqftMatch[1]) > 0) cartonSqft = parseFloat(sqftMatch[1]);
    }
    cartonSqft = cartonSqft || (isCarpetCushionOnly ? 360 : 20); // Default pad roll is often 40 sqyd (360 sqft)

    const netSqftNum = parseFloat(calcNetSqft) || 0;
    const totalSqftWithWaste = netSqftNum * parseFloat(calcWaste);
    
    const requiredSqYd = Math.ceil(totalSqftWithWaste / 9);
    const requiredCartons = Math.ceil(totalSqftWithWaste / cartonSqft);
    
    let finalMaterialQty = requiredCartons;
    let finalMaterialUnit = 'cartons';
    let finalMaterialCoverageSqft = requiredCartons * cartonSqft;

    if (isCarpet) {
        finalMaterialQty = requiredSqYd;
        finalMaterialUnit = 'sqyd';
        finalMaterialCoverageSqft = requiredSqYd * 9;
    } else if (isCarpetCushionOnly) {
        finalMaterialQty = requiredCartons; 
        finalMaterialUnit = 'rolls';
        finalMaterialCoverageSqft = requiredCartons * cartonSqft;
    }
    
    // Normalize DB Price depending on unit
    let normalizedPerSqftPrice = basePrice;
    if (productData?.unit === 'sqyd') {
        normalizedPerSqftPrice = basePrice / 9;
    }
    const totalMaterialCost = finalMaterialCoverageSqft * normalizedPerSqftPrice;

    // Pad calculations with Roll Rounding
    let totalPadCost = 0;
    let requiredPadSqyd = 0;
    let requiredPadRolls = 0;
    
    if (isCarpet && padSelection !== 'none') {
        let padRollSqft = 360; // 40 sqyd default
        if (padSelection !== 'custom_legacy') {
            const padDoc = availablePads.find(p => p.id === padSelection);
            if (padDoc && padDoc.cartonSize) {
                padRollSqft = parseFloat(padDoc.cartonSize);
                if (padDoc.unit === 'sqyd') {
                    padRollSqft = parseFloat(padDoc.cartonSize) * 9;
                }
            }
        }
        
        requiredPadRolls = Math.ceil(finalMaterialCoverageSqft / padRollSqft);
        const actualPadSqftToPurchase = requiredPadRolls * padRollSqft;
        requiredPadSqyd = actualPadSqftToPurchase / 9;
        
        // padCost input is in $ per sqft
        totalPadCost = actualPadSqftToPurchase * (parseFloat(padCost) || 0);
    }

    // Dynamic Addons Cost
    const totalAddonsCost = selectedAddons.reduce((sum, item) => sum + ((parseFloat(item.cost) || 0) * (parseInt(item.qty) || 0)), 0);

    const totalLaborCost = 
        (parseFloat(laborPrep) || 0) + 
        (netSqftNum * (parseFloat(laborInstallPerSqft) || 0)) + 
        (parseFloat(laborDelivery) || 0) + 
        (parseFloat(customLabor1Cost) || 0) + 
        (parseFloat(customLabor2Cost) || 0);

    const totalWholesaleProjectCost = totalMaterialCost + totalPadCost + totalAddonsCost + totalLaborCost;
    const turnkeyRetailPrice = totalWholesaleProjectCost * (1 + (builderMargin / 100));

    const handleSaveToBoard = async () => {
        if (!selectedBoardId) return alert("Please select a board to save this product to.");
        setIsSavingToBoard(true);

        try {
            const productToSave = {
                productId: productData.id,
                name: productData.displayTitle,
                colorSku: activeColor?.sku || '',
                colorName: activeColor?.name || '',
                category: productData.category || '',
                imgPrefix: productData.imgPrefix || '',
                quote: null,
                addedAt: new Date().toISOString()
            };

            const boardRef = doc(db, 'artifacts', appId, 'public', 'data', 'client_boards', selectedBoardId);
            await updateDoc(boardRef, { products: arrayUnion(productToSave) });
            
            const boardName = proBoards.find(b => b.id === selectedBoardId)?.name || 'Board';
            setBoardSaveMessage(`Saved to ${boardName}`);
            setTimeout(() => setBoardSaveMessage(''), 2000);
        } catch (err) {
            console.error("Error saving product to board", err);
            alert("Failed to save product.");
        } finally {
            setIsSavingToBoard(false);
        }
    };

    const handleSaveStandaloneQuote = async () => {
        if (!quoteClientName.trim()) return alert("Please enter a Client Name for this proposal.");
        setIsSavingToBoard(true);

        try {
            let padNameToSave = '';
            if (padSelection === 'custom_legacy') padNameToSave = "Legacy Pad / Custom";
            else if (padSelection !== 'none') {
                const found = availablePads.find(p => p.id === padSelection);
                if (found) padNameToSave = found.name || found.displayTitle;
            }

            const quoteDoc = {
                proId: user.uid,
                clientName: quoteClientName,
                projectName: quoteProjectName || 'Flooring Project',
                useCustomBranding: useCustomBranding,
                productId: productData.id,
                productName: productData.displayTitle,
                colorSku: activeColor?.sku || '',
                colorName: activeColor?.name || '',
                imgPrefix: productData.imgPrefix || '',
                category: productData.category || '',
                measurements: { waste: parseFloat(calcWaste), netSqft: netSqftNum, coverageSqft: finalMaterialCoverageSqft },
                material: { qty: finalMaterialQty, unit: finalMaterialUnit, wholesaleTotal: totalMaterialCost },
                addons: {
                    pad: padNameToSave ? { name: padNameToSave, cost: totalPadCost, sqyd: requiredPadSqyd, rolls: requiredPadRolls } : null,
                    customList: selectedAddons.length > 0 ? { cost: totalAddonsCost, items: selectedAddons } : null
                },
                services: {
                    prep: parseFloat(laborPrep) || 0,
                    installTotal: netSqftNum * (parseFloat(laborInstallPerSqft) || 0),
                    delivery: parseFloat(laborDelivery) || 0,
                    custom1: (customLabor1Name && parseFloat(customLabor1Cost) > 0) ? { name: customLabor1Name, cost: parseFloat(customLabor1Cost) } : null,
                    custom2: (customLabor2Name && parseFloat(customLabor2Cost) > 0) ? { name: customLabor2Name, cost: parseFloat(customLabor2Cost) } : null
                },
                totals: { wholesale: totalWholesaleProjectCost, margin: builderMargin, turnkeyRetail: turnkeyRetailPrice },
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'pro_quotes'), quoteDoc);
            
            setBoardSaveMessage(`Proposal Saved!`);
            setTimeout(() => { 
                setBoardSaveMessage(''); 
                setIsBuilderOpen(false); 
                setQuoteClientName('');
                setQuoteProjectName('');
            }, 2000);
        } catch (err) {
            console.error("Error saving proposal", err);
            alert("Failed to save proposal.");
        } finally {
            setIsSavingToBoard(false);
        }
    };

    const finalPrice = isClientMode ? normalizedPerSqftPrice * (1 + clientMargin / 100) : normalizedPerSqftPrice;
    const wsPrice = finalPrice.toFixed(2);
    
    // Render Pricing correctly whether it's carpet or hardsurface
    const renderPriceBlock = () => {
        if (isCarpet || isCarpetCushionOnly) {
            const priceSy = (finalPrice * 9).toFixed(2);
            return (
                <span className="text-[2.2rem] text-gray-900 font-black leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/sqft</span> <span className="text-lg font-bold text-gray-400 ml-1">(${priceSy} /sqyd)</span></span>
            );
        }
        return (
            <span className="text-[2.2rem] text-gray-900 font-black leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/{productData.unit || 'sqft'}</span></span>
        );
    };

    const renderWholesalePriceBlock = () => {
        if (isCarpet || isCarpetCushionOnly) {
            const priceSy = (normalizedPerSqftPrice * 9).toFixed(2);
            return (
                <span className="text-[2rem] text-red-700 font-bold leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/sqft</span> <span className="text-lg font-bold text-red-700/60 ml-1">(${priceSy} /sqyd)</span></span>
            );
        }
        return (
            <span className="text-[2rem] text-red-700 font-bold leading-none">${wsPrice} <span className="text-sm font-normal text-gray-500">/{productData.unit || 'sqft'}</span></span>
        );
    };

    const renderTitleBlock = (isDesktop) => (
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 lg:mb-2 gap-4 ${isDesktop ? 'hidden lg:flex' : 'flex lg:hidden'}`}>
            <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold m-0 leading-tight text-gray-900">{productData.displayTitle}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 mb-2 sm:mb-4">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{productData.category}</span>
                    
                    {!isClientMode && user && !user.isAnonymous && productData.manufacturer && (
                        <span className="inline-block px-3 py-1 bg-[#fdfdfd] border border-gray-200 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0">
                            <span className="text-gray-400 font-normal mr-1">Mfg:</span> {productData.manufacturer} {productData.sku ? `(${productData.sku})` : ''}
                        </span>
                    )}
                    {!isClientMode && productData.isSale && <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shrink-0">🔥 HOT BUY</span>}
                    {!isClientMode && productData.isPropMgt && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-gold border border-gold/30 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0"><span className="text-[12px] bg-white rounded px-0.5 shadow-sm text-black">🏢</span> Prop Mgt</span>}
                    {!isClientMode && productData.isContractor && <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0"><span>🛠️</span> Pro Select</span>}
                    {!isClientMode && productData.isVisible === false && <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">⚠️ Unlisted Draft</span>}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-20">
                <button onClick={shareProduct} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-full transition-all shadow-sm text-sm font-bold shrink-0 cursor-pointer outline-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M15 12a3 3 0 100 6 3 3 0 000-6zm0-6a3 3 0 100 6 3 3 0 000-6z"></path></svg>
                    {copied ? "Copied!" : "Share"}
                </button>
            </div>
        </div>
    );

    const renderColorSwatches = (isDesktop) => (
        <div className={`${isDesktop ? 'hidden lg:block my-6' : 'block lg:hidden mt-8'}`}>
            <div className="flex justify-between items-end mb-4 pr-2">
                <h2 className="text-xl font-bold">Select a Color: {activeColor?.name}</h2>
                {!isDesktop && (productData.colors?.length > 3) && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                        Swipe <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </span>
                )}
            </div>
            <div className={isDesktop 
                ? "grid grid-cols-[repeat(auto-fill,minmax(85px,1fr))] gap-3 mb-6" 
                : "flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-6"
            }>
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
                        <div key={c.sku} className={`cursor-pointer text-center group ${!isDesktop ? 'snap-start shrink-0 w-[85px]' : ''}`} onClick={() => {
                            router.replace(`/product/${productData.id}?color=${c.sku}`, { scroll: false });
                            setActiveColor(c);
                        }}>
                            <div className={`relative w-full aspect-square border-2 rounded-md transition duration-200 bg-gray-100 overflow-hidden ${activeColor?.sku === c.sku ? 'border-gold shadow-[0_0_8px_rgba(197,160,89,0.4)]' : 'border-transparent group-hover:border-gray-300'}`}>
                                <Image src={fbPath} alt={c.name} fill sizes="100px" className="object-cover" onError={(e) => { e.currentTarget.srcset = ''; e.currentTarget.src = TBD_IMG; }} />
                            </div>
                            <span className="text-[11px] mt-1.5 block text-gray-600 h-[2.5em] overflow-hidden leading-tight">{c.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const categoryAddons = globalAddons && productData?.category ? (globalAddons[productData.category] || globalAddons['Default'] || []) : [];

    return (
        <div className="flex-1 max-w-[1400px] mx-auto px-4 py-10 w-full flex flex-col lg:flex-row gap-10 relative">
          
          {/* MOBILE TITLE */}
          {renderTitleBlock(false)}

          {/* LEFT COLUMN */}
          <div className="flex-1 w-full lg:min-w-[450px] lg:sticky lg:top-24 self-start z-10">
            <div className="w-full aspect-[4/3] rounded-lg bg-gray-50 border border-gray-200 overflow-hidden relative cursor-zoom-in group" onClick={() => activeView !== 'VIDEO' && setIsLightboxOpen(true)}>
                {activeView === 'VIDEO' ? (
                    <video src={getMediaPath('VIDEO') || ''} className="w-full h-full object-cover" controls autoPlay loop muted playsInline />
                ) : (
                    <Image src={getMediaPath(activeView) || TBD_IMG} alt="Product" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-opacity duration-200 group-hover:opacity-85" onError={(e) => { e.currentTarget.srcset = ''; e.currentTarget.src = TBD_IMG; }} style={{ objectFit: activeView === '1TO1' ? 'contain' : 'cover' }} />
                )}
            </div>

            {productData.views && (
                <div className="mt-4 flex gap-3">
                    {productData.views.map(v => (
                         <Image key={v} src={v === 'VIDEO' ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23c5a059" width="48px" height="48px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>' : (getMediaPath(v) || TBD_IMG)} width={75} height={75} className={`w-[75px] h-[75px] min-w-[75px] shrink-0 object-cover border-2 rounded cursor-pointer transition ${activeView === v ? 'border-gold shadow-md' : 'border-gray-200 bg-gray-100'}`} onClick={() => setActiveView(v)} onError={(e) => { e.currentTarget.srcset = ''; e.currentTarget.src = TBD_IMG; }} alt={`View ${v}`} />
                    ))}
                </div>
            )}

            <div className="flex gap-4 mt-6">
                {!isClientMode && (
                    <Link href={`/quote?product=${encodeURIComponent(productData.displayTitle)}&color=${encodeURIComponent(activeColor?.name || '')}`} className="flex-1 bg-black text-white text-center py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gold transition-colors border-2 border-black hover:border-gold" style={{ textDecoration: 'none' }}>Get A Quote</Link>
                )}
                <Link href={`/order-sample?product=${encodeURIComponent(productData.displayTitle)}&color=${encodeURIComponent(activeColor?.name || '')}`} className="flex-1 bg-white text-black text-center py-4 rounded font-bold uppercase tracking-widest text-sm hover:text-gold transition-colors border-2 border-gray-200 hover:border-gold" style={{ textDecoration: 'none' }}>Order Sample</Link>
            </div>

            {renderColorSwatches(false)}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 w-full lg:min-w-[400px]">
            {renderTitleBlock(true)}

            <p className="text-[1.05rem] text-gray-500 mb-6 italic mt-4 lg:mt-0">{productData.desc || 'Premium flooring collection.'}</p>

            <div className="my-5 p-4 border-l-4 border-gold bg-[#fdfdfd] relative overflow-hidden">
                {isClientMode ? (
                    <>
                        <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">Client Pricing</div>
                        <div className="mt-1">
                            <span className="text-[1.1rem] text-gray-900 font-bold mr-2">Price:</span>
                            {renderPriceBlock()}
                        </div>
                    </>
                ) : user && !user.isAnonymous ? (
                    <>
                        <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-2 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse"></span> Wholesale Live
                        </div>
                        <span className="text-[0.9rem] text-gray-500 line-through mb-1 block">Retail: ${(productData?.retailPrice ? parseFloat(productData.retailPrice) : (basePrice * 2.2)).toFixed(2)} <span className="text-sm">/</span><span className="text-sm">{productData.unit || 'sqft'}</span></span>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-end gap-2">
                                <span className="text-[1.1rem] text-gray-900 font-bold text-gold mb-1">Wholesale Price:</span>
                                {renderWholesalePriceBlock()}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-[1.5rem] text-gray-900 font-bold mb-1 block">Retail: ${(productData?.retailPrice ? parseFloat(productData.retailPrice) : (basePrice * 2.2)).toFixed(2)} <span className="text-sm">/</span><span className="text-sm">{productData.unit || 'sqft'}</span></span>
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <button onClick={() => window.dispatchEvent(new Event('open-login-modal'))} className="block w-full text-left text-[10px] font-bold uppercase tracking-widest text-gold hover:text-black transition-colors underline bg-transparent border-none cursor-pointer outline-none">Log in for wholesale pricing</button>
                        </div>
                    </>
                )}
            </div>

            {/* QUICK SAVE TO BOARD */}
            {!isClientMode && user && !user.isAnonymous && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Quick Save to Client Presentation</h4>
                     {proBoards.length > 0 ? (
                         <div className="flex gap-2">
                             <select value={selectedBoardId} onChange={e => setSelectedBoardId(e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-lg text-sm font-bold bg-white focus:border-gold outline-none cursor-pointer">
                                 {proBoards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                             </select>
                             <button onClick={handleSaveToBoard} disabled={isSavingToBoard} className="bg-black text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors shrink-0 disabled:opacity-50 cursor-pointer">
                                 {boardSaveMessage && !isBuilderOpen ? "Saved ✓" : (isSavingToBoard && !isBuilderOpen ? "Saving..." : "Save Product")}
                             </button>
                         </div>
                     ) : (
                         <div className="text-xs text-gray-500 italic">Go to <Link href="/my-account" className="text-gold font-bold not-italic hover:underline">My Account</Link> to create a Client Board.</div>
                     )}
                </div>
            )}

            {renderColorSwatches(true)}

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

          {/* THE NEW PROPOSAL BUILDER TRIGGER BUTTON */}
          {!isClientMode && user && !user.isAnonymous && !isCarpetCushionOnly && (
              <button 
                  className="fixed bottom-5 right-5 md:bottom-8 md:right-8 bg-black text-white px-6 py-4 rounded-full cursor-pointer font-bold shadow-2xl z-40 transition-all border-2 border-black hover:bg-gold hover:text-black hover:border-gold flex items-center gap-2 text-sm md:text-base hover:scale-105" 
                  onClick={() => setIsBuilderOpen(true)}
              >
                  <span>📋</span> Build Custom Proposal
              </button>
          )}

          {/* SLIDE OUT PROPOSAL BUILDER DRAWER */}
          {isBuilderOpen && (
              <div className="fixed inset-0 z-50 flex justify-end">
                  <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setIsBuilderOpen(false)}></div>
                  
                  <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl relative z-10 animate-in slide-in-from-right flex flex-col">
                      
                      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-20">
                          <div>
                              <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Proposal Builder</h3>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{productData.displayTitle}</p>
                          </div>
                          <button onClick={() => setIsBuilderOpen(false)} className="text-gray-400 hover:text-black text-2xl font-bold bg-transparent border-none cursor-pointer outline-none p-2">✕</button>
                      </div>

                      <div className="p-6 space-y-8 flex-1">

                          {/* PROPOSAL DETAILS */}
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Proposal Details</h4>
                              <div className="space-y-3">
                                  <div>
                                      <input type="text" placeholder="Client Name (e.g. Smith Family) *" value={quoteClientName} onChange={e => setQuoteClientName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                                  </div>
                                  <div>
                                      <input type="text" placeholder="Project / Room (e.g. Kitchen Remodel)" value={quoteProjectName} onChange={e => setQuoteProjectName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white" />
                                  </div>
                              </div>
                          </div>
                          
                          {/* STEP 1: MEASUREMENTS */}
                          <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>1</span> Measurements</h4>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Net Square Footage</label>
                                      <input type="number" value={calcNetSqft} onChange={e => setCalcNetSqft(e.target.value)} placeholder="e.g. 500" className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50" />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Waste Factor</label>
                                      <select value={calcWaste} onChange={e => setCalcWaste(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-gray-50">
                                          <option value="1.00">Exact Net (0%)</option>
                                          <option value="1.05">Standard (5%)</option>
                                          <option value="1.10">Safe (10%)</option>
                                          <option value="1.15">Complex / Diagonal (15%)</option>
                                      </select>
                                  </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center text-xs font-bold text-blue-900">
                                  <span>Coverage Required:</span>
                                  <span>{finalMaterialCoverageSqft.toFixed(1)} sqft ({finalMaterialQty} {finalMaterialUnit})</span>
                              </div>
                          </div>

                          {/* STEP 2: ACCESSORIES */}
                          <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>2</span> Add-Ons & Accessories</h4>
                              
                              {isCarpet && (
                                  <div className="mb-4">
                                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Select Carpet Cushion</label>
                                      <select value={padSelection} onChange={e => setPadSelection(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm bg-white cursor-pointer mb-2">
                                          <option value="none">No Pad Included</option>
                                          {availablePads.map(pad => (
                                              <option key={pad.id} value={pad.id}>{pad.name || pad.displayTitle}</option>
                                          ))}
                                          <option value="custom_legacy">Legacy Pad / Custom</option>
                                      </select>
                                      {padSelection !== 'none' && (
                                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                              <label className="text-[10px] font-bold uppercase text-gray-500">Your Cost per sqft ($)</label>
                                              <input type="number" step="0.01" value={padCost} onChange={e => setPadCost(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg focus:border-gold outline-none text-sm text-right bg-white" />
                                          </div>
                                      )}
                                  </div>
                              )}

                              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                  {selectedAddons.map((addon, index) => (
                                      <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-white p-2 rounded border border-gray-200">
                                          <input type="text" value={addon.name} onChange={e => {
                                              const newAddons = [...selectedAddons];
                                              newAddons[index].name = e.target.value;
                                              setSelectedAddons(newAddons);
                                          }} className="w-full p-1 text-xs outline-none focus:border-gold border border-transparent focus:border-gray-200 rounded" placeholder="Accessory Name" />
                                          <input type="number" value={addon.qty} onChange={e => {
                                              const newAddons = [...selectedAddons];
                                              newAddons[index].qty = parseInt(e.target.value) || 0;
                                              setSelectedAddons(newAddons);
                                          }} className="w-12 p-1 text-xs border border-gray-200 rounded text-center outline-none focus:border-gold" min="1" placeholder="Qty" />
                                          <div className="flex items-center gap-1 text-xs text-gray-400">
                                              $<input type="number" value={addon.cost} onChange={e => {
                                                  const newAddons = [...selectedAddons];
                                                  newAddons[index].cost = parseFloat(e.target.value) || 0;
                                                  setSelectedAddons(newAddons);
                                              }} className="w-14 p-1 text-xs border border-gray-200 rounded text-right outline-none focus:border-gold" step="0.01" />
                                          </div>
                                          <button onClick={() => {
                                              setSelectedAddons(selectedAddons.filter((_, i) => i !== index));
                                          }} className="text-red-400 hover:text-red-600 font-black px-2 outline-none cursor-pointer">✕</button>
                                      </div>
                                  ))}

                                  <select onChange={(e) => {
                                      if (e.target.value) {
                                          if (e.target.value === 'custom') {
                                              setSelectedAddons([...selectedAddons, { name: 'Custom Accessory', cost: 0.00, qty: 1 }]);
                                          } else {
                                              const selected = categoryAddons.find(a => a.name === e.target.value);
                                              if (selected) {
                                                  const resolvedCost = selected.cost !== undefined ? selected.cost : (selected.defaultCost || 0);
                                                  setSelectedAddons([...selectedAddons, { ...selected, cost: resolvedCost, qty: 1 }]);
                                              }
                                          }
                                          e.target.value = '';
                                      }
                                  }} className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none focus:border-gold cursor-pointer bg-white">
                                      <option value="">+ Add Accessory / Trim...</option>
                                      {categoryAddons.map(a => {
                                          const resolvedCost = a.cost !== undefined ? a.cost : (a.defaultCost || 0);
                                          return <option key={a.name} value={a.name}>{a.name} (${parseFloat(resolvedCost).toFixed(2)})</option>
                                      })}
                                      <option value="custom">Create Custom Accessory...</option>
                                  </select>
                              </div>
                          </div>

                          {/* STEP 3: LABOR */}
                          <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2"><span>3</span> Labor & Logistics (Your Cost)</h4>
                              <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                      <label className="text-xs font-bold text-gray-700">Basic Install <span className="text-[10px] text-gray-400 font-normal ml-1">/ sqft</span></label>
                                      <input type="number" placeholder="0.00" value={laborInstallPerSqft} onChange={e => setLaborInstallPerSqft(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <label className="text-xs font-bold text-gray-700">Tear Out & Prep <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                      <input type="number" placeholder="0.00" value={laborPrep} onChange={e => setLaborPrep(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>
                                  <div className="flex items-center justify-between">
                                      <label className="text-xs font-bold text-gray-700">Fuel & Delivery <span className="text-[10px] text-gray-400 font-normal ml-1">Lump Sum</span></label>
                                      <input type="number" placeholder="0.00" value={laborDelivery} onChange={e => setLaborDelivery(e.target.value)} className="w-24 p-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:border-gold bg-gray-50" />
                                  </div>

                                  <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Additional Custom Labor</p>
                                      <div className="flex gap-2">
                                          <input type="text" placeholder="e.g. Stair Labor" value={customLabor1Name} onChange={e => setCustomLabor1Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                          <input type="number" placeholder="$ 0.00" value={customLabor1Cost} onChange={e => setCustomLabor1Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
                                      </div>
                                      <div className="flex gap-2">
                                          <input type="text" placeholder="e.g. Moving Appliances" value={customLabor2Name} onChange={e => setCustomLabor2Name(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-gold bg-white" />
                                          <input type="number" placeholder="$ 0.00" value={customLabor2Cost} onChange={e => setCustomLabor2Cost(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-gold bg-gray-50" />
                                      </div>
                                  </div>
                              </div>
                          </div>

                      </div>

                      {/* STEP 4: FOOTER & SAVE */}
                      <div className="bg-gray-900 text-white p-6 sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                          <div className="flex justify-between items-end mb-4">
                              <div>
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your Base Cost</div>
                                  <div className="text-lg font-mono text-gray-200">${totalWholesaleProjectCost.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] text-gold font-bold uppercase tracking-widest flex items-center gap-2 justify-end">
                                      Margin: {builderMargin}%
                                  </div>
                                  <div className="text-2xl font-black text-white font-mono">${turnkeyRetailPrice.toFixed(2)}</div>
                                  <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Gross Profit: ${(turnkeyRetailPrice - totalWholesaleProjectCost).toFixed(2)}</div>
                              </div>
                          </div>
                          
                          <input type="range" min="0" max="100" step="1" value={builderMargin} onChange={e => setBuilderMargin(Number(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gold mb-6" />

                          <label className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 cursor-pointer">
                              <input type="checkbox" checked={useCustomBranding} onChange={e => setUseCustomBranding(e.target.checked)} className="accent-gold w-4 h-4" />
                              Apply my White-Label Branding
                          </label>

                          <div className="space-y-3">
                              <button onClick={handleSaveStandaloneQuote} disabled={isSavingToBoard || netSqftNum === 0 || !quoteClientName.trim()} className="w-full bg-gold text-black hover:bg-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer outline-none">
                                  {boardSaveMessage ? `✓ ${boardSaveMessage}` : (isSavingToBoard ? "Saving..." : "Save Turnkey Proposal")}
                              </button>
                              {(!quoteClientName.trim() || netSqftNum === 0) && (
                                  <div className="text-[10px] text-red-400 text-center uppercase tracking-widest font-bold">Client Name & SqFt Required</div>
                              )}
                          </div>
                      </div>

                  </div>
              </div>
          )}

          {/* LIGHTBOX */}
          {isLightboxOpen && (
              <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center backdrop-blur-sm transition-opacity" onClick={(e) => { if (e.target === e.currentTarget) setIsLightboxOpen(false); }}>
                  <button className="absolute top-5 right-5 bg-black/60 text-white border-2 border-white rounded-full w-11 h-11 text-2xl flex items-center justify-center cursor-pointer hover:bg-gold hover:border-gold hover:text-black transition-colors z-[10000] outline-none" onClick={() => setIsLightboxOpen(false)}>✕</button>
                  <div className="w-[90vw] max-w-[1200px] h-[85vh] relative rounded-lg overflow-hidden cursor-crosshair touch-none" onMouseMove={handleZoomPan} onTouchMove={handleZoomPan} onMouseLeave={() => setZoomPos({x:50, y:50})} onTouchEnd={() => setZoomPos({x:50, y:50})}>
                      <Image src={getMediaPath(activeView) || TBD_IMG} alt="Zoomed Product" fill sizes="100vw" className="object-contain transition-transform duration-150 ease-out hover:scale-[2.2]" style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }} onError={(e) => { e.currentTarget.srcset = ''; e.currentTarget.src = TBD_IMG; }} />
                  </div>
              </div>
          )}
        </div>
    );
}

export default function ProductViewer({ initialProduct }) {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>}>
            <ProductViewerContent initialProduct={initialProduct} />
        </Suspense>
    );
}