// src/app/my-account/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, appId } from "../../lib/firebase";
import ClientBoardsManager from "../../components/ClientBoardsManager";

export default function MyAccountPage() {
    const [user, setUser] = useState(null);
    const [isStaff, setIsStaff] = useState(false);
    const [profile, setProfile] = useState({
        business: '',
        name: '',
        phone: '',
        address: '',
        clientMargin: 20,
        brandBgColor: '#ffffff',
        brandTextColor: '#000000',
        logoUrl: '',
        accountManager: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // TAB STATE
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'proposals', 'boards', 'branding'
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLogoInfoOpen, setIsLogoInfoOpen] = useState(false);
    const [isGlobalInfoOpen, setIsGlobalInfoOpen] = useState(false);
    
    const [linkBranding, setLinkBranding] = useState('custom');

    // Derived state to check if they have custom branding active
    const hasCustomBranding = profile.logoUrl || profile.brandBgColor !== '#ffffff' || profile.brandTextColor !== '#000000';
    const [isWhiteLabelActive, setIsWhiteLabelActive] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
                
                // Check if they are internal Staff (House Account)
                const staffSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff', currentUser.uid));
                if (staffSnap.exists()) {
                    setIsStaff(true);
                    setLinkBranding('f55'); // Default staff to f55 branding instead of custom
                }

                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfile(prev => ({ ...prev, ...data }));
                    
                    // Read their saved toggle preference
                    if (data.isWhiteLabelEnabled !== undefined) {
                        setIsWhiteLabelActive(data.isWhiteLabelEnabled);
                    } else if (data.logoUrl || (data.brandBgColor && data.brandBgColor !== '#ffffff') || (data.brandTextColor && data.brandTextColor !== '#000000')) {
                        setIsWhiteLabelActive(true);
                    } else {
                        setIsWhiteLabelActive(false);
                    }
                } else {
                    await setDoc(docRef, { business: 'Flooring Pro', clientMargin: 20 });
                }
            } else {
                window.location.href = '/';
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const triggerToast = (msg = "Link Copied") => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                business: profile.business,
                name: profile.name,
                phone: profile.phone,
                address: profile.address || '',
                brandBgColor: profile.brandBgColor,
                brandTextColor: profile.brandTextColor
            });
            triggerToast("Profile successfully updated!");
        } catch (error) {
            console.error(error);
            triggerToast("Failed to save profile.");
        }
        setIsSaving(false);
    };

    const handleMarginChangeSave = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                clientMargin: Number(profile.clientMargin)
            });
            triggerToast("Pricing Margin Auto-Saved!");
        } catch (error) {
            console.error("Failed to save margin", error);
            triggerToast("Failed to sync margin.");
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `client_logos/${user.uid}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                logoUrl: url
            });
            setProfile(prev => ({...prev, logoUrl: url}));
            triggerToast("Logo uploaded successfully!");
        } catch(err) {
            triggerToast("Upload failed. Please try again.");
        }
        setIsUploading(false);
    };

    const handleToggleWhiteLabel = async (checked) => {
        setIsWhiteLabelActive(checked);
        if (!checked && linkBranding === 'custom') {
            setLinkBranding('f55'); // Auto-switch link generator back to F55
        }
        
        // Instantly save their preference to the database so it remembers
        if (user) {
            try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                    isWhiteLabelEnabled: checked
                });
                triggerToast(checked ? "White-Label Enabled" : "White-Label Disabled");
            } catch (err) {
                console.error("Failed to save toggle state", err);
            }
        }
    };

    const enableClientMode = () => {
        sessionStorage.setItem('client_margin', profile.clientMargin);
        
        const ABBEY_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fabbey-logo.png?alt=media";

        if (linkBranding === 'abbey') {
            sessionStorage.setItem('client_brand', 'Abbey Carpet & Floor');
            sessionStorage.setItem('client_logo', ABBEY_LOGO_URL);
            sessionStorage.removeItem('client_bg'); 
            sessionStorage.removeItem('client_text'); 
            sessionStorage.removeItem('private_label');
        } else if (isWhiteLabelActive && (linkBranding === 'custom' || linkBranding === 'private')) {
            sessionStorage.setItem('client_brand', profile.business);
            if (profile.logoUrl) sessionStorage.setItem('client_logo', profile.logoUrl);
            else sessionStorage.removeItem('client_logo');
            sessionStorage.setItem('client_bg', profile.brandBgColor || '#ffffff');
            sessionStorage.setItem('client_text', profile.brandTextColor || '#000000');
            
            if (linkBranding === 'private') sessionStorage.setItem('private_label', 'true');
            else sessionStorage.removeItem('private_label');
        } else {
            // Standard Floors 55 brand
            sessionStorage.removeItem('client_brand');
            sessionStorage.removeItem('client_logo');
            sessionStorage.removeItem('client_bg');
            sessionStorage.removeItem('client_text');
            
            if (linkBranding === 'private') sessionStorage.setItem('private_label', 'true');
            else sessionStorage.removeItem('private_label');
        }
        window.location.href = '/category';
    };

    const encodedMargin = btoa((profile.clientMargin !== undefined ? profile.clientMargin : 20).toString());
    
    // Generate link dynamically based on the toggle
    let portalLink = '';
    if (user && typeof window !== 'undefined') {
        portalLink = `${window.location.origin}/category?cm=${encodedMargin}`;
        if (linkBranding === 'abbey') {
            portalLink += `&cb=${btoa('Abbey Carpet & Floor')}`;
        } else if (linkBranding === 'custom' && isWhiteLabelActive) {
            portalLink += `&pro=${user.uid}`;
        } else if (linkBranding === 'private') {
            portalLink += `&pl=1`;
            if (isWhiteLabelActive) portalLink += `&pro=${user.uid}`;
        }
    }

    const copyMagicLink = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(portalLink).then(() => triggerToast("Link Copied")).catch(console.error);
        } else {
            const textDoc = document.createElement("textarea");
            textDoc.value = portalLink;
            textDoc.style.position = "fixed";
            textDoc.style.left = "-999999px";
            textDoc.style.top = "-999999px";
            document.body.appendChild(textDoc);
            textDoc.focus();
            textDoc.select();
            try { document.execCommand('copy'); triggerToast("Link Copied"); } catch (err) { console.error(err); }
            document.body.removeChild(textDoc);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>;

    const am = profile.accountManager || { name: "Pending Assignment", phone: "Call Main Office", email: "support@floors55.com" };
    const markupVal = Number(profile.clientMargin) || 0;
    const marginVal = markupVal > 0 ? Math.round((markupVal / (100 + markupVal)) * 100) : 0;

    return (
        <main className="bg-gray-50 min-h-screen py-12 relative">
            <div className="max-w-5xl mx-auto px-4 space-y-6">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black tracking-tight m-0">Pro Dashboard</h1>
                            {isStaff && <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">House Account Active</span>}
                            <button onClick={() => setIsGlobalInfoOpen(true)} className="bg-black text-white hover:bg-gold hover:text-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm outline-none cursor-pointer flex items-center gap-1.5">
                                <span>📘</span> Quick Start Guide
                            </button>
                        </div>
                        <p className="text-gray-500 m-0">Manage your business details, quotes, and client boards.</p>
                    </div>
                    <button onClick={() => signOut(auth)} className="text-red-500 font-bold uppercase tracking-widest text-[10px] hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md cursor-pointer outline-none transition-colors shrink-0">Sign Out</button>
                </div>

                {/* THE APP NAVIGATION TABS */}
                <div className="flex overflow-x-auto border-b border-gray-200 mb-8 hide-scrollbar gap-2 md:gap-8">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`py-3 px-2 md:px-4 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-all outline-none cursor-pointer ${activeTab === 'overview' ? 'border-gold text-black' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                    >
                        Overview & Pricing
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('boards')} 
                        className={`py-3 px-2 md:px-4 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-all outline-none cursor-pointer ${activeTab === 'boards' ? 'border-gold text-black' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                    >
                        Client Boards
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('proposals')} 
                        className={`py-3 px-2 md:px-4 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-all outline-none cursor-pointer flex items-center gap-2 ${activeTab === 'proposals' ? 'border-gold text-black' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                    >
                        Proposals <span className="inline-block bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider animate-pulse">Coming Soon</span>
                    </button>
                    
                    {/* Hide Branding Tab if User is Staff */}
                    {!isStaff && (
                        <button 
                            onClick={() => setActiveTab('branding')} 
                            className={`py-3 px-2 md:px-4 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-all outline-none cursor-pointer ${activeTab === 'branding' ? 'border-gold text-black' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                        >
                            White-Label Setup
                        </button>
                    )}
                </div>

                {/* TAB 1: OVERVIEW & PRICING */}
                <div className={activeTab === 'overview' ? 'block space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                    
                    {/* INLINE QUICK GUIDE: OVERVIEW */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-inner">
                        <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="text-base">📘</span> Quick Guide: Sharing the Catalog
                        </h4>
                        <ul className="text-blue-800 text-xs space-y-1.5 list-disc pl-5 leading-relaxed font-medium m-0">
                            <li><strong>Global Markup:</strong> Adjust the slider to set your universal profit margin. This securely hides wholesale pricing and ensures your profit is baked into the retail numbers clients see.</li>
                            <li><strong>Master Link:</strong> Share this custom link with clients so they can browse the entire catalog with your retail pricing applied.</li>
                            <li><strong>Client Mode:</strong> Click "Preview" to browse the catalog safely on your own device if a customer is sitting right next to you.</li>
                        </ul>
                    </div>

                    {/* Account Manager Banner (Hidden for Staff) */}
                    {!isStaff && (
                        <div className="bg-gray-900 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">🤝</div>
                            <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                                <div className="w-16 h-16 bg-gold text-black rounded-full flex items-center justify-center font-black text-2xl uppercase shadow-lg shrink-0">
                                    {am.name !== "Pending Assignment" ? am.name.charAt(0) : "F55"}
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">Your Dedicated Account Manager</h3>
                                    <p className="text-2xl font-bold">{am.name}</p>
                                </div>
                            </div>
                            <div className="relative z-10 flex flex-col md:items-end w-full md:w-auto gap-2">
                                <a href={`tel:${am.phone}`} className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors flex items-center gap-3 w-full md:w-auto justify-center md:justify-start" style={{ textDecoration: 'none', color: 'white' }}>
                                    <span>📞</span> {am.phone}
                                </a>
                                <a href={`mailto:${am.email}`} className="text-gray-400 hover:text-white text-xs font-bold transition-colors text-center md:text-right w-full" style={{ textDecoration: 'none' }}>
                                    {am.email}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Catalog Client Pricing */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gold"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">
                                    {isStaff ? "Account Manager Pricing Tool" : "Catalog Client Pricing"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 max-w-md">Set the default markup percentage applied to wholesale prices when your clients browse the general catalog.</p>
                            </div>
                            <div className="text-left md:text-right shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-200 min-w-[200px]">
                                <div className="text-3xl font-black text-gold leading-none">{markupVal}% <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Markup</span></div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 border-t border-gray-200 pt-2">Yields <span className="text-black font-black text-sm">{marginVal}%</span> Gross Margin</div>
                            </div>
                        </div>
                        
                        <input 
                            type="type" 
                            type="range" 
                            min="0" max="100" step="5" 
                            value={profile.clientMargin} 
                            onChange={e => setProfile({...profile, clientMargin: e.target.value})} 
                            onMouseUp={handleMarginChangeSave}
                            onTouchEnd={handleMarginChangeSave}
                            onKeyUp={handleMarginChangeSave}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black mb-8" 
                        />
                        
                        <div className="flex gap-4 mb-8">
                            <button onClick={enableClientMode} className="w-full bg-gray-100 text-black px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200 cursor-pointer outline-none">
                                Preview General Catalog Portal
                            </button>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Your Master Catalog Link</h3>
                            <p className="text-xs text-gray-500 mb-4">Share this link to let clients browse the entire catalog with your pricing applied.</p>
                            
                            {/* BRANDING INJECTION OPTIONS */}
                            {(isWhiteLabelActive || isStaff) && (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {isWhiteLabelActive && !isStaff && (
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                            <input type="radio" name="linkBrand" checked={linkBranding === 'custom'} onChange={() => setLinkBranding('custom')} className="accent-black w-4 h-4" />
                                            My White-Label Brand
                                        </label>
                                    )}
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                        <input type="radio" name="linkBrand" checked={linkBranding === 'f55'} onChange={() => setLinkBranding('f55')} className="accent-black w-4 h-4" />
                                        Floors 55 Brand
                                    </label>
                                    {isStaff && (
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm">
                                            <input type="radio" name="linkBrand" checked={linkBranding === 'abbey'} onChange={() => setLinkBranding('abbey')} className="accent-blue-800 w-4 h-4 cursor-pointer" />
                                            <span className="text-blue-900">Abbey Carpet & Floor</span>
                                        </label>
                                    )}
                                    {isStaff && (
                                        <label className="flex items-center gap-2 text-xs font-bold text-purple-700 cursor-pointer border border-purple-200 bg-purple-50 px-3 py-1.5 rounded-lg shadow-sm">
                                            <input type="radio" name="linkBrand" checked={linkBranding === 'private'} onChange={() => setLinkBranding('private')} className="accent-purple-800 w-4 h-4 cursor-pointer" />
                                            <span className="text-purple-900">Private Label (Hide Brands)</span>
                                        </label>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-3">
                                <input type="text" readOnly value={portalLink} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-600 outline-none" />
                                <button onClick={copyMagicLink} className="bg-black hover:bg-gold text-white hover:text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shrink-0 whitespace-nowrap cursor-pointer outline-none">
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Business Profile (Hidden for Staff) */}
                    {!isStaff && (
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
                            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Business Profile</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Business Name</label>
                                    <input type="text" value={profile.business} onChange={e => setProfile({...profile, business: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Name</label>
                                    <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                    <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address (Login)</label>
                                    <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Business Address</label>
                                    <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="e.g. 123 Main St, Portland OR 97204" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={isSaving} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 cursor-pointer outline-none">
                                {isSaving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    )}

                </div>

                {/* TAB 2: PROPOSALS (Coming Soon Mode) */}
                <div className={activeTab === 'proposals' ? 'block space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-gray-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                            📋
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Turnkey Proposals</h2>
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-black text-gold mb-6 animate-pulse">Coming Soon to Floors 55 Pro</p>
                        
                        <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed mb-8">
                            We are currently polishing our turnkey B2B bidding engine! Soon, you will be able to build itemized, client-facing flooring proposals directly from your portal—complete with dynamic trim selection, labor, carpet cushions, and custom profit margin sliders.
                        </p>
                        
                        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t border-gray-100 pt-8">
                            <div className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                                <span className="text-gold font-black text-base leading-none">✓</span>
                                <span><strong>Dynamic Markups:</strong> Instantly re-calculate materials, labor, and accessories with custom pricing sliders.</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                                <span className="text-gold font-gold text-base leading-none">✓</span>
                                <span><strong>1-Click PDF Generation:</strong> Print or email professional contracts directly to clients with your branding.</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                                <span className="text-gold font-gold text-base leading-none">✓</span>
                                <span><strong>Direct PO Submission:</strong> Convert approved client proposals into formal warehouse orders with one tap.</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-600 leading-normal">
                                <span className="text-gold font-gold text-base leading-none">✓</span>
                                <span><strong>White-Label Presenting:</strong> Present bids branded with your company's identity to protect your margins.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TAB 3: CLIENT BOARDS */}
                <div className={activeTab === 'boards' ? 'block animate-in fade-in duration-300' : 'hidden'}>
                    
                    {/* INLINE QUICK GUIDE: BOARDS */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 shadow-inner">
                        <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="text-base">📘</span> Quick Guide: Client Boards
                        </h4>
                        <ul className="text-blue-800 text-xs space-y-1.5 list-disc pl-5 leading-relaxed font-medium m-0">
                            <li><strong>What it is:</strong> A digital "showroom" curated specifically for one client (e.g., "The Smith Kitchen"). It helps narrow down options without overwhelming them.</li>
                            <li><strong>Step 1:</strong> Create a new board below. The system locks in your current margin & branding for this specific board.</li>
                            <li><strong>Step 2:</strong> Browse the catalog and use the "Quick Save" dropdown on any product page to add it to their board.</li>
                        </ul>
                    </div>

                    <ClientBoardsManager proId={user?.uid} />
                </div>

                {/* TAB 4: BRANDING & SETTINGS (Hidden for Staff) */}
                {!isStaff && (
                    <div className={activeTab === 'branding' ? 'block space-y-6 animate-in fade-in duration-300' : 'hidden'}>
                        
                        {/* INLINE QUICK GUIDE: BRANDING */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-inner">
                            <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="text-base">📘</span> Quick Guide: White-Label Setup
                            </h4>
                            <ul className="text-blue-800 text-xs space-y-1.5 list-disc pl-5 leading-relaxed font-medium m-0">
                                <li><strong>Make it Yours:</strong> Upload your company logo and brand colors to replace the Floors 55 brand on all shared links and proposals.</li>
                                <li><strong>Temporary Disable:</strong> You can toggle the master switch off at any time to temporarily use the established Floors 55 brand for trust, without losing your saved logo or hex colors!</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 border-b border-gray-100 pb-6">
                                <div>
                                    <h2 className="text-xl font-black mb-1 uppercase tracking-tight">White-Label Branding</h2>
                                    <p className="text-sm text-gray-500 max-w-lg">Customize the portal to look exactly like your own website when sharing presentation links and catalogs with your clients.</p>
                                </div>
                                <div className="shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-auto flex items-center justify-between gap-4">
                                    <span className="text-sm font-bold text-gray-900">Enable White-Label</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" checked={isWhiteLabelActive} onChange={(e) => handleToggleWhiteLabel(e.target.checked)} className="sr-only peer" />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                                    </label>
                                </div>
                            </div>
                            
                            {isWhiteLabelActive ? (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Company Logo</label>
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsLogoInfoOpen(true)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gold transition-colors flex items-center gap-1 bg-gray-50 hover:bg-gold/10 px-2 py-1 rounded-full border border-gray-200 outline-none cursor-pointer"
                                                >
                                                    <span>❓</span> Tips
                                                </button>
                                            </div>
                                            {profile.logoUrl ? (
                                                <div className="mt-2 bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-center min-h-[100px] relative group">
                                                    <img src={profile.logoUrl} alt="Your Logo" className="h-16 object-contain" />
                                                    <button onClick={() => { setProfile({...profile, logoUrl: ""}) }} className="absolute top-2 right-2 bg-white text-red-500 hover:text-red-700 border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity outline-none cursor-pointer text-xs">✕</button>
                                                </div>
                                            ) : (
                                                <div className="mt-2 relative">
                                                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" disabled={isUploading}/>
                                                    {isUploading && <p className="text-xs text-gold font-bold mt-2 animate-pulse">Uploading...</p>}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Header & Footer Background</label>
                                                <div className="flex items-center gap-3">
                                                    <input type="color" value={profile.brandBgColor} onChange={e => setProfile({...profile, brandBgColor: e.target.value})} className="h-12 w-24 cursor-pointer rounded-lg border border-gray-200" />
                                                    <span className="text-sm font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{profile.brandBgColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Header & Footer Text</label>
                                                <div className="flex items-center gap-3">
                                                    <input type="color" value={profile.brandTextColor} onChange={e => setProfile({...profile, brandTextColor: e.target.value})} className="h-12 w-24 cursor-pointer rounded-lg border border-gray-200" />
                                                    <span className="text-sm font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{profile.brandTextColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleSave} disabled={isSaving} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 cursor-pointer outline-none">
                                        {isSaving ? "Saving..." : "Save Brand Settings"}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-4xl mb-3 opacity-20">🎨</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Branding is currently disabled.</h3>
                                    <p className="text-sm text-gray-500">Your clients will see the standard Floors 55 design when they view your shared links.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Logo Info Modal */}
            {isLogoInfoOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setIsLogoInfoOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors font-bold outline-none cursor-pointer"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-black mb-2 text-gray-900">Logo Upload Tips</h3>
                        <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">
                            Make your portal look flawless with these quick logo guidelines.
                        </p>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <strong className="text-gray-900">Ideal Size & Shape:</strong><br />
                                A horizontal rectangle works best in headers. We recommend an image around <strong>400px wide by 100px to 150px tall</strong>.
                            </div>
                            <div>
                                <strong className="text-gray-900">Transparent Backgrounds:</strong><br />
                                For the cleanest look against your brand colors, use a <strong>PNG file with a transparent background</strong> (no white box behind it).
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                                <strong className="text-gray-900 text-xs uppercase tracking-widest">Free Design Tools</strong>
                                <ul className="mt-2 space-y-2 text-xs">
                                    <li>Need to remove a white background? Try <a href="https://www.erase.bg/" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Erase.bg</a> or <a href="https://www.pixelcut.ai/background-remover" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Pixelcut.ai</a> (Both free).</li>
                                    <li>Need to create a logo from scratch? Check out <a href="https://www.canva.com/create/logos/" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Canva's Free Logo Maker</a>.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsLogoInfoOpen(false)}
                                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors cursor-pointer outline-none"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Quick Start Guide Modal */}
            {isGlobalInfoOpen && (
                <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <button
                            onClick={() => setIsGlobalInfoOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors font-bold outline-none cursor-pointer"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-black mb-2 text-gray-900">Portal Quick Start Guide</h3>
                        <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">
                            Everything you need to know to manage your margins and close more bids.
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">White-Label Branding (Optional)</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Navigate to the "White-Label Setup" tab to upload your company logo and pick your brand colors. <br/>
                                        <strong className="text-black bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">Note: This is entirely optional!</strong> If you leave your branding disabled, your client links will automatically default to a beautifully clean, highly professional Floors 55 design.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">The Master Catalog Link</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Set your default markup using the slider in the "Overview" tab. Then, copy your Master Catalog Link. When your clients browse using this link, they will see the entire store with your retail pricing baked in.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Turnkey Proposals</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Need to send an exact, itemized quote? Go to any product in the catalog and click "Build Custom Proposal". You can add pad, transitions, delivery, and your labor. The system will generate a secure link or a PDF for your client to review.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black shrink-0">4</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Client Presentation Boards</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        Don't want to overwhelm a client with the entire catalog? Create a specific Client Board (e.g., "The Smith Kitchen") and drop 3-4 curated products into it for them to choose from.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsGlobalInfoOpen(false)}
                                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors cursor-pointer outline-none"
                            >
                                Let's Go!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="font-black text-gold">✓</span>
                <p className="font-bold text-xs uppercase tracking-widest m-0">{toastMessage || "Link Copied"}</p>
            </div>
        </main>
    );
}