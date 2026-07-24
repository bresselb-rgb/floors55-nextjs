"use client";

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

let Link;
let usePathname = () => '';
let useRouter = () => ({ push: () => {} });
let auth, db, appId;

try {
    const nextLink = 'next/link';
    Link = require(nextLink).default || require(nextLink);
    const nextNav = 'next/navigation';
    const nav = require(nextNav);
    usePathname = nav.usePathname;
    useRouter = nav.useRouter;
} catch (e) {
    Link = ({ href, children, className, style, onClick }) => <a href={href} className={className} style={style} onClick={onClick}>{children}</a>;
    usePathname = () => typeof window !== 'undefined' ? window.location.pathname : '';
    useRouter = () => ({ push: (url) => { if (typeof window !== 'undefined') window.location.href = url; } });
}

try {
    const fbPath = '../lib/firebase';
    const fb = require(fbPath);
    auth = fb.auth;
    db = fb.db;
    appId = fb.appId;
} catch (e) {
    console.warn("Firebase lib not found in current environment context.");
}

const RESOURCE_PAGES = [
    { title: 'Choosing Your Floor', path: '/choosing-your-floor', keywords: ['guide', 'buying', 'compare', 'lvp vs laminate', 'hardwood vs', 'pets', 'kids', 'waterproof', 'best'] },
    { title: 'Floor Care Guide', path: '/floor-care', keywords: ['cleaning', 'maintenance', 'mop', 'scratch', 'pad', 'protect', 'care', 'washing', 'steam'] },
    { title: 'Installation Prep', path: '/installation-prep', keywords: ['prepare', 'install', 'acclimate', 'furniture', 'subfloor', 'day of', 'process'] },
    { title: 'Hard Surface Transitions', path: '/hard-surface-transitions', keywords: ['molding', 't-molding', 'reducer', 'quarter round', 'stair nose', 'end cap', 'threshold', 'gap'] },
    { title: 'Flooring Glossary', path: '/flooring-glossary', keywords: ['terms', 'definition', 'spc', 'wpc', 'wear layer', 'mil', 'ac rating', 'core', 'meaning'] },
    { title: 'Understanding Warranties', path: '/warranties', keywords: ['warranty', 'guarantee', 'wear', 'structural', 'void', 'defect', 'claim'] },
    { title: 'FAQ', path: '/faq', keywords: ['frequently asked questions', 'help', 'support', 'pad attached', 'questions', 'can i'] },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hasSaleItems, setHasSaleItems] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  
  const [clientBrand, setClientBrand] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);
  const [brandBg, setBrandBg] = useState('#ffffff');
  const [brandText, setBrandText] = useState('#000000');
  
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // NEW: Auto-Kill Curation Session Watcher
  useEffect(() => {
      if (typeof window !== 'undefined') {
          const activeBoard = sessionStorage.getItem('active_curation_board_id');
          
          // If a session is active, but the user leaves the catalog/product pages
          if (activeBoard && !pathname.startsWith('/category') && !pathname.startsWith('/product')) {
              sessionStorage.removeItem('active_curation_board_id');
              sessionStorage.removeItem('active_curation_board_name');
              sessionStorage.removeItem('client_margin');
              
              alert("Client board session saved and ended.");
          }
      }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const search = window.location.search;
        
        // If the URL has pro tags, keep the header hidden until the redirect runs!
        if (search.includes('pro=') || search.includes('cb=')) {
            setIsProcessingMagicLink(true);
            return;
        }

        setIsProcessingMagicLink(false);
        setClientBrand(sessionStorage.getItem('client_brand'));
        const logo = sessionStorage.getItem('client_logo');
        if (logo && logo !== "undefined" && logo !== "null") setClientLogo(logo);
        else setClientLogo(null);
        setBrandBg(sessionStorage.getItem('client_bg') || '#ffffff');
        setBrandText(sessionStorage.getItem('client_text') || '#000000');
    }
  }, [pathname]);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  // Lock background scrolling when Search is open
  useEffect(() => {
    if (isSearchOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setHeaderSearchQuery('');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => { 
        document.body.style.overflow = 'unset'; 
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  const getFbUrl = (path) => {
    return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;
  };

  const getSearchImgUrl = (p) => {
    const safeName = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const safeSku = (p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let folderName = 'images'; 
    if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
    else if (safeName) folderName = safeName;
    folderName = folderName.replace(/-+$/, '');

    const displaySku = p.colors?.[0]?.sku || '01';
    const mainType = p.category === 'Carpet' ? 'main' : 'main';
    const rawPath = `images/${folderName}/${p.imgPrefix || ''}${displaySku}_${mainType}.jpg`.toLowerCase();
    
    return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
  };

  const getCategorySlug = (catName) => {
      if (catName === 'All Products') return '/category';
      if (catName === 'Hot Buys') return '/category/hot-buys';
      if (catName === 'Luxury Vinyl (LVP)' || catName.toLowerCase().includes('vinyl')) return '/category/luxury-vinyl';
      return `/category/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  useEffect(() => {
    if (!auth) return;
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else signInAnonymously(auth).catch(err => console.error(err));
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const unsubDb = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'), (snap) => {
      let sale = false;
      const cats = new Set();
      const productList = [];
      
      snap.forEach(d => {
        const data = d.data();
        if (data.isVisible !== false) {
          productList.push({ id: d.id, ...data });
          
          if (data.isSale) sale = true;
          let cat = (data.category || '').trim();
          if (cat.toUpperCase() === 'LVP' || cat.toLowerCase() === 'luxury vinyl' || cat.toLowerCase() === 'luxury vinyl plank') {
              cat = 'Luxury Vinyl (LVP)';
          } else {
              cat = cat || 'Uncategorized';
          }
          cats.add(cat);
        }
      });
      setCategories([...cats].sort());
      setHasSaleItems(sale);
      setAllProducts(productList);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error("Header DB Error:", error);
    });
    return () => unsubDb();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) return;
    try {
      setLoginError('');
      setResetMessage('');
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      if (pathname === '/wholesale-request') {
          router.push('/');
      }
    } catch (error) {
      setLoginError('Access denied. Please check your credentials.');
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setLoginError('Please enter your email address above to reset your password.');
      setResetMessage('');
      return;
    }
    if (!auth) return;
    try {
      setLoginError('');
      await sendPasswordResetEmail(auth, loginEmail);
      setResetMessage('Reset link sent! Please check your email inbox.');
    } catch (error) {
      setResetMessage('');
      setLoginError('Error sending link. Please verify your email is correct.');
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try { await signOut(auth); window.location.href = '/'; } catch (err) {}
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  // UPDATED: Now includes color search
  const filteredSearchProducts = headerSearchQuery.trim() === '' ? [] : allProducts.filter(p => {
      const query = headerSearchQuery.toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      
      const hiddenKeywords = catLower === 'carpet cushion' ? 'pad pads underlayment' : '';
      
      const colorsTextCombined = (p.colors || []).map(c => `${c.name || ''} ${c.sku || ''}`).join(' ').toLowerCase();

      return (p.name || '').toLowerCase().includes(query) ||
             (p.privateName || '').toLowerCase().includes(query) ||
             (p.sku || '').toLowerCase().includes(query) ||
             catLower.includes(query) ||
             (p.manufacturer || '').toLowerCase().includes(query) ||
             hiddenKeywords.includes(query) ||
             colorsTextCombined.includes(query);
  });

  const filteredSearchResources = headerSearchQuery.trim() === '' ? [] : RESOURCE_PAGES.filter(r => {
      const query = headerSearchQuery.toLowerCase();
      return r.title.toLowerCase().includes(query) || 
             r.keywords.some(k => k.toLowerCase().includes(query));
  });

  if (pathname && (pathname.startsWith('/client/') || pathname.startsWith('/proposal/'))) return null;
  if (isProcessingMagicLink) return null; 

  return (
    <>
      <nav className="sticky top-0 z-50 shadow-sm transition-colors duration-300" style={clientBrand ? { backgroundColor: brandBg, color: brandText, borderBottom: `1px solid ${brandText}20` } : { backgroundColor: '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center gap-8 h-full">
              <div className="flex items-center">
                <Link href="/" onClick={closeMenu} className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
                  {clientLogo ? (
                      <img src={clientLogo} alt={clientBrand} className="h-12 md:h-16 w-auto object-contain py-2" />
                  ) : clientBrand ? (
                      <div className="flex flex-col justify-center">
                          <span className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none transition-colors" style={{ color: brandText }}>{clientBrand}</span>
                          <span className="text-[10px] md:text-xs font-black italic tracking-widest uppercase mt-1 opacity-80 transition-colors" style={{ color: brandText }}>Premium Floor Portal</span>
                      </div>
                  ) : (
                      <img src={getFbUrl('images/f55-pros-logo.jpg')} alt="Floors 55 for Pros" className="h-12 md:h-16 w-auto" />
                  )}
                </Link>
              </div>

              <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest h-full items-center">
                
                {/* Products Dropdown */}
                <div className="group relative h-full flex items-center">
                  <button className="transition flex items-center gap-1 py-8 bg-transparent border-none font-bold uppercase cursor-pointer outline-none hover:opacity-70" style={{ color: clientBrand ? brandText : '#000000' }}>
                    Products ▾
                  </button>
                  <div className="absolute top-full left-0 bg-white shadow-2xl border border-gray-100 min-w-[280px] hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <Link href="/category" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      All Collections
                    </Link>
                    {user && !user.isAnonymous && hasSaleItems && (
                      <Link href="/category/hot-buys" className="block w-full text-left px-6 py-4 hover:bg-red-50 hover:text-red-700 border-b border-gray-50 text-xs text-red-600 font-bold" style={{ textDecoration: 'none' }}>
                        🔥 Hot Buys
                      </Link>
                    )}
                    {categories.map(cat => (
                      <Link key={cat} href={getCategorySlug(cat)} className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Resources Dropdown Expanded */}
                <div className="group relative h-full flex items-center">
                  <button className="transition flex items-center gap-1 py-8 bg-transparent border-none font-bold uppercase cursor-pointer outline-none hover:opacity-70" style={{ color: clientBrand ? brandText : '#000000' }}>
                    Resources ▾
                  </button>
                  <div className="absolute top-full left-0 bg-white shadow-2xl border border-gray-100 min-w-[240px] hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <Link href="/choosing-your-floor" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Choosing Your Floor
                    </Link>
                    <Link href="/floor-care" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Floor Care Guide
                    </Link>
                    <Link href="/installation-prep" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Installation Prep
                    </Link>
                    <Link href="/hard-surface-transitions" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Hard Surface Transitions
                    </Link>
                    <Link href="/flooring-glossary" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Flooring Glossary
                    </Link>
                    <Link href="/warranties" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      Understanding Warranties
                    </Link>
                    <Link href="/faq" className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold text-xs text-gray-900" style={{ textDecoration: 'none' }}>
                      FAQ
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              
              {/* DESKTOP SEARCH ICON */}
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className={`transition-colors outline-none cursor-pointer p-2 ${clientBrand ? 'hover:opacity-70' : 'text-gray-500 hover:text-gold'}`} 
                style={{ color: clientBrand ? brandText : undefined }} 
                title="Search Catalog"
              >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>

              {!clientBrand && (
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-l border-gray-200 pl-6">
                  {user && !user.isAnonymous ? (
                    <div className="flex items-center gap-4">
                       <Link href="/my-account" className="hover:text-gold transition uppercase tracking-widest outline-none text-gray-900 font-bold cursor-pointer flex items-center gap-1.5" style={{ textDecoration: 'none' }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          My Account
                       </Link>
                       <button onClick={handleLogout} className="hover:text-gold transition uppercase tracking-widest outline-none text-[#c5a059] bg-transparent border-none font-bold cursor-pointer">Sign Out</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-gold transition uppercase tracking-widest outline-none bg-transparent border-none font-bold cursor-pointer text-gray-500 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Sign In
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                {!clientBrand && (
                  <Link href="/become-a-pro" className="bg-gold text-black px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-black hover:text-white transition-all shadow-md" style={{ textDecoration: 'none' }}>Become a Pro</Link>
                )}
                <Link href="/general-contact" className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>Contact Us</Link>
              </div>
            </div>

            {/* MOBILE ICONS */}
            <div className="md:hidden flex items-center gap-2">
              
              {/* MOBILE SEARCH ICON */}
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className={`p-2 focus:outline-none bg-transparent border-none cursor-pointer transition-colors ${clientBrand ? 'hover:opacity-70' : 'text-gray-500 hover:text-gold'}`} 
                style={{ color: clientBrand ? brandText : undefined }} 
                title="Search Catalog"
              >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>

              {!clientBrand && (
                <button 
                  onClick={() => user && !user.isAnonymous ? router.push('/my-account') : setIsLoginModalOpen(true)} 
                  className={`p-2 focus:outline-none bg-transparent border-none cursor-pointer transition-colors ${user && !user.isAnonymous ? 'text-gold' : 'text-gray-500 hover:text-gold'}`}
                  title={user && !user.isAnonymous ? "My Account" : "Sign In"}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </button>
              )}

              {/* HAMBURGER MENU */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 focus:outline-none bg-transparent border-none cursor-pointer hover:opacity-70" style={{ color: clientBrand ? brandText : '#111827' }}>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl h-screen overflow-y-auto pb-32 z-50">
            <div className="px-6 pt-4 pb-6 space-y-1">
              
              <p className="px-0 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Products</p>
              <Link href="/category" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>All Collections</Link>
              {user && !user.isAnonymous && hasSaleItems && (
                <Link href="/category/hot-buys" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-red-600 border-b border-gray-50 animate-pulse" style={{ textDecoration: 'none' }}>🔥 Hot Buys</Link>
              )}
              {categories.map(cat => (
                <Link key={cat} href={getCategorySlug(cat)} onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>{cat}</Link>
              ))}
              
              <div className="pt-4 mt-2">
                <p className="px-0 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Resources</p>
                <Link href="/choosing-your-floor" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Choosing Your Floor</Link>
                <Link href="/floor-care" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Floor Care Guide</Link>
                <Link href="/installation-prep" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Installation Prep</Link>
                <Link href="/hard-surface-transitions" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Transitions</Link>
                <Link href="/flooring-glossary" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Glossary</Link>
                <Link href="/warranties" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Warranties</Link>
                <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>FAQ</Link>
              </div>

              {!clientBrand && (
                <div className="pt-4 border-t border-gray-100 mt-2">
                  {user && !user.isAnonymous ? (
                    <>
                      <Link href="/my-account" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>My Account</Link>
                      <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-[#c5a059] border-b border-gray-50 outline-none bg-transparent cursor-pointer">Sign Out</button>
                    </>
                  ) : (
                    <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50 outline-none bg-transparent cursor-pointer">Sign In</button>
                  )}
                </div>
              )}

              <div className="pt-6 space-y-3">
                {!clientBrand && (
                  <Link href="/become-a-pro" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-gold text-black text-center px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md" style={{ textDecoration: 'none' }}>Become a Pro</Link>
                )}
                <Link href="/general-contact" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-black text-white text-center px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>Contact Us</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center pt-8 md:pt-24 px-4 transition-opacity duration-300">
          <div className="w-full max-w-3xl relative animate-in slide-in-from-top-4 duration-300">
            <button onClick={() => { setIsSearchOpen(false); setHeaderSearchQuery(''); }} className="absolute -top-8 right-0 text-gray-300 hover:text-white text-[10px] font-bold tracking-widest uppercase outline-none cursor-pointer bg-transparent border-none">
                Close ✕
            </button>
            <div className="relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Search products, colors, or resources..." 
                value={headerSearchQuery} 
                onChange={e => setHeaderSearchQuery(e.target.value)}
                className="w-full bg-white text-gray-900 text-lg md:text-xl rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-gold shadow-2xl"
              />
              <span className="absolute right-6 top-5 text-2xl opacity-50 pointer-events-none">🔍</span>
            </div>

            {headerSearchQuery.trim() && (
               <div className="mt-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto border border-gray-200 flex flex-col">
                 {(filteredSearchProducts.length > 0 || filteredSearchResources.length > 0) ? (
                   <div className="divide-y divide-gray-100 flex-1">
                      
                      {/* Products Results */}
                      {filteredSearchProducts.length > 0 && (
                          <div>
                              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">Products</div>
                              {filteredSearchProducts.slice(0, 4).map(p => {
                                  const displayTitle = (p.usePrivateName && p.privateName) ? p.privateName : (p.name || 'Unnamed Product');
                                  return (
                                      <Link key={p.id} href={`/product/${p.id}`} onClick={() => { setIsSearchOpen(false); setHeaderSearchQuery(''); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100" style={{ textDecoration: 'none' }}>
                                         <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            <img src={getSearchImgUrl(p)} className="w-full h-full object-cover" onError={e => e.target.src = getFbUrl('images/tbd.jpg')} alt={displayTitle} />
                                         </div>
                                         <div>
                                            <div className="text-base font-bold text-gray-900 mb-0.5">{displayTitle}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category} &bull; <span className="font-mono">{p.sku}</span></div>
                                         </div>
                                      </Link>
                                  );
                              })}
                          </div>
                      )}

                      {/* Resource Results */}
                      {filteredSearchResources.length > 0 && (
                          <div className="bg-white">
                              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 border-b border-gray-100">Help & Resources</div>
                              {filteredSearchResources.map(r => (
                                  <Link key={r.path} href={r.path} onClick={() => { setIsSearchOpen(false); setHeaderSearchQuery(''); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100" style={{ textDecoration: 'none' }}>
                                     <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shadow-sm shrink-0">📘</div>
                                     <div>
                                        <div className="text-sm font-bold text-gray-900">{r.title}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Resource Guide</div>
                                     </div>
                                  </Link>
                              ))}
                          </div>
                      )}

                      {filteredSearchProducts.length > 4 && (
                         <div className="p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <Link href="/category" onClick={() => { setIsSearchOpen(false); setHeaderSearchQuery(''); }} className="text-xs font-black text-black uppercase tracking-widest hover:text-gold transition-colors block w-full" style={{ textDecoration: 'none' }}>
                               View all {filteredSearchProducts.length} product results &rarr;
                            </Link>
                         </div>
                      )}
                   </div>
                 ) : (
                   <div className="p-8 text-center bg-gray-50">
                       <span className="text-4xl mb-4 block opacity-20">🤷</span>
                       <div className="text-gray-400 text-sm font-bold italic">No results found matching "{headerSearchQuery}"</div>
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[200] flex items-center justify-center px-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-1 text-gray-900 tracking-tight">Partner Login</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Access Your Dashboard</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gold text-sm transition-colors" />
              <div>
                  <input type="password" required placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gold text-sm transition-colors" />
                  <div className="flex justify-end mt-2">
                      <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gold transition-colors bg-transparent border-none cursor-pointer outline-none">Forgot Password?</button>
                  </div>
              </div>
              
              {loginError && <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-xs font-bold flex items-center gap-2"><span>⚠️</span> {loginError}</div>}
              {resetMessage && <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-lg text-xs font-bold flex items-center gap-2"><span>✓</span> {resetMessage}</div>}
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => { setIsLoginModalOpen(false); setLoginError(''); setResetMessage(''); }} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors outline-none">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gold hover:text-black transition-colors text-xs uppercase tracking-widest cursor-pointer outline-none">Log In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}