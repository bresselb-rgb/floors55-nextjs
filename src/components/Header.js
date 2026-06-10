"use client";

import React, { useState, useEffect } from 'react';
// Next.js specific imports are commented out for the preview environment
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously, sendPasswordResetEmail } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
// Corrected relative path for firebase config based on standard project structure
// import { auth, db, appId } from "../lib/firebase";

// Mocking Next.js Link and navigation for preview purposes
const Link = ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>;
const usePathname = () => window.location.pathname;
const useRouter = () => ({ push: (url) => { window.location.href = url; } });

// --- Mock Firebase (Preview Environment Only) ---
const auth = { currentUser: null };
const db = {};
const appId = "preview-app";
  const [clientBrand, setClientBrand] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setClientBrand(sessionStorage.getItem('client_brand'));
    }
  }, []);

  useEffect(() => {
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    window.addEventListener('open-login-modal', handleOpenLogin);
    return () => window.removeEventListener('open-login-modal', handleOpenLogin);
  }, []);

  const getFbUrl = (path) => {
    return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;
  };

  const getCategorySlug = (catName) => {
      if (catName === 'All Products') return '/category';
      if (catName === 'Hot Buys') return '/category/hot-buys';
      if (catName === 'Luxury Vinyl (LVP)' || catName.toLowerCase().includes('vinyl')) return '/category/luxury-vinyl';
      return `/category/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else signInAnonymously(auth).catch(err => console.error(err));
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubDb = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'pricing'), (snap) => {
      let sale = false;
      const cats = new Set();
      snap.forEach(d => {
        const data = d.data();
        if (data.isVisible !== false) {
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
    }, (error) => {
      if (error.code !== 'permission-denied') console.error("Header DB Error:", error);
    });
    return () => unsubDb();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
    try { await signOut(auth); window.location.href = '/'; } catch (err) {}
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Completely hide the header on white-labeled Client Presentation boards
  if (pathname && pathname.startsWith('/client/')) return null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex items-center gap-8 h-full">
              <div className="flex items-center">
                <Link href="/" onClick={closeMenu} className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
                  {clientBrand ? (
                      <div className="flex flex-col justify-center">
                          <span className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900 group-hover:text-gold transition-colors leading-none">{clientBrand}</span>
                          <span className="text-red-600 text-[10px] md:text-xs font-black italic tracking-widest uppercase mt-1">Premium Floor Portal</span>
                      </div>
                  ) : (
                      <img src={getFbUrl('images/f55-pros-logo.jpg')} alt="Floors 55 for Pros" className="h-12 md:h-16 w-auto" />
                  )}
                </Link>
              </div>

              <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest h-full items-center">
                
                {/* Products Dropdown */}
                <div className="group relative h-full flex items-center">
                  <button className="hover:text-gold transition flex items-center gap-1 py-8 text-black bg-transparent border-none font-bold uppercase cursor-pointer outline-none">
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
                  <button className="hover:text-gold transition flex items-center gap-1 py-8 text-black bg-transparent border-none font-bold uppercase cursor-pointer outline-none">
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
              {!clientBrand && (
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {user && !user.isAnonymous ? (
                    <div className="flex items-center gap-4">
                       <Link href="/my-account" className="hover:text-gold transition uppercase tracking-widest outline-none text-gray-900 font-bold cursor-pointer" style={{ textDecoration: 'none' }}>My Account</Link>
                       <button onClick={handleLogout} className="hover:text-gold transition uppercase tracking-widest outline-none text-[#c5a059] bg-transparent border-none font-bold cursor-pointer">Sign Out</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-gold transition uppercase tracking-widest outline-none bg-transparent border-none font-bold cursor-pointer text-gray-500">Sign In</button>
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

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900 hover:text-gold p-2 focus:outline-none bg-transparent border-none cursor-pointer">
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

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center px-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Partner Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded focus:outline-none focus:border-gold" />
              <div>
                  <input type="password" required placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded focus:outline-none focus:border-gold" />
                  <div className="flex justify-end mt-1">
                      <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gold transition-colors bg-transparent border-none cursor-pointer outline-none">Forgot Password?</button>
                  </div>
              </div>
              {loginError && <p className="text-red-500 text-xs font-bold">{loginError}</p>}
              {resetMessage && <p className="text-emerald-600 text-xs font-bold">{resetMessage}</p>}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setIsLoginModalOpen(false); setLoginError(''); setResetMessage(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded text-xs uppercase cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white font-bold rounded hover:bg-gold hover:text-black transition-colors text-xs uppercase cursor-pointer">Log In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}