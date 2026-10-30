"use client";

import React, { useState, useEffect } from 'react';

let usePathname = () => '';

try {
    const nextNav = 'next/navigation';
    const nav = require(nextNav);
    usePathname = nav.usePathname;
} catch (e) {
    usePathname = () => typeof window !== 'undefined' ? window.location.pathname : '';
}

export default function Footer() {
  const [clientBrand, setClientBrand] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);
  const [brandBg, setBrandBg] = useState('#ffffff');
  const [brandText, setBrandText] = useState('#000000');
  
  // FIX: Supress default footer rendering instantly if the URL is a magic link
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
      if (typeof window !== 'undefined') {
          const search = window.location.search;
          
          // If the URL has pro tags, keep the footer hidden until the redirect runs!
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

  if (pathname && (pathname.startsWith('/client/') || pathname.startsWith('/proposal/'))) return null;
  
  // FIX: Intercept rendering entirely to prevent the brief branding flash
  if (isProcessingMagicLink) return null;

  return (
    <footer className="py-16 shrink-0 mt-auto transition-colors duration-300" style={clientBrand ? { backgroundColor: brandBg, color: brandText } : { backgroundColor: '#000000', color: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center border-b pb-12 mb-12" style={{ borderColor: clientBrand ? `${brandText}20` : '#1f2937' }}>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                    {clientLogo ? (
                        <div className="flex flex-col items-center md:items-start">
                            <img src={clientLogo} alt={clientBrand} className="h-12 w-auto object-contain mb-3" />
                            <span className="text-sm font-black italic tracking-tight opacity-80" style={{ color: brandText }}>Premium Floor Portal</span>
                        </div>
                    ) : clientBrand ? (
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none" style={{ color: brandText }}>{clientBrand}</span>
                            <span className="text-lg md:text-xl font-black italic tracking-tight mt-1 opacity-80" style={{ color: brandText }}>Premium Floor Portal</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-4xl font-black tracking-tighter">FLOORS <span className="text-gold">55</span></span>
                            <span className="text-red-600 text-2xl font-black italic tracking-tight">for Pros</span>
                        </>
                    )}
                </div>
                <p className="text-sm mt-4 md:mt-0 italic font-light" style={{ color: clientBrand ? brandText : '#9ca3af' }}>
                    {clientBrand ? "Premium Flooring Catalog" : "The Northwest's Choice in Floor Fashions Since 2008"}
                </p>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: clientBrand ? brandText : '#9ca3af' }}>
                © {new Date().getFullYear()} {clientBrand || "Floors 55"}. All Rights Reserved.
            </p>
        </div>
    </footer>
  );
}