"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

// Safe wrapper for Next.js 15 routing during static builds
let usePathname = () => '';
try {
    const nextNav = 'next/navigation';
    const nav = require(nextNav);
    usePathname = nav.usePathname;
} catch (e) {
    usePathname = () => typeof window !== 'undefined' ? window.location.pathname : '';
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  const [clientBrand, setClientBrand] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);
  const [brandBg, setBrandBg] = useState('#ffffff');
  const [brandText, setBrandText] = useState('#000000');
  
  // Intercept rendering instantly if URL has magic link params
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const search = window.location.search;
          
          if (search.includes('pro=') || search.includes('cb=')) {
              setIsProcessingMagicLink(true);
              return;
          }

          setIsProcessingMagicLink(false);
          setClientBrand(sessionStorage.getItem('client_brand'));
          const logo = sessionStorage.getItem('client_logo');
          if (logo && logo !== "undefined" && logo !== "null") setClientLogo(logo);
          else setClientLogo(null);
          setBrandBg(sessionStorage.getItem('client_bg') || '#ffffff');
          setBrandText(sessionStorage.getItem('client_text') || '#000000');
      }
  }, [pathname]);

  const handleLogout = async () => {
    if (!auth) return;
    try { await signOut(auth); window.location.href = '/'; } catch (err) {}
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  // COMPLETELY HIDE THIS HEADER ON CLIENT PRESENTATION PAGES AND PROPOSAL PAGES
  if (pathname && (pathname.startsWith('/client/') || pathname.startsWith('/proposal/'))) return null;
  
  // PREVENT FLASH OF WRONG BRANDING WHILE MAGIC LINK LOADS
  if (isProcessingMagicLink) return null; 

  const isProLoggedIn = user && !user.isAnonymous;

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 shadow-sm border-b" style={clientBrand ? { backgroundColor: brandBg, borderColor: `${brandText}20` } : { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
                
                {/* LOGO AREA */}
                <div className="flex-shrink-0 flex items-center">
                    <Link href="/" onClick={closeMenu} className="flex flex-col justify-center items-start" style={{ textDecoration: 'none' }}>
                        {clientLogo ? (
                            <img src={clientLogo} alt={clientBrand} className="h-12 w-auto object-contain" />
                        ) : clientBrand ? (
                            <div className="flex flex-col items-start">
                                <span className="text-2xl font-black uppercase tracking-tighter leading-none" style={{ color: brandText }}>{clientBrand}</span>
                                <span className="text-sm font-black italic tracking-tight opacity-80" style={{ color: brandText }}>Premium Floors</span>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black tracking-tighter text-gray-900">FLOORS <span className="text-gold">55</span></span>
                                <span className="text-red-600 text-lg font-black italic tracking-tight">for Pros</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex space-x-8 items-center">
                    {clientBrand ? (
                        <>
                            <Link href="/category" className="font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: brandText, textDecoration: 'none' }}>Catalog</Link>
                            <Link href="/choosing-your-floor" className="font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: brandText, textDecoration: 'none' }}>Design Guide</Link>
                            <Link href="/order-sample" className="font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: brandText, textDecoration: 'none' }}>Order Sample</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/category" className="text-gray-600 hover:text-gold font-bold text-xs uppercase tracking-widest transition-colors" style={{ textDecoration: 'none' }}>Collections</Link>
                            
                            {/* Resources Dropdown */}
                            <div className="relative group">
                                <button className="text-gray-600 group-hover:text-gold font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer outline-none pb-8 mb:-mb-8">
                                    Resources <span className="text-[10px]">▼</span>
                                </button>
                                <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pt-2 pb-2">
                                    <Link href="/choosing-your-floor" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Design Guide</Link>
                                    <Link href="/hard-surface-transitions" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Transition Moldings Guide</Link>
                                    <Link href="/floor-care" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Care & Maintenance</Link>
                                    <Link href="/installation-prep" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Installation Prep</Link>
                                    <Link href="/faq" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>FAQ</Link>
                                    <Link href="/flooring-glossary" className="block px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>Glossary of Terms</Link>
                                </div>
                            </div>
                            
                            <Link href="/become-a-pro" className="text-gray-600 hover:text-gold font-bold text-xs uppercase tracking-widest transition-colors" style={{ textDecoration: 'none' }}>Pro Program</Link>
                            
                            {isProLoggedIn ? (
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                    <Link href="/my-account" className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-colors" style={{ textDecoration: 'none' }}>My Account</Link>
                                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-colors bg-transparent border-none cursor-pointer outline-none">Log Out</button>
                                </div>
                            ) : (
                                <button onClick={() => window.dispatchEvent(new Event('open-login-modal'))} className="ml-4 bg-black text-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-colors bg-transparent border-none cursor-pointer outline-none">Pro Login</button>
                            )}
                        </>
                    )}
                </nav>

                {/* MOBILE MENU BUTTON */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 focus:outline-none bg-transparent border-none cursor-pointer" style={{ color: clientBrand ? brandText : '#111827' }}>
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t shadow-2xl absolute w-full left-0" style={{ backgroundColor: clientBrand ? brandBg : '#ffffff', borderColor: clientBrand ? `${brandText}20` : '#e5e7eb' }}>
                <div className="px-4 pt-4 pb-6 space-y-2">
                    {clientBrand ? (
                        <>
                            <Link href="/category" onClick={closeMenu} className="block px-4 py-3 rounded-xl font-bold text-base uppercase tracking-widest hover:bg-black/5" style={{ color: brandText, textDecoration: 'none' }}>Catalog</Link>
                            <Link href="/choosing-your-floor" onClick={closeMenu} className="block px-4 py-3 rounded-xl font-bold text-base uppercase tracking-widest hover:bg-black/5" style={{ color: brandText, textDecoration: 'none' }}>Design Guide</Link>
                            <Link href="/order-sample" onClick={closeMenu} className="block px-4 py-3 rounded-xl font-bold text-base uppercase tracking-widest hover:bg-black/5" style={{ color: brandText, textDecoration: 'none' }}>Order Sample</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/category" onClick={closeMenu} className="block px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-900 hover:bg-gray-50 hover:text-gold" style={{ textDecoration: 'none' }}>Collections</Link>
                            
                            <div className="px-4 py-2">
                                <div className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-2">Resources</div>
                                <div className="space-y-1 pl-2 border-l-2 border-gray-100">
                                    <Link href="/choosing-your-floor" onClick={closeMenu} className="block py-2 text-sm font-bold text-gray-600 hover:text-gold" style={{ textDecoration: 'none' }}>Design Guide</Link>
                                    <Link href="/hard-surface-transitions" onClick={closeMenu} className="block py-2 text-sm font-bold text-gray-600 hover:text-gold" style={{ textDecoration: 'none' }}>Transition Moldings</Link>
                                    <Link href="/floor-care" onClick={closeMenu} className="block py-2 text-sm font-bold text-gray-600 hover:text-gold" style={{ textDecoration: 'none' }}>Care & Maintenance</Link>
                                    <Link href="/installation-prep" onClick={closeMenu} className="block py-2 text-sm font-bold text-gray-600 hover:text-gold" style={{ textDecoration: 'none' }}>Installation Prep</Link>
                                </div>
                            </div>
                            
                            <Link href="/become-a-pro" onClick={closeMenu} className="block px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-900 hover:bg-gray-50 hover:text-gold" style={{ textDecoration: 'none' }}>Pro Program</Link>
                            
                            <div className="border-t border-gray-100 mt-4 pt-4 px-4">
                                {isProLoggedIn ? (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/my-account" onClick={closeMenu} className="w-full text-center bg-black text-white px-5 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-colors" style={{ textDecoration: 'none' }}>My Account</Link>
                                        <button onClick={() => { handleLogout(); closeMenu(); }} className="w-full text-center border border-gray-200 text-gray-600 px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors outline-none cursor-pointer">Log Out</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { window.dispatchEvent(new Event('open-login-modal')); closeMenu(); }} className="w-full bg-black text-white px-5 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors outline-none cursor-pointer">Pro Login</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </header>
  );
}