"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, appId } from "../../lib/firebase";
import Link from 'next/link';

export default function MyAccountPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        business: '',
        phone: '',
        address: ''
    });

    const [activityHistory, setActivityHistory] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser || currentUser.isAnonymous) {
                router.push('/');
                return;
            }
            
            setUser(currentUser);
            
            try {
                // 1. Fetch Profile Data
                const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setFormData({
                        name: data.name || '',
                        business: data.business || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    });
                }

                // 2. Fetch Recent Activity (Quotes & Samples matching their email)
                const quotesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'quote_requests'), where("email", "==", currentUser.email));
                const samplesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'sample_requests'), where("email", "==", currentUser.email));
                
                const [quotesSnap, samplesSnap] = await Promise.all([getDocs(quotesQuery), getDocs(samplesQuery)]);
                
                let history = [];
                quotesSnap.forEach(d => history.push({ type: 'Quote Estimate', id: d.id, ...d.data() }));
                samplesSnap.forEach(d => history.push({ type: 'Sample Order', id: d.id, ...d.data() }));
                
                // Sort by newest first
                history.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                setActivityHistory(history);

            } catch (err) {
                console.error("Error fetching profile or activity:", err);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage('');
        
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), formData);
            setSaveMessage('Profile successfully updated.');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            alert("Error saving profile: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user || !user.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            setResetMessage('A password reset link has been sent to your email.');
            setTimeout(() => setResetMessage(''), 5000);
        } catch (err) {
            alert("Error sending reset email: " + err.message);
        }
    };

    if (isLoading) {
        return (
            <main className="bg-gray-50 flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div>
            </main>
        );
    }

    return (
        <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
            <div className="bg-black text-white py-12 md:py-16 text-center">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Pro Portal</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Manage your wholesale account</p>
            </div>

            <div className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Profile Editor */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                    <h2 className="text-2xl font-bold mb-6">Business Profile</h2>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address (Login)</label>
                            <input type="text" disabled value={user?.email || ''} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded text-gray-500 cursor-not-allowed" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Name</label>
                                <input type="text" value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Address</label>
                            <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded focus:outline-none focus:border-gold transition-colors resize-none"></textarea>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                            <button type="submit" disabled={isSaving} className="bg-black hover:bg-gold text-white hover:text-black font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded transition duration-300 shadow-sm disabled:opacity-50 cursor-pointer">
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                            {saveMessage && <span className="text-emerald-600 font-bold text-xs">{saveMessage}</span>}
                        </div>
                    </form>

                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold mb-2">Security</h3>
                        <p className="text-xs text-gray-500 mb-3">Need to update your password? We will send a secure reset link to your email address.</p>
                        <button type="button" onClick={handlePasswordReset} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase tracking-widest text-[10px] px-6 py-2.5 rounded transition duration-300 cursor-pointer">
                            Send Reset Email
                        </button>
                        {resetMessage && <p className="text-emerald-600 font-bold text-xs mt-2">{resetMessage}</p>}
                    </div>
                </div>

                {/* Right Column: Activity & Tools */}
                <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                    
                    {/* Activity Feed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="text-gold">📋</span> Recent Requests
                        </h3>
                        
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {activityHistory.length > 0 ? (
                                activityHistory.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.type}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                        <div className="font-bold text-gray-900 leading-tight">{item.product || 'General Request'}</div>
                                        {item.color && <div className="text-xs text-gold font-bold mt-0.5">Color: {item.color}</div>}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-xs text-gray-400 italic">No recent quotes or sample requests found.</div>
                            )}
                        </div>
                    </div>

                    {/* Coming Soon: Client Mode */}
                    <div className="bg-gray-900 rounded-2xl shadow-xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-6xl pointer-events-none group-hover:scale-110 transition-transform duration-500">🤝</div>
                        <h3 className="text-white font-bold text-xl mb-2">Client Presentation Mode</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-6">Soon, you will be able to generate a custom, white-labeled link to send directly to your clients. Hide wholesale badges and automatically add your custom margin to all prices site-wide.</p>
                        
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Your Margin</span>
                                <span className="text-xs font-bold text-gray-300">+20%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className="w-[20%] h-full bg-gold"></div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-center border border-gray-700 bg-gray-800/30 text-gray-400 py-3 rounded-lg text-xs font-bold uppercase tracking-widest">
                            🚀 Coming Soon
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}