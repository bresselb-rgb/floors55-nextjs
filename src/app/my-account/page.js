"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, appId } from "../../lib/firebase";
import ClientBoardsManager from "../../components/ClientBoardsManager";

export default function MyAccountPage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        business: '',
        name: '',
        phone: '',
        clientMargin: 20,
        brandBgColor: '#ffffff',
        brandTextColor: '#000000',
        logoUrl: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ ...profile, ...docSnap.data() });
                } else {
                    // Create basic profile if it doesn't exist
                    await setDoc(docRef, { business: 'Flooring Pro', clientMargin: 20 });
                }
            } else {
                window.location.href = '/';
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                business: profile.business,
                name: profile.name,
                phone: profile.phone,
                clientMargin: Number(profile.clientMargin),
                brandBgColor: profile.brandBgColor,
                brandTextColor: profile.brandTextColor
            });
            alert("Profile successfully updated!");
        } catch (error) {
            console.error(error);
            alert("Failed to save profile.");
        }
        setIsSaving(false);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `client_logos/${user.uid}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                logoUrl: url
            });
            setProfile(prev => ({...prev, logoUrl: url}));
        } catch(err) {
            alert("Upload failed. Please try again.");
        }
        setIsUploading(false);
    };

    const handlePurgeLogo = async () => {
        if (!window.confirm("Are you sure you want to remove your custom logo?")) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                logoUrl: ""
            });
            setProfile(prev => ({...prev, logoUrl: ""}));
            sessionStorage.removeItem('client_logo');
        } catch(err) {
            alert("Failed to remove logo");
        }
    };

    const enableClientMode = () => {
        sessionStorage.setItem('client_margin', profile.clientMargin);
        sessionStorage.setItem('client_brand', profile.business);
        if (profile.logoUrl) sessionStorage.setItem('client_logo', profile.logoUrl);
        else sessionStorage.removeItem('client_logo');
        sessionStorage.setItem('client_bg', profile.brandBgColor || '#ffffff');
        sessionStorage.setItem('client_text', profile.brandTextColor || '#000000');
        window.location.href = '/category';
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>;

    return (
        <main className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Pro Dashboard</h1>
                        <p className="text-gray-500">Manage your business details, pricing, and client boards.</p>
                    </div>
                    <button onClick={() => signOut(auth)} className="text-red-500 font-bold uppercase tracking-widest text-xs hover:text-red-700">Sign Out</button>
                </div>

                {/* Profile Settings */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>
                    <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Business Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Business Name</label>
                            <input type="text" value={profile.business} onChange={e => setProfile({...profile, business: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Name</label>
                            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50">
                        {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                </div>

                {/* White-Label Branding */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                    <h2 className="text-xl font-black mb-1 uppercase tracking-tight">White-Label Branding</h2>
                    <p className="text-sm text-gray-500 mb-6">Customize the portal to look like your own website when sharing links with clients.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Company Logo</label>
                            {profile.logoUrl ? (
                                <div className="mt-2 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center">
                                    <img src={profile.logoUrl} alt="Your Logo" className="h-16 object-contain mb-4" />
                                    <button onClick={handlePurgeLogo} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest outline-none transition-colors">
                                        ✕ Remove Logo
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 relative">
                                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" disabled={isUploading}/>
                                    {isUploading && <p className="text-xs text-gold font-bold mt-2 animate-pulse">Uploading...</p>}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Header & Footer Background</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={profile.brandBgColor} onChange={e => setProfile({...profile, brandBgColor: e.target.value})} className="h-10 w-20 cursor-pointer rounded border border-gray-200" />
                                    <span className="text-sm font-mono text-gray-400">{profile.brandBgColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Header & Footer Text</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={profile.brandTextColor} onChange={e => setProfile({...profile, brandTextColor: e.target.value})} className="h-10 w-20 cursor-pointer rounded border border-gray-200" />
                                    <span className="text-sm font-mono text-gray-400">{profile.brandTextColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50">
                        {isSaving ? "Saving..." : "Save Brand Settings"}
                    </button>
                </div>

                {/* Margin Slider */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Retail Pricing Margin</h2>
                            <p className="text-sm text-gray-500">Set the markup percentage applied to wholesale prices when presenting to your clients.</p>
                        </div>
                        <div className="text-4xl font-black text-gold">{profile.clientMargin}%</div>
                    </div>
                    
                    <input type="range" min="0" max="100" step="5" value={profile.clientMargin} onChange={e => setProfile({...profile, clientMargin: e.target.value})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black mb-8" />
                    
                    <div className="flex gap-4">
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-black text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors">
                            Save Margin
                        </button>
                        <button onClick={enableClientMode} className="flex-1 bg-gray-100 text-black px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200">
                            Preview Portal
                        </button>
                    </div>
                </div>

                {/* Client Boards */}
                <ClientBoardsManager proId={user.uid} />

            </div>
        </main>
    );
}