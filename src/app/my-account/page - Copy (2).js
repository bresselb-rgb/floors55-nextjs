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
        address: '',
        clientMargin: 20,
        brandBgColor: '#ffffff',
        brandTextColor: '#000000',
        logoUrl: '',
        accountManager: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [showToast, setShowToast] = useState(false);
    const [isLogoInfoOpen, setIsLogoInfoOpen] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ ...profile, ...docSnap.data() });
                } else {
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
                address: profile.address || '',
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

    const handlePurgeAndReset = async () => {
        if (!window.confirm("Are you sure you want to remove your custom logo and reset to default colors?")) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                logoUrl: "",
                brandBgColor: "#ffffff",
                brandTextColor: "#000000"
            });
            setProfile(prev => ({...prev, logoUrl: "", brandBgColor: "#ffffff", brandTextColor: "#000000"}));
            sessionStorage.removeItem('client_logo');
            sessionStorage.removeItem('client_bg');
            sessionStorage.removeItem('client_text');
        } catch(err) {
            alert("Failed to reset branding");
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

    const triggerToast = () => {
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    // Dynamically calculate the magic link so it always respects the current slider!
    const encodedMargin = btoa((profile.clientMargin !== undefined ? profile.clientMargin : 20).toString());
    const portalLink = user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/category?pro=${user.uid}&cm=${encodedMargin}` : '';

    const copyMagicLink = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(portalLink).then(triggerToast).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = portalLink;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                triggerToast();
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>;

    const am = profile.accountManager || { name: "Pending Assignment", phone: "Call Main Office", email: "support@floors55.com" };
    const markupVal = Number(profile.clientMargin) || 0;
    const marginVal = markupVal > 0 ? Math.round((markupVal / (100 + markupVal)) * 100) : 0;

    return (
        <main className="bg-gray-50 min-h-screen py-12 relative">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Pro Dashboard</h1>
                        <p className="text-gray-500">Manage your business details, pricing, and client boards.</p>
                    </div>
                    <button onClick={() => signOut(auth)} className="text-red-500 font-bold uppercase tracking-widest text-xs hover:text-red-700">Sign Out</button>
                </div>

                {/* Dedicated Account Manager Card */}
                <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl border border-gray-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">🤝</div>
                    <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 bg-gold text-black rounded-full flex items-center justify-center font-black text-2xl uppercase shadow-lg shrink-0">
                            {am.name !== "Pending Assignment" ? am.name.charAt(0) : "F55"}
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">Your Dedicated Account Manager</h3>
                            <p className="text-2xl font-bold">{am.name}</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col md:items-end w-full md:w-auto gap-2">
                        <a href={`tel:${am.phone}`} className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors flex items-center gap-3 w-full md:w-auto justify-center md:justify-start" style={{ textDecoration: 'none', color: 'white' }}>
                            <span>📞</span> {am.phone}
                        </a>
                        <a href={`mailto:${am.email}`} className="text-gray-400 hover:text-white text-xs font-bold transition-colors text-center md:text-right w-full" style={{ textDecoration: 'none' }}>
                            {am.email}
                        </a>
                    </div>
                </div>

                {/* Business Profile Settings */}
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
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                            <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address (Login)</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Business Address</label>
                            <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="e.g. 123 Main St, Portland OR 97204" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gold outline-none" />
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={isSaving} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50">
                        {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                </div>

                {/* White-Label Branding */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-black mb-1 uppercase tracking-tight">White-Label Branding</h2>
                            <p className="text-sm text-gray-500">Customize the portal to look like your own website when sharing links with clients.</p>
                        </div>
                        {(profile.logoUrl || profile.brandBgColor !== '#ffffff' || profile.brandTextColor !== '#000000') && (
                            <button onClick={handlePurgeAndReset} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest outline-none transition-colors shrink-0">
                                ✕ Purge Logo & Reset Colors
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Company Logo</label>
                                <button 
                                    type="button"
                                    onClick={() => setIsLogoInfoOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gold transition-colors flex items-center gap-1 bg-gray-50 hover:bg-gold/10 px-2 py-1 rounded-full border border-gray-200 outline-none cursor-pointer"
                                >
                                    <span>❓</span> Tips
                                </button>
                            </div>
                            {profile.logoUrl ? (
                                <div className="mt-2 bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-center min-h-[100px]">
                                    <img src={profile.logoUrl} alt="Your Logo" className="h-16 object-contain" />
                                </div>
                            ) : (
                                <div className="mt-2 relative">
                                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" disabled={isUploading}/>
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

                {/* Client Pricing Command Center */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Client Pricing</h2>
                            <p className="text-sm text-gray-500 mt-1 max-w-md">Set the markup percentage applied to wholesale prices when presenting catalog items to your clients.</p>
                        </div>
                        <div className="text-left md:text-right shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-200 min-w-[200px]">
                            <div className="text-3xl font-black text-gold leading-none">{markupVal}% <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Markup</span></div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 border-t border-gray-200 pt-2">Yields <span className="text-black font-black text-sm">{marginVal}%</span> Gross Margin</div>
                        </div>
                    </div>
                    
                    <input type="range" min="0" max="100" step="5" value={profile.clientMargin} onChange={e => setProfile({...profile, clientMargin: e.target.value})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black mb-8" />
                    
                    <div className="flex gap-4 mb-8">
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-black text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors">
                            Save Pricing Model
                        </button>
                        <button onClick={enableClientMode} className="flex-1 bg-gray-100 text-black px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors border border-gray-200">
                            Preview Portal
                        </button>
                    </div>

                    {/* The Portal Link Box */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Your Custom Portal Link</h3>
                        <p className="text-xs text-gray-500 mb-4">Share this link directly with your clients. It will automatically load the entire catalog securely masked with your logo, colors, and your custom client pricing margin.</p>
                        
                        <div className="flex flex-col md:flex-row gap-3">
                            <input type="text" readOnly value={portalLink} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-600 outline-none" />
                            <button onClick={copyMagicLink} className="bg-gold hover:bg-black text-black hover:text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shrink-0 whitespace-nowrap">
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Client Boards */}
                <ClientBoardsManager proId={user.uid} />

            </div>

            {/* Logo Info Modal */}
            {isLogoInfoOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setIsLogoInfoOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors font-bold outline-none"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-black mb-2 text-gray-900">Logo Upload Tips</h3>
                        <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">
                            Make your portal look flawless with these quick logo guidelines.
                        </p>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <strong className="text-gray-900">Ideal Size & Shape:</strong><br />
                                A horizontal rectangle works best in headers. We recommend an image around <strong>400px wide by 100px to 150px tall</strong>.
                            </div>
                            <div>
                                <strong className="text-gray-900">Transparent Backgrounds:</strong><br />
                                For the cleanest look against your brand colors, use a <strong>PNG file with a transparent background</strong> (no white box behind it).
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                                <strong className="text-gray-900 text-xs uppercase tracking-widest">Free Design Tools</strong>
                                <ul className="mt-2 space-y-2 text-xs">
                                    <li>Need to remove a white background? Try <a href="https://www.erase.bg/" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Erase.bg</a> or <a href="https://www.pixelcut.ai/background-remover" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Pixelcut.ai</a> (Both free, no sign-up).</li>
                                    <li>Need to create a logo from scratch? Check out <a href="https://www.canva.com/create/logos/" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline">Canva's Free Logo Maker</a>.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsLogoInfoOpen(false)}
                                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="font-black text-gold">✓</span>
                <p className="font-bold text-xs uppercase tracking-widest m-0">Link Copied</p>
            </div>
        </main>
    );
}