// src/app/page.js
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BASE_URL = 'https://www.floors55pro.com';

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

  // WebSite + FAQPage JSON-LD Schema for Homepage Authority & AI Search Snippets
  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I qualify for wholesale flooring pricing in Portland?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To access our exclusive trade portal, you must be a licensed contractor, custom builder, realtor, interior designer, or property manager operating in the Portland metro, Lake Oswego, or SW Washington area. Once your B2B account is approved, you unlock hidden trade margins on premium LVP, engineered hardwood, laminate, porcelain tile, and carpet.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you stock commercial LVP for property management turnovers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We understand multi-family unit turnovers require speed and consistency. We supply durable, 100% waterproof Luxury Vinyl Plank (LVP) and builder-grade carpet lines staged for rapid vendor partner warehouse will-call across the Portland and SW Washington metro.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can my clients visit the Floors 55 Lake Oswego or Portland showroom?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. While Floors 55 Pro is your digital purchasing tool, your clients are welcome to visit our physical showrooms in Portland (1320 SE Water Ave) and Lake Oswego (Oswego Village, 25 S State St Ste 2110) to view full-size samples while you retain full control of billing and trade margins.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do you offer on-site project measures and flooring installation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We dispatch from our Portland and Lake Oswego showrooms across 15+ metro cities for on-site project measures and takeoffs, and we provide professional residential and commercial flooring installation by request.'
        }
      }
    ]
  };

  return (
    <main className="bg-white text-gray-900 font-sans flex flex-col flex-1">
      {!isClientMode && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
        />
      )}
      
      <header className="relative min-h-[250px] md:min-h-[320px] py-8 flex items-center justify-center text-center text-white overflow-hidden">
        {/* Next.js Optimized Background Image */}
        <div className="absolute inset-0 z-0">
            <Image 
                src={getFbUrl('images/heros/main-hero.jpg')} 
                alt="Floors 55 Pro Wholesale Flooring Showrooms in Portland and Lake Oswego" 
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
              {isClientMode ? "Premium Flooring Portal" : "Established 2008 · Portland & Lake Oswego"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight">
              {isClientMode ? "Curated Fashion Flooring" : "Professional Fashion Flooring for Less"}
            </h1>
            <p className="text-base md:text-lg mb-6 text-gray-200 font-light leading-relaxed">
              {isClientMode 
                ? "Discover our premium selection of Luxury Vinyl, Hardwood, Tile, and Designer Carpet tailored for your home."
                : "The Northwest's premier B2B flooring trade portal. Secure wholesale pricing on Luxury Vinyl, Hardwood, Tile, Laminate, and Designer Carpet."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/category" className="bg-gold text-black px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>Explore Collections</Link>
                {!isClientMode && (
                    <>
                        <Link href="/become-a-pro" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-gold hover:text-black transition-all shadow-lg" style={{ textDecoration: 'none' }}>Partner With Us</Link>
                        <Link href="/locations" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-white hover:text-black transition-all shadow-lg" style={{ textDecoration: 'none' }}>Trade Showrooms</Link>
                    </>
                )}
            </div>
        </div>
      </header>

      <section id="categories" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                <Link href="/category/luxury-vinyl" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/lvp.jpg')} alt="Wholesale Luxury Vinyl Plank (LVP) Flooring Portland & Lake Oswego" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Luxury Vinyl</h2>
                        <p className="text-gray-300 text-sm mb-6">100% Waterproof &amp; Durable</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop LVP</span>
                    </div>
                </Link>
                
                <Link href="/category/carpet" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/carpet.jpg')} alt="Wholesale Designer & Multi-Family Turn Carpet Portland" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Designer Carpet</h2>
                        <p className="text-gray-300 text-sm mb-6">Plush Comfort &amp; Warmth</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Carpet</span>
                    </div>
                </Link>

                <Link href="/category/laminate" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/laminate.jpg')} alt="Wholesale Waterproof Laminate Flooring Portland & Lake Oswego" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Premium Laminate</h2>
                        <p className="text-gray-300 text-sm mb-6">Scratch &amp; Dent Resistant</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Laminate</span>
                    </div>
                </Link>

                <Link href="/category/hardwood" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/hardwood.jpg')} alt="Wholesale Engineered Hardwood Flooring Portland & Lake Oswego" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Hardwood</h2>
                        <p className="text-gray-300 text-sm mb-6">Timeless Natural Beauty</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Hardwood</span>
                    </div>
                </Link>

                {/* TILE CATEGORY */}
                <Link href="/category/tile" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <Image src={getFbUrl('images/heros/tile-hero.jpg')} alt="Wholesale Porcelain & Ceramic Tile Flooring Portland & Lake Oswego" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h2 className="text-white text-3xl font-bold mb-1">Premium Tile</h2>
                        <p className="text-gray-300 text-sm mb-6">Elegant &amp; Waterproof</p>
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
                  Wholesale Flooring Solutions for Portland &amp; Lake Oswego Professionals
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                  Protect your bids and streamline your material sourcing. Floors 55 Pro provides exclusive trade pricing, on-site project measures, rapid vendor partner warehouse will-call, and installation by request across{' '}
                  <Link href="/service-areas" className="text-[#c5a059] font-semibold hover:underline">15+ Portland Metro &amp; SW Washington cities</Link>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Property Management Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Multi-Family &amp; Property Management
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Accelerate your unit turnovers with our heavily stocked commercial LVP and builder-grade carpet. Engineered for high-traffic durability and rigorous PNW weather, our waterproof vinyl plank lines are staged for rapid vendor partner warehouse will-call and overflow installation support.
                  </p>
                  <Link href="/category?program=propmgt" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      Explore Prop Mgt
                  </Link>
                </div>

                {/* Custom Builders Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Contractors &amp; Custom Builders
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Maintain your profit margins without sacrificing material quality. We supply top-tier engineered hardwood, laminate, and transition pieces with on-site project takeoffs and turnkey installation by request. With trade pricing hidden behind our gated portal, your clients see the value of your work—not your wholesale costs.
                  </p>
                  <Link href="/category?program=contractor" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      Explore Pro Select
                  </Link>
                </div>

                {/* Interior Designers Column */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Interior Designers, Realtors &amp; Architects
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Specify with confidence using our premium tile and high-end carpet collections. Send your clients to our{' '}
                    <Link href="/locations" className="text-[#c5a059] font-semibold hover:underline">Portland or Lake Oswego (Oswego Village) showrooms</Link>{' '}
                    to view full-size samples while you retain full control over the purchasing pipeline, trade discounts, and project tracking.
                  </p>
                   <Link href="/locations" className="inline-block border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                      View Showrooms
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
                        alt="Wholesale Flooring Samples Delivered to Portland & Lake Oswego Jobsites"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                </div>
                <div className="order-1 md:order-2">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">Bring the Showroom <br/>to Your Client.</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">Save time and close bids faster. Order physical samples of any premium hardwood, LVP, tile, laminate, or designer carpet shipped directly to your firm or active job site.</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <Link href="/order-sample" className="inline-block bg-gold text-black px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>
                            Order Physical Samples
                        </Link>
                        <Link href="/service-areas" className="inline-block border border-white/30 text-white px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all" style={{ textDecoration: 'none' }}>
                            View 15-City Coverage Map
                        </Link>
                    </div>
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
                    To access our exclusive trade portal, you must be a licensed contractor, custom builder, realtor, interior designer, or property manager operating in the Portland metro, Lake Oswego, or SW Washington area. Once your B2B account is approved, you unlock hidden margins on premium LVP, hardwood, laminate, tile, and carpet.
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
                    Yes. We understand multi-family unit turnovers require speed and consistency. We supply durable, 100% waterproof Luxury Vinyl Plank (LVP) and builder-grade carpet lines staged for rapid vendor partner warehouse will-call across the Pacific Northwest.
                  </p>
                </details>

                {/* FAQ 3 */}
                <details className="group bg-gray-50 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between gap-1.5 text-gray-900 font-semibold">
                    <h3 className="text-lg">Can my clients visit the Floors 55 Lake Oswego or Portland showroom?</h3>
                    <span className="shrink-0 rounded-full bg-white p-2 text-gray-900 shadow-sm group-open:-rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    Absolutely. While Floors 55 Pro is your digital purchasing tool, your clients are welcome to visit our physical showrooms in Portland (1320 SE Water Ave) and Lake Oswego (Oswego Village, 25 S State St Ste 2110) to view samples of high-end tile, engineered hardwood, and designer carpet while you retain full control of the billing and margins.
                  </p>
                </details>

                {/* FAQ 4 */}
                <details className="group bg-gray-50 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm border border-gray-100">
                  <summary className="flex items-center justify-between gap-1.5 text-gray-900 font-semibold">
                    <h3 className="text-lg">Do you offer on-site project measures and flooring installation?</h3>
                    <span className="shrink-0 rounded-full bg-white p-2 text-gray-900 shadow-sm group-open:-rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    Yes. We dispatch from our Portland and Lake Oswego showrooms across 15+ surrounding Tri-County and Clark County cities for field measurements and project takeoffs, and we provide professional residential and commercial flooring installation by request.
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