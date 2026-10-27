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
          <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Wholesale Flooring Solutions for Portland Professionals
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                  Protect your bids and streamline your material sourcing. Floors 55 Pro provides exclusive trade pricing, dedicated account management, and rapid will-call logistics for the Pacific Northwest construction industry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Property Management Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Multi-Family & Property Management
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Accelerate your unit turnovers with our heavily stocked commercial LVP and builder-grade carpet. Engineered for high-traffic durability and rigorous PNW weather, our waterproof vinyl plank lines ensure your maintenance teams always have matching inventory ready for immediate Lake Oswego or Portland pickup.
                  </p>
                  <Link href="/category?program=propmgt" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      Explore Prop Mgt
                  </Link>
                </div>

                {/* Custom Builders Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Contractors & Custom Builders
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Maintain your profit margins without sacrificing material quality. We supply top-tier engineered hardwood, laminate, and transition pieces directly to your job site. With transparent trade pricing hidden behind our gated portal, your clients see the value of your work, not your wholesale material costs.
                  </p>
                  <Link href="/category?program=contractor" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      Explore Pro Select
                  </Link>
                </div>

                {/* Interior Designers Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Interior Designers & Architects
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Specify with confidence using our premium tile and high-end carpet collections. Send your clients to our physical showroom at Oswego Village to view physical samples, while you retain full control over the purchasing pipeline, trade discounts, and project tracking through your digital dashboard.
                  </p>
                   <Link href="/category" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      Explore Categories
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

          {/* SEO FAQ Accordion Section */}
          <section className="py-16 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
              <div className="space-y-4">
                
                {/* FAQ 1 */}
                <details className="group bg-gray-50 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between gap-1.5 text-gray-900 font-semibold">
                    <h3 className="text-lg">How do I qualify for wholesale flooring pricing in Portland?</h3>
                    <span className="shrink-0 rounded-full bg-white p-2 text-gray-900 shadow-sm group-open:-rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    To access our exclusive trade portal, you must be a licensed contractor, custom builder, interior designer, or property manager operating in the Portland metro or Lake Oswego area. Once your B2B account is approved, you unlock hidden margins on premium LVP, hardwood, and carpet.
                  </p>
                </details>

                {/* FAQ 2 */}
                <details className="group bg-gray-50 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between gap-1.5 text-gray-900 font-semibold">
                    <h3 className="text-lg">Do you stock commercial LVP for property management turnovers?</h3>
                    <span className="shrink-0 rounded-full bg-white p-2 text-gray-900 shadow-sm group-open:-rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    Yes. We understand multi-family unit turn-overs require speed and consistency. We stock durable, 100% waterproof Luxury Vinyl Plank (LVP) and builder-grade carpet lines designed specifically for rapid deployment across Pacific Northwest property portfolios.
                  </p>
                </details>

                {/* FAQ 3 */}
                <details className="group bg-gray-50 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between gap-1.5 text-gray-900 font-semibold">
                    <h3 className="text-lg">Can my clients visit the Floors 55 Lake Oswego showroom?</h3>
                    <span className="shrink-0 rounded-full bg-white p-2 text-gray-900 shadow-sm group-open:-rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    Absolutely. While Floors 55 Pro is your digital purchasing tool, your clients are welcome to visit our physical showroom at Oswego Village to view samples of high-end tile, engineered hardwood, and designer carpet. You retain full control of the billing and margins.
                  </p>
                </details>

              </div>
            </div>
          </section>
        </>
      )}

    </main>
  );
}