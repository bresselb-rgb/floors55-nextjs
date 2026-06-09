"use client";

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";

export default function WholesaleRequestPage() {
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [ccb, setCcb] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('');
  
  // New split address states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine the fields into a perfect multi-line string for the admin panel
    const formattedAddress = `${street}\n${city}, ${addrState} ${zip}`;

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wholesale_requests'), {
        name, business, ccb, email, phone, trade,
        address: formattedAddress,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      setIsSuccess(true);
      setName(''); setBusiness(''); setCcb(''); setEmail(''); setPhone(''); setTrade('');
      setStreet(''); setCity(''); setAddrState(''); setZip('');
    } catch (err) {
      alert("Error submitting application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2">Trade Partner Application</h1>
            <p className="text-gray-500 mb-8">
                Apply for an exclusive Floors 55 Pro account to unlock direct wholesale pricing, dedicated account management, and priority order fulfillment.
                <span className="block mt-3 text-sm text-gray-600">
                    Already a Pro Partner? <button type="button" onClick={() => window.dispatchEvent(new Event('open-login-modal'))} className="text-gold font-bold underline bg-transparent border-none cursor-pointer p-0 text-sm hover:text-black transition-colors outline-none">Log in here</button>
                </span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Business Name *</label>
                        <input type="text" required value={business} onChange={e => setBusiness(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">CCB / License Number (Optional)</label>
                        <input type="text" value={ccb} onChange={e => setCcb(e.target.value)} placeholder="e.g. 123456" className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Primary Trade *</label>
                        <select required value={trade} onChange={e => setTrade(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors text-gray-700">
                            <option value="" disabled>Select your industry segment...</option>
                            <option value="General Contractor">General Contractor</option>
                            <option value="Flooring Installer">Flooring Installer</option>
                            <option value="Interior Designer">Interior Designer</option>
                            <option value="Property Management">Property Management</option>
                            <option value="Real Estate">Real Estate / Developer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 mt-4">Business Address</h3>
                    
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

                <button type="submit" disabled={isSubmitting} className="w-full bg-gold hover:bg-black text-black hover:text-white font-black uppercase tracking-widest py-4 rounded-xl transition duration-300 shadow-md disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed mt-4">
                    {isSubmitting ? "Applying..." : "Submit Application"}
                </button>
                
                {isSuccess && (
                  <div className="text-emerald-600 font-bold text-center mt-4 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                      Application successfully submitted! We will review your details and be in touch soon.
                  </div>
                )}
            </form>
        </div>
      </div>
    </main>
  );
}