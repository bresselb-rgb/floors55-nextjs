"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProductAccessories({ accessories, isPrivate }) {
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

    if (!accessories || accessories.length === 0) return null;

    return (
        <section className="bg-gray-50 border-t border-gray-200 py-12">
            <div className="max-w-[1400px] mx-auto px-4">
                <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Matching Trims & Accessories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {accessories.map((item) => {
                        const rawPrice = parseFloat(item.price) || 0;
                        const retailPrice = item.retailPrice ? parseFloat(item.retailPrice) : (rawPrice * 2.2);
                        
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
                                key={item.id} 
                                href={`/product/${item.id}${isPrivate ? '?private=true' : ''}`} 
                                className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" 
                                style={{ textDecoration: 'none' }}
                            >
                                <div>
                                    <h4 className="font-bold text-gray-900 text-xs mb-1 leading-snug">{item.name || 'Accessory'}</h4>
                                    
                                    {/* Display custom dimensions if they exist */}
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {item.length && <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.length}</span>}
                                        {item.thickness && <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.thickness}</span>}
                                    </div>
                                    
                                    {/* Display the description */}
                                    {item.desc && (
                                        <p className="text-[10px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    )}
                                </div>
                                
                                {displayPrice > 0 && (
                                    <div className="mt-2 border-t border-gray-50 pt-2">
                                        <div className="text-[8px] text-gray-400 uppercase font-black tracking-wider">{priceLabel}</div>
                                        <p className="text-gold font-bold text-sm font-mono">
                                            ${displayPrice.toFixed(2)} <span className="text-[9px] font-bold text-gray-400 font-sans">{item.unit || '/pc'}</span>
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