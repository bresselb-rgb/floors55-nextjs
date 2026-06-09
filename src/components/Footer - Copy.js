"use client";

import React, { useState, useEffect } from 'react';

export default function Footer() {
  const [clientBrand, setClientBrand] = useState(null);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          setClientBrand(sessionStorage.getItem('client_brand'));
      }
  }, []);

  return (
    <footer className="bg-black text-white py-16 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-12 mb-12">
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                    {clientBrand ? (
                        <div className="flex flex-col items-center md:items-start">
                            <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">{clientBrand}</span>
                            <span className="text-red-600 text-lg md:text-xl font-black italic tracking-tight mt-1">Premium Floor Portal</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-4xl font-black tracking-tighter">FLOORS <span className="text-gold">55</span></span>
                            <span className="text-red-600 text-2xl font-black italic tracking-tight">for Pros</span>
                        </>
                    )}
                </div>
                <p className="text-gray-500 text-sm mt-4 md:mt-0 italic font-light">
                    {clientBrand ? "Premium Flooring Catalog" : "The Northwest's Choice in Floor Fashions Since 2008"}
                </p>
            </div>
            <p className="text-gray-600 text-xs uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} {clientBrand || "Floors 55"}. All Rights Reserved.
            </p>
        </div>
    </footer>
  );
}