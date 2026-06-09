"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";

export default function OrderSamplePage() {
  const [product, setProduct] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // New split address states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');
  
  const [clientBrand, setClientBrand] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('product')) setProduct(params.get('product'));
      if (params.has('color')) setColor(params.get('color'));
      
      setClientBrand(sessionStorage.getItem('client_brand'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine the fields into a perfect multi-line string for the admin panel
    const formattedAddress = `${street}\n${city}, ${addrState} ${zip}`;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sample_requests'), {
        name, phone, email, product, color,
        address: formattedAddress,
        proPartner: clientBrand || null,
        timestamp: serverTimestamp(),
        status: 'new'
      });
      setIsSuccess(true);
      setName(''); setPhone(''); setEmail(''); 
      setStreet(''); setCity(''); setAddrState(''); setZip('');
    } catch (err) {
      alert("Error submitting sample request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2">Order a Physical Sample</h1>
            <p className="text-gray-500 mb-8">Experience the quality in person. We'll ship it right to your door.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Material Required</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Product Style *</label>
                            <input type="text" required value={product} onChange={e => setProduct(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold text-sm" placeholder="e.g. Castlewood Oak" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Color Variant *</label>
                            <input type="text" required value={color} onChange={e => setColor(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold text-sm" placeholder="e.g. Renaissance" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Shipping Destination</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Street Address *</label>
                            <input type="text" required value={street} onChange={e => setStreet(e.target.value)} placeholder="1234 Main St" className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">City *</label>
                                <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">State *</label>
                                <input type="text" required value={addrState} onChange={e => setAddrState(e.target.value)} placeholder="OR" className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Zip Code *</label>
                                <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-gold text-white hover:text-black font-black uppercase tracking-widest py-4 rounded-xl transition duration-300 shadow-md disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed mt-4">
                    {isSubmitting ? "Processing..." : "Request Sample Shipment"}
                </button>
                
                {isSuccess && (
                  <div className="text-emerald-600 font-bold text-center mt-4 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                      Sample request placed! We will process it shortly.
                  </div>
                )}
            </form>
        </div>
      </div>
    </main>
  );
}