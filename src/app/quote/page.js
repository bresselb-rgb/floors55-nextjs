"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";

export default function QuotePage() {
  const [product, setProduct] = useState('');
  const [color, setColor] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sqft, setSqft] = useState('');
  const [installationNeeded, setInstallationNeeded] = useState(false);
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('product')) setProduct(params.get('product'));
      if (params.has('color')) setColor(params.get('color'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'quote_requests'), {
        name, phone, email, product, color, sqft, installationNeeded, message,
        timestamp: serverTimestamp(),
        status: 'new'
      });
      setIsSuccess(true);
      setName(''); setPhone(''); setEmail(''); setSqft(''); setInstallationNeeded(false); setMessage('');
    } catch (err) {
      alert("Error submitting request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2">Request Estimate</h1>
            <p className="text-gray-500 mb-8">Secure your pricing with the project details below. Our team will verify stock and prepare a competitive, customized quote for your materials.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Product Interest </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Product Style</label>
                            <input type="text" value={product} onChange={e => setProduct(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold text-sm" placeholder="e.g. Wonderland I" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Color Variant</label>
                            <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold text-sm" placeholder="e.g. Slate" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Sq.Ft Needed</label>
                        <input type="number" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="e.g. 500" className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={installationNeeded} onChange={e => setInstallationNeeded(e.target.checked)} className="w-5 h-5 accent-gold cursor-pointer" />
                            <span className="text-sm font-bold text-gray-700">Installation Needed</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Additional Project Details</label>
                    <textarea rows="4" value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about timelines, underlayment needs, or stairs..." className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors resize-none"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-gold text-white hover:text-black font-black uppercase tracking-widest py-4 rounded-xl transition duration-300 shadow-md disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed">
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
                
                {isSuccess && (
                  <div className="text-emerald-600 font-bold text-center mt-4 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                      Quote request received! We will contact you shortly.
                  </div>
                )}
            </form>
        </div>
      </div>
    </main>
  );
}