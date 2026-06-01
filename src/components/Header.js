"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db, appId } from "../lib/firebase";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hasSaleItems, setHasSaleItems] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
    });
    return () => unsubDb();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginError('');
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      setLoginError('Access denied.');
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) {}
  };

  const handleNav = (hash) => {
    setIsMobileMenuOpen(false);
    // If we are already on the category page, we smartly replace the hash and trigger the filter
    if (pathname === '/category') {
        router.replace(`/category#${hash}`, { scroll: false });
        setTimeout(() => window.dispatchEvent(new Event('hashchange')), 50);
    } else {
        router.push(`/category#${hash}`);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <img src="https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Ff55-pros-logo.jpg?alt=media" alt="Floors 55 for Pros" className="h-10 md:h-12 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest h-full items-center">
              <div className="group relative h-full flex items-center">
                <button className="hover:text-gold transition flex items-center gap-1 py-8 text-black bg-transparent border-none font-bold uppercase cursor-pointer outline-none">
                  Products ▾
                </button>
                <div className="absolute top-full left-0 bg-white shadow-2xl border border-gray-100 min-w-[280px] hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button onClick={() => handleNav('All Products')} className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900 cursor-pointer outline-none font-bold tracking-widest uppercase">
                    All Collections
                  </button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => handleNav(encodeURIComponent(cat))} className="block w-full text-left px-6 py-4 hover:bg-gray-50 hover:text-gold border-b border-gray-50 text-xs text-gray-900 cursor-pointer outline-none">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {hasSaleItems && (
                <button onClick={() => handleNav('Hot Buys')} className="hover:text-red-500 text-red-600 transition flex items-center gap-1 font-bold cursor-pointer outline-none bg-transparent border-none">
                  🔥 Hot Buys
                </button>
              )}
              <Link href="/#locations" className="hover:text-gold transition text-gray-900" style={{ textDecoration: 'none' }}>Locations</Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <Link href="/wholesale-request" className="hover:text-gold transition text-gray-500" style={{ textDecoration: 'none' }}>Pro Sign Up</Link>
                {user && !user.isAnonymous ? (
                  <button onClick={handleLogout} className="hover:text-gold transition uppercase tracking-widest outline-none text-[#c5a059] bg-transparent border-none font-bold cursor-pointer">Sign Out</button>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-gold transition uppercase tracking-widest outline-none bg-transparent border-none font-bold cursor-pointer text-gray-500">Sign In</button>
                )}
              </div>
              <Link href="/general-contact" className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>Contact Us</Link>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900 hover:text-gold p-2 focus:outline-none bg-transparent border-none cursor-pointer">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl h-screen overflow-y-auto pb-32 z-50">
            <div className="px-6 pt-4 pb-6 space-y-1">
              <button onClick={() => handleNav('All Products')} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50 outline-none bg-transparent cursor-pointer">
                All Collections
              </button>
              {hasSaleItems && (
                <button onClick={() => handleNav('Hot Buys')} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-red-600 border-b border-gray-50 animate-pulse outline-none bg-transparent cursor-pointer">
                  🔥 Hot Buys
                </button>
              )}
              {categories.map(cat => (
                <button key={cat} onClick={() => handleNav(encodeURIComponent(cat))} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50 outline-none bg-transparent cursor-pointer">
                  {cat}
                </button>
              ))}
              <Link href="/#locations" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Locations</Link>
              <Link href="/wholesale-request" onClick={() => setIsMobileMenuOpen(false)} className="block py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50" style={{ textDecoration: 'none' }}>Pro Sign Up</Link>
              {user && !user.isAnonymous ? (
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-[#c5a059] border-b border-gray-50 outline-none bg-transparent cursor-pointer">Sign Out</button>
              ) : (
                <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-left py-4 text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-50 outline-none bg-transparent cursor-pointer">Sign In</button>
              )}
              <div className="pt-4">
                <Link href="/general-contact" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-black text-white text-center px-6 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all" style={{ textDecoration: 'none' }}>Contact Us</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Partner Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded focus:outline-none focus:border-gold" />
              <input type="password" required placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded focus:outline-none focus:border-gold" />
              {loginError && <p className="text-red-500 text-xs font-bold">{loginError}</p>}
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded text-xs uppercase cursor-pointer outline-none">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white font-bold rounded hover:bg-gold hover:text-black transition-colors text-xs uppercase cursor-pointer outline-none">Log In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}