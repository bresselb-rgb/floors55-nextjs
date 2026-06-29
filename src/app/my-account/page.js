"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, appId } from "../../lib/firebase";

import ProposalsManager from '../../components/ProposalsManager';
import ClientBoardsManager from '../../components/ClientBoardsManager';

export default function MyAccountPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    
    // Tab Navigation State
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'boards', 'proposals', 'branding'

    // Form States
    const [profile, setProfile] = useState({
        business: '',
        name: '',
        phone: '',
        address: '',
        clientMargin: 20,
        brandBgColor: '#ffffff',
        brandTextColor: '#000000',
        logoUrl: '',
        accountManager: null,
        isWhiteLabelEnabled: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const [isWhiteLabelActive, setIsWhiteLabelActive] = useState(false);
    const [linkBranding, setLinkBranding] = useState('f55'); // 'f55' or 'custom'

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.isAnonymous) {
                setUser(currentUser);
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    let whiteLabelActive = false;
                    if (data.isWhiteLabelEnabled !== undefined) {
                        whiteLabelActive = data.isWhiteLabelEnabled;
                    } else if (data.logoUrl || (data.brandBgColor && data.brandBgColor !== '#ffffff') || (data.brandTextColor && data.brandTextColor !== '#000000')) {
                        whiteLabelActive = true;
                    }
                    
                    setIsWhiteLabelActive(whiteLabelActive);
                    setProfile({ ...profile, ...data, isWhiteLabelEnabled: whiteLabelActive });
                    
                    // Auto-set the link generator based on their saved preference
                    if (whiteLabelActive) {
                        setLinkBranding('custom');
                    } else {
                        setLinkBranding('f55');
                    }

                } else {
                    await setDoc(docRef, { business: 'Flooring Pro', clientMargin: 20 });
                }
            } else {
                router.push('/');
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, [router]);

    const triggerToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                business: profile.business,
                name: profile.name,
                phone: profile.phone,
                address: profile.address,
                clientMargin: profile.clientMargin
            });
            triggerToast("Profile Updated!");
        } catch(err) {
            triggerToast("Save failed. Try again.");
        }
        setIsSaving(false);
    };

    const handleSaveBranding = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                brandBgColor: profile.brandBgColor,
                brandTextColor: profile.brandTextColor
            });
            triggerToast("Branding Colors Saved!");
        } catch(err) {
            triggerToast("Save failed. Try again.");
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
            triggerToast("Logo uploaded successfully!");
        } catch(err) {
            triggerToast("Upload failed. Please try again.");
        }
        setIsUploading(false);
    };

    const handleToggleWhiteLabel = async (checked) => {
        setIsWhiteLabelActive(checked);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
                isWhiteLabelEnabled: checked
            });
            if (!checked) {
                setLinkBranding('f55'); // Auto-switch link generator back to F55
            } else {
                setLinkBranding('custom');
            }
            triggerToast(checked ? "White-Label Enabled" : "White-Label Disabled");
        } catch(err) {
            console.error("Failed to update white-label status", err);
            triggerToast("Failed to update status");
        }
    };

    const enableClientMode = () => {
        sessionStorage.setItem('client_margin', profile.clientMargin);
        
        if (linkBranding === 'custom' && isWhiteLabelActive) {
            sessionStorage.setItem('client_brand', profile.business || 'Your Flooring Professional');
            if (profile.logoUrl) sessionStorage.setItem('client_logo', profile.logoUrl);
            sessionStorage.setItem('client_bg', profile.brandBgColor);
            sessionStorage.setItem('client_text', profile.brandTextColor);
        } else {
            sessionStorage.removeItem('client_brand');
            sessionStorage.removeItem('client_logo');
            sessionStorage.removeItem('client_bg');
            sessionStorage.removeItem('client_text');
        }

        router.push('/category');
    };

    const copyMasterLink = async () => {
        const targetPath = `/category?cm=${btoa(profile.clientMargin.toString())}${linkBranding === 'custom' && isWhiteLabelActive ? '&pro=' + user.uid : ''}`;
        
        const shortCode = Math.random().toString(36).substring(2, 8);
        let finalUrl = `${window.location.origin}/s/${shortCode}`;
        
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'short_links', shortCode), {
                target: targetPath,
                createdAt: new Date().toISOString()
            });
        } catch(err) {
            console.warn("Short link generation failed, using long URL.", err);
            finalUrl = `${window.location.origin}${targetPath}`;
        }

        const plainText = `${linkBranding === 'custom' ? profile.business : 'Floors 55'} Catalog\n${finalUrl}`;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(plainText).then(() => triggerToast("Link Copied")).catch(console.error);
        } else {
            const tempInput = document.createElement("textarea");
            tempInput.value = plainText;
            document.body.appendChild(tempInput);
            tempInput.select();
            try { document.execCommand("copy"); triggerToast("Link Copied"); } catch (err) { console.error(err); }
            document.body.removeChild(tempInput);
        }
    };

    if (isLoading) return <div className="flex-1 flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold border-t-transparent"></div></div>;

    const currentMarginVal = profile.clientMargin > 0 ? ((profile.clientMargin / (100 + profile.clientMargin)) * 100).toFixed(1) : 0;

    return (
        <main className="bg-gray-50 font-sans flex flex-col flex-1 pb-20">
            <header className="bg-gray-900 pt-16 pb-24 border-b-4 border-gold text-white text-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fheros%2Flvp.jpg?alt=media')] bg-cover bg-center"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Partner Dashboard</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Manage your pipeline, margin, and client presentations.</p>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 w-full -mt-12 relative z-20">
                
                {/* --- NAVIGATION TABS --- */}
                <div className="flex overflow-x-auto bg-white rounded-t-2xl shadow-sm border border-gray-200 border-b-0 hide-scrollbar shrink-0">
                    <button onClick={() => setActiveTab('catalog')} className={`flex-1 py-4 px-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors outline-none cursor-pointer ${activeTab === 'catalog' ? 'text-gold border-b-4 border-gold' : 'text-gray-400 hover:text-gray-900 border-b-4 border-transparent'}`}>
                        Quick Share & Margin
                    </button>
                    <button onClick={() => setActiveTab('proposals')} className={`flex-1 py-4 px-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors outline-none cursor-pointer ${activeTab === 'proposals' ? 'text-gold border-b-4 border-gold' : 'text-gray-400 hover:text-gray-900 border-b-4 border-transparent'}`}>
                        Turnkey Proposals
                    </button>
                    <button onClick={() => setActiveTab('boards')} className={`flex-1 py-4 px-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors outline-none cursor-pointer ${activeTab === 'boards' ? 'text-gold border-b-4 border-gold' : 'text-gray-400 hover:text-gray-900 border-b-4 border-transparent'}`}>
                        Client Boards
                    </button>
                    <button onClick={() => setActiveTab('branding')} className={`flex-1 py-4 px-6 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-colors outline-none cursor-pointer ${activeTab === 'branding' ? 'text-gold border-b-4 border-gold' : 'text-gray-400 hover:text-gray-900 border-b-4 border-transparent'}`}>
                        Settings & Branding
                    </button>
                </div>

                <div className="bg-white rounded-b-2xl shadow-md border border-gray-200 p-6 md:p-8 min-h-[600px]">
                    
                    {/* --- TAB 1: CATALOG & MARGIN --- */}
                    {activeTab === 'catalog' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl shrink-0">🤝</div>
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Account Manager</p>
                                    <h3 className="text-xl font-bold text-gray-900">{profile.accountManager?.name || 'Assigned Representative'}</h3>
                                    <p className="text-sm text-gray-600 font-medium">{profile.accountManager?.phone || 'Call the Main Office'} &bull; {profile.accountManager?.email || 'support@floors55.com'}</p>
                                </div>
                                <div className="shrink-0 flex gap-2">
                                    <a href={profile.accountManager?.phone ? `tel:${profile.accountManager.phone.replace(/[^0-9]/g, '')}` : '#'} className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:text-gold outline-none" style={{ textDecoration: 'none' }}>Call</a>
                                    <a href={profile.accountManager?.email ? `mailto:${profile.accountManager.email}` : '#'} className="bg-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-gold hover:text-black transition-colors outline-none" style={{ textDecoration: 'none' }}>Email</a>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                                <h3 className="text-2xl font-black mb-2">Master Catalog Sharing</h3>
                                <p className="text-sm text-gray-500 mb-8 max-w-2xl">Use this master slider to establish your universal profit margin. Then, generate a link to share the entire catalog with your clients, completely hiding the raw wholesale prices.</p>

                                <div className="mb-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-widest">Global Catalog Markup</label>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-gold font-mono">{profile.clientMargin}%</span>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Yields {currentMarginVal}% Margin</span>
                                        </div>
                                    </div>
                                    <input type="range" min="0" max="100" step="1" value={profile.clientMargin} onChange={e => setProfile({...profile, clientMargin: Number(e.target.value)})} onMouseUp={handleSaveProfile} onTouchEnd={handleSaveProfile} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                                    <button onClick={enableClientMode} className="flex-1 bg-white border-2 border-black text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-black hover:text-white transition duration-300 text-sm shadow-sm outline-none cursor-pointer">
                                        Browse in Client Mode
                                    </button>
                                    
                                    <div className="flex-1 flex gap-2">
                                        <button onClick={copyMasterLink} className="flex-1 bg-black text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-gold hover:text-black transition duration-300 text-sm shadow-md outline-none cursor-pointer">
                                            Copy Link to Catalog
                                        </button>
                                        <select value={linkBranding} onChange={e => setLinkBranding(e.target.value)} disabled={!isWhiteLabelActive} className="bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-700 outline-none focus:border-gold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                            <option value="f55">Send as Floors 55</option>
                                            {isWhiteLabelActive && <option value="custom">Send as {profile.business || 'My Brand'}</option>}
                                        </select>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* --- TAB 2: PROPOSALS --- */}
                    {activeTab === 'proposals' && (
                        <div className="animate-in fade-in duration-300">
                             <ProposalsManager proId={user.uid} />
                        </div>
                    )}

                    {/* --- TAB 3: CLIENT BOARDS --- */}
                    {activeTab === 'boards' && (
                        <div className="animate-in fade-in duration-300">
                             <ClientBoardsManager proId={user.uid} />
                        </div>
                    )}

                    {/* --- TAB 4: SETTINGS & BRANDING --- */}
                    {activeTab === 'branding' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            
                            {/* Business Profile */}
                            <form onSubmit={handleSaveProfile} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xl font-black mb-6 border-b border-gray-100 pb-4">Business Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Company Name</label>
                                        <input type="text" value={profile.business} onChange={e => setProfile({...profile, business: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold focus:bg-white text-sm transition-colors" placeholder="Your Construction Co." />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Primary Contact Name</label>
                                        <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold focus:bg-white text-sm transition-colors" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Phone Number</label>
                                        <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold focus:bg-white text-sm transition-colors" placeholder="(555) 123-4567" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Billing / Shipping Address</label>
                                        <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gold focus:bg-white text-sm transition-colors" placeholder="123 Builder Lane" />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                     <button type="submit" disabled={isSaving} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors disabled:opacity-50 cursor-pointer outline-none shadow-md">
                                        {isSaving ? "Saving..." : "Save Profile"}
                                     </button>
                                </div>
                            </form>

                            {/* White-Label Settings Master Toggle */}
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${isWhiteLabelActive ? 'bg-gold' : 'bg-gray-200'}`}></div>
                                
                                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                                    <div>
                                        <h3 className="text-xl font-black mb-1">White-Label Branding</h3>
                                        <p className="text-sm text-gray-500 max-w-xl">Replace the "Floors 55" logo and color scheme with your own branding when sharing catalogs, proposals, or client boards.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input type="checkbox" className="sr-only peer" checked={isWhiteLabelActive} onChange={(e) => handleToggleWhiteLabel(e.target.checked)} />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold shadow-inner"></div>
                                    </label>
                                </div>

                                {isWhiteLabelActive ? (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            
                                            {/* Logo Uploader */}
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">Company Logo</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer" onClick={() => document.getElementById('logo-upload').click()}>
                                                    {profile.logoUrl ? (
                                                        <div className="relative w-full h-24 flex items-center justify-center">
                                                            <img src={profile.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                            <div className="absolute inset-0 bg-white/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-900 rounded-xl">Replace Logo</div>
                                                        </div>
                                                    ) : (
                                                        <div className="py-4">
                                                            <div className="text-3xl mb-2 text-gray-400">📸</div>
                                                            <p className="text-sm font-bold text-gray-600">Click to upload logo</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">PNG or JPG recommended</p>
                                                        </div>
                                                    )}
                                                    <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                </div>
                                                {isUploading && <p className="text-xs text-gold font-bold mt-2 text-center animate-pulse uppercase tracking-widest">Uploading Logo...</p>}
                                            </div>

                                            {/* Colors & Preview */}
                                            <div>
                                                <form onSubmit={handleSaveBranding} className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Header Background Color</label>
                                                        <div className="flex gap-3">
                                                            <input type="color" value={profile.brandBgColor} onChange={e => setProfile({...profile, brandBgColor: e.target.value})} className="h-12 w-20 rounded cursor-pointer border border-gray-200" />
                                                            <input type="text" value={profile.brandBgColor} onChange={e => setProfile({...profile, brandBgColor: e.target.value})} className="flex-1 px-4 border border-gray-200 rounded-xl font-mono text-sm focus:border-gold outline-none" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Header Text Color</label>
                                                        <div className="flex gap-3">
                                                            <input type="color" value={profile.brandTextColor} onChange={e => setProfile({...profile, brandTextColor: e.target.value})} className="h-12 w-20 rounded cursor-pointer border border-gray-200" />
                                                            <input type="text" value={profile.brandTextColor} onChange={e => setProfile({...profile, brandTextColor: e.target.value})} className="flex-1 px-4 border border-gray-200 rounded-xl font-mono text-sm focus:border-gold outline-none" />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                         <button type="submit" disabled={isSaving} className="bg-gray-200 text-gray-800 hover:bg-gold hover:text-black px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer outline-none">
                                                            Save Colors
                                                         </button>
                                                    </div>
                                                </form>

                                                <div className="mt-8">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Live Preview</label>
                                                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                                        <div className="p-4 flex items-center justify-between" style={{ backgroundColor: profile.brandBgColor, color: profile.brandTextColor }}>
                                                            {profile.logoUrl ? (
                                                                <img src={profile.logoUrl} alt="Preview" className="h-8 max-w-[150px] object-contain" />
                                                            ) : (
                                                                <span className="font-black text-lg tracking-tighter uppercase leading-none">{profile.business || 'My Brand'}</span>
                                                            )}
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Catalog</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-gray-400 text-sm font-bold">White-Label Branding is currently disabled.</p>
                                        <p className="text-gray-500 text-xs mt-2 max-w-md mx-auto">Your client links and presentation boards will automatically revert to using the standard Floors 55 brand and logo.</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                    
                </div>
            </div>

            {/* Toast Notifier */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[9999] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="font-black text-gold">✓</span>
                <p className="font-bold text-xs uppercase tracking-widest m-0">{toastMsg}</p>
            </div>
        </main>
    );
}
```

### 2. Update the Category Viewer
*(This ensures that if a client opens a generic catalog link and the Pro has toggled White-Label OFF, it reverts to the standard Floors 55 view instead of showing the saved logo).*
```react:Category Viewer:src/components/CategoryViewer.js
// ... existing code ...
          if (proParam) {
                const fetchProBranding = async () => {
                    try {
                        const proDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', proParam));
                        if (proDoc.exists()) {
                            const pData = proDoc.data();
                            sessionStorage.setItem('client_brand', pData.business || 'Premium Floors');
                            
                            if (pData.isWhiteLabelEnabled !== false) {
                                if (pData.logoUrl) sessionStorage.setItem('client_logo', pData.logoUrl);
                                else sessionStorage.removeItem('client_logo');
                                sessionStorage.setItem('client_bg', pData.brandBgColor || '#ffffff');
                                sessionStorage.setItem('client_text', pData.brandTextColor || '#000000');
                            } else {
                                sessionStorage.removeItem('client_logo');
                                sessionStorage.setItem('client_bg', '#ffffff');
                                sessionStorage.setItem('client_text', '#000000');
                            }
                            
                            if (cmParam) {
// ... existing code ...
```

### 3. Update the Product Viewer
*(This ensures individual product links respect the toggle setting too).*
```react:Product Viewer Image Optimization:src/components/ProductViewer.js
// ... existing code ...
            if (proParam) {
                const fetchProBranding = async () => {
                    try {
                        const proDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', proParam));
                        if (proDoc.exists()) {
                            const pData = proDoc.data();
                            sessionStorage.setItem('client_brand', pData.business || 'Premium Floors');
                            
                            if (pData.isWhiteLabelEnabled !== false) {
                                if (pData.logoUrl) sessionStorage.setItem('client_logo', pData.logoUrl);
                                else sessionStorage.removeItem('client_logo');
                                sessionStorage.setItem('client_bg', pData.brandBgColor || '#ffffff');
                                sessionStorage.setItem('client_text', pData.brandTextColor || '#000000');
                            } else {
                                sessionStorage.removeItem('client_logo');
                                sessionStorage.setItem('client_bg', '#ffffff');
                                sessionStorage.setItem('client_text', '#000000');
                            }
                            
                            let decodedMargin = 20;
// ... existing code ...
```

### 4. Update the Client Boards Manager
*(This ensures that any NEW client presentation boards created while the toggle is OFF will be branded as "Floors 55" by default).*
```react:Client Boards Manager:src/components/ClientBoardsManager.js
// ... existing code ...
    try {
        const proRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', proId);
        const proSnap = await getDoc(proRef);
        if (proSnap.exists()) {
            const data = proSnap.data();
            if (data.clientMargin !== undefined) lockedMargin = Number(data.clientMargin);
            
            if (data.isWhiteLabelEnabled !== false) {
                if (data.business) lockedBusiness = data.business;
                if (data.logoUrl) lockedLogo = data.logoUrl;
                if (data.brandBgColor) lockedBgColor = data.brandBgColor;
                if (data.brandTextColor) lockedTextColor = data.brandTextColor;
            }
        }
    } catch(err) {
        console.error("Could not fetch pro profile for margin locking:", err);
    }
// ... existing code ...
```

Now, toggling the switch merely hides the colors and logos from the public and generates regular links, but perfectly preserves the branding in the background for when they are ready to turn it back on!