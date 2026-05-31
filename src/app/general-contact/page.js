"use client";

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";

export default function GeneralContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'general_inquiries'), {
        name, phone, email, subject, message,
        timestamp: serverTimestamp(),
        status: 'new'
      });
      setIsSuccess(true);
      setName(''); setPhone(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err) {
      alert("Error submitting message: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2">Get in Touch</h1>
            <p className="text-gray-500 mb-8">Have a question about our products, your current order, or our showrooms? Send us a message and our team will get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject / Inquiry Type *</label>
                    <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors text-gray-700">
                        <option value="" disabled>Select a topic...</option>
                        <option value="General Question">General Question</option>
                        <option value="Product Availability">Product Availability</option>
                        <option value="Order Status">Order Status</option>
                        <option value="Showroom Appointment">Showroom Appointment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
                    <textarea required rows="5" value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you today?" className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors resize-none"></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-gold text-white hover:text-black font-black uppercase tracking-widest py-4 rounded-xl transition duration-300 shadow-md disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed">
                    {isSubmitting ? "Sending..." : "Send Message"}
                </button>
                
                {isSuccess && (
                  <div className="text-emerald-600 font-bold text-center mt-4 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                      Message sent successfully! We will be in touch soon.
                  </div>
                )}
            </form>
        </div>
      </div>
    </main>
  );
}