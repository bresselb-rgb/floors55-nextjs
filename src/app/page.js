"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isClientMode, setIsClientMode] = useState(false);
  const [clientBrand, setClientBrand] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClientMode(sessionStorage.getItem('client_margin') !== null);
      setClientBrand(sessionStorage.getItem('client_brand'));
    }
  }, []);

  // Helper function to easily grab Firebase Storage URLs for your local paths
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-white text-gray-900 font-sans flex flex-col flex-1">
      
      <header className="relative min-h-[250px] md:min-h-[320px] py-8 flex items-center justify-center text-center text-white overflow-hidden">
        {/* Next.js Optimized Background Image */}
        <div className="absolute inset-0 z-0">
            <Image 
                src={getFbUrl('images/heros/main-hero.jpg')} 
                alt="Floors 55 Premium Flooring" 
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
                className="object-cover object-center" 
            />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="max-w-3xl px-4 relative z-10">
            <p className="text-gold uppercase tracking-[0.2em] font-bold mb-2 text-xs">
              {isClientMode ? "Premium Flooring Portal" : "Established 2008"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight">
              {isClientMode ? "Curated Fashion Flooring" : "Professional Fashion Flooring for Less"}
            </h1>
            <p className="text-base md:text-lg mb-6 text-gray-200 font-light leading-relaxed">
              {isClientMode 
                ? "Discover our premium selection of Luxury Vinyl, Hardwood, Tile, and Designer Carpet tailored for your home."
                : "The Northwest's premier flooring broker. Secure wholesale pricing on Luxury Vinyl, Hardwood, Tile and Designer Carpet."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/category" className="bg-gold text-black px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>Explore Collections</Link>
                {!isClientMode && (
                    <Link href="/become-a-pro" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-gold hover:text-black transition-all shadow-lg" style={{ textDecoration: 'none' }}>Partner With Us</Link>
                )}
            </div>
        </div>
      </header>

      <section id="categories" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                <Link href="/category/luxury-vinyl" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/lvp.jpg')} alt="Luxury Vinyl" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Luxury Vinyl</h2>
                        <p className="text-gray-300 text-sm mb-6">100% Waterproof & Durable</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop LVP</span>
                    </div>
                </Link>
                
                <Link href="/category/carpet" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/carpet.jpg')} alt="Designer Carpet" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Designer Carpet</h2>
                        <p className="text-gray-300 text-sm mb-6">Plush Comfort & Warmth</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Carpet</span>
                    </div>
                </Link>

                <Link href="/category/laminate" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/laminate.jpg')} alt="Premium Laminate" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Premium Laminate</h2>
                        <p className="text-gray-300 text-sm mb-6">Scratch & Dent Resistant</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Laminate</span>
                    </div>
                </Link>

                <Link href="/category/hardwood" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/hardwood.jpg')} alt="Hardwood" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Hardwood</h2>
                        <p className="text-gray-300 text-sm mb-6">Timeless Natural Beauty</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Hardwood</span>
                    </div>
                </Link>

                {/* NEW TILE CATEGORY */}
                <Link href="/category/tile" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/tile-hero.jpg')} alt="Premium Tile" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Premium Tile</h2>
                        <p className="text-gray-300 text-sm mb-6">Elegant & Waterproof</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Tile</span>
                    </div>
                </Link>
            </div>
        </div>
      </section>

      {/* ONLY SHOW B2B SECTIONS IF NOT IN CLIENT MODE */}
      {!isClientMode && (
        <>
          <section className="py-24 relative bg-gray-900 overflow-hidden">
            {/* Next.js Optimized Background Image */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src={getFbUrl('images/heros/trade-bg.jpg')} 
                    alt="Trade Professional Flooring"
                    fill
                    sizes="100vw"
                    className="object-cover object-center" 
                />
                <div className="absolute inset-0 bg-black/75"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Tailored for Your Trade</h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">Curated flooring collections designed specifically for the rigorous demands of your industry.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Prop Mgt Card - Frosted Glass */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 relative overflow-hidden group transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform duration-500 pointer-events-none">🏠</div>
                        <div className="w-12 h-12 bg-white/10 border border-white/20 text-gold rounded-full flex items-center justify-center text-xl mb-6 shadow-md">🏠</div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Property Management</h3>
                        <p className="text-gray-200 mb-8 leading-relaxed max-w-sm font-light">Durable, high-yield LVP and carpet solutions built for rapid multi-family and commercial turn-overs. Standardized lines for consistent, repeatable ordering.</p>
                        <Link href="/category?program=propmgt" className="inline-block bg-gold text-black px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors shadow-md" style={{ textDecoration: 'none' }}>
                            Explore Prop Mgt
                        </Link>
                    </div>

                    {/* Contractor Pro Card - Frosted Glass */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 relative overflow-hidden group transform hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform duration-500 pointer-events-none">🛠️</div>
                        <div className="w-12 h-12 bg-white/10 border border-white/20 text-gold rounded-full flex items-center justify-center text-xl mb-6 shadow-md">🛠️</div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Contractor Pro Select</h3>
                        <p className="text-gray-200 mb-8 leading-relaxed max-w-sm font-light">Premium hardwood, tile, and luxury vinyl carefully sourced for custom builders and high-end renovations. Uncompromising quality to impress your clients.</p>
                        <Link href="/category?program=contractor" className="inline-block bg-gold text-black px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors shadow-md" style={{ textDecoration: 'none' }}>
                            Explore Pro Select
                        </Link>
                    </div>

                </div>
            </div>
          </section>

          {/* Bring the Showroom to Your Client Section */}
          <section className="py-24 bg-black text-white border-t border-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1 rounded-3xl h-[400px] overflow-hidden shadow-2xl relative group border border-gray-800">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                    <Image 
                        src={getFbUrl('images/heros/samples.jpg')} 
                        alt="Flooring Samples"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                </div>
                <div className="order-1 md:order-2">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Bring the Showroom <br/>to Your Client.</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">Save time and close bids faster. Order physical samples of any premium hardwood, LVP, or designer carpet shipped directly to your firm or active job site.</p>
                    
                    <Link href="/order-sample" className="inline-block bg-gold text-black px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>
                        Order Physical Samples
                    </Link>
                </div>
            </div>
          </section>
        </>
      )}

    </main>
  );
}