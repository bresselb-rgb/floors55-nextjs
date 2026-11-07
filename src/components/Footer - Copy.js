"use client";

import React, { useState, useEffect } from 'react';
import { TIER_1_CITIES } from '../lib/serviceAreasData';

let Link;
let usePathname = () => '';

try {
    const nextLink = 'next/link';
    Link = require(nextLink).default || require(nextLink);
    const nextNav = 'next/navigation';
    const nav = require(nextNav);
    usePathname = nav.usePathname;
} catch (e) {
    Link = ({ href, children, className, style }) => <a href={href} className={className} style={style}>{children}</a>;
    usePathname = () => typeof window !== 'undefined' ? window.location.pathname : '';
}

export default function Footer() {
  const [clientBrand, setClientBrand] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);
  const [brandBg, setBrandBg] = useState('#ffffff');
  const [brandText, setBrandText] = useState('#000000');
  
  // Suppress default footer rendering instantly if the URL is a magic link
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(true);

  const pathname = usePathname();

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

  if (pathname && (pathname.startsWith('/client/') || pathname.startsWith('/proposal/'))) return null;
  if (isProcessingMagicLink) return null;

  return (
    <footer className="py-16 shrink-0 mt-auto transition-colors duration-300" style={clientBrand ? { backgroundColor: brandBg, color: brandText } : { backgroundColor: '#000000', color: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center border-b pb-10 mb-10" style={{ borderColor: clientBrand ? `${brandText}20` : '#1f2937' }}>
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

            {/* Sitewide Local SEO Service Areas Bar — Hidden during Client Presentation Mode */}
            {!clientBrand && (
                <div className="border-b border-gray-800 pb-10 mb-10 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#c5a059]">
                            Portland &amp; SW Washington Trade Coverage · On-Site Measures · Vendor Will-Call
                        </span>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <Link href="/locations" className="text-gray-300 hover:text-[#c5a059] transition" style={{ textDecoration: 'none' }}>
                                Showroom Locations
                            </Link>
                            <span className="text-gray-700">|</span>
                            <Link href="/service-areas" className="text-[#c5a059] hover:text-white transition" style={{ textDecoration: 'none' }}>
                                Interactive 3D Metro Map →
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                        {TIER_1_CITIES.map((city) => (
                            <Link
                                key={city.slug}
                                href={`/service-areas/${city.slug}`}
                                className="hover:text-[#c5a059] transition"
                                style={{ textDecoration: 'none' }}
                            >
                                {city.name}, {city.state}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: clientBrand ? brandText : '#9ca3af' }}>
                © {new Date().getFullYear()} {clientBrand || "Floors 55"}. All Rights Reserved.
            </p>
        </div>
    </footer>
  );
}