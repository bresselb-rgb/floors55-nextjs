"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// We added the `title` prop here
export default function SimilarProducts({ products, isPrivate, title }) {
    const [user, setUser] = useState(null);
    const [clientMargin, setClientMargin] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        
        if (typeof window !== 'undefined') {
            const margin = sessionStorage.getItem('client_margin');
            if (margin !== null) setClientMargin(parseInt(margin, 10));
        }
        
        return () => unsub();
    }, []);

    const isWholesale = user && !user.isAnonymous;
    const isClientMode = clientMargin !== null;

    const getGridImgUrl = (data) => {
        // Automatically return the moldings graphic if it's a trim without a specific image
        if (data.isAccessory && !data.imgPrefix) {
            return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent('images/moldings.png')}?alt=media`;
        }

        const safeName = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const safeSku = (data.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let folderName = 'images'; 
        if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
        else if (safeName) folderName = safeName;
        folderName = folderName.replace(/-+$/, '');

        const displaySku = data.colors?.[0]?.sku || '01';
        const rawPath = `images/${folderName}/${data.imgPrefix || ''}${displaySku}_main.jpg`.toLowerCase();
        return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
    };
    if (!products || products.length === 0) return null;

    return (
        <section className="bg-white border-t border-gray-100 py-16">
            <div className="max-w-[1400px] mx-auto px-4">
                {/* Dynamically display the title passed from page.js */}
                <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">{title || 'Similar Options'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const simTitle = (isPrivate || product.usePrivateName) 
                            ? (product.privateName || 'Custom Collection') 
                            : (product.name || 'Unnamed Product');
                        
                        const rawPrice = parseFloat(product.price) || 0;
                        const retailPrice = product.retailPrice ? parseFloat(product.retailPrice) : (rawPrice * 2.2);
                        
                        let displayPrice = 0;
                        let priceLabel = "";
                        
                        if (isPrivate) {
                            displayPrice = 0;
                        } else if (isClientMode) {
                            displayPrice = rawPrice * (1 + (clientMargin / 100));
                            priceLabel = "Price";
                        } else if (isWholesale) {
                            displayPrice = rawPrice;
                            priceLabel = "Wholesale";
                        } else {
                            displayPrice = retailPrice;
                            priceLabel = "Est. Retail";
                        }

                        return (
                            <Link 
                                key={product.id} 
                                href={`/product/${product.id}${isPrivate ? '?private=true' : ''}`} 
                                className="group block" 
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="bg-gray-50 rounded-xl aspect-square mb-4 overflow-hidden border border-gray-100">
                                    <img 
                                        src={getGridImgUrl(product)} 
                                        alt={simTitle} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{simTitle}</h4>
                                
                                {displayPrice > 0 && (
                                    <div>
                                        <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">{priceLabel}</div>
                                        <p className="text-gold font-bold text-sm font-mono">
                                            ${displayPrice.toFixed(2)} <span className="text-[10px] font-bold text-gray-400 font-sans">/{product.unit || 'sqft'}</span>
                                        </p>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}