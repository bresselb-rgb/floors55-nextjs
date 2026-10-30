// src/app/service-areas/[slug]/page.js
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TIER_1_CITIES } from '@/lib/serviceAreasData';

export async function generateStaticParams() {
    return TIER_1_CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const city = TIER_1_CITIES.find((c) => c.slug === slug);
    if (!city) return {};

    return {
        title: `Wholesale Flooring, On-Site Measures & Showroom near ${city.name}, ${city.state} | Floors 55 Pro`,
        description: `${city.tagline} Serving ${city.name} contractors, builders, and property managers via our ${city.closestHub} (${city.miles} mi). Wholesale LVP, carpet, hardwood, laminate & tile.`
    };
}

export default async function CityServiceAreaPage({ params }) {
    const { slug } = await params;
    const city = TIER_1_CITIES.find((c) => c.slug === slug);
    if (!city) notFound();

    return (
        <main className="min-h-screen bg-stone-950 text-stone-100 py-14 px-6">
            <div className="max-w-5xl mx-auto">
                <nav className="text-xs uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span>/</span>
                    <Link href="/service-areas" className="hover:underline">Service Areas</Link>
                    <span>/</span>
                    <span className="text-stone-400">{city.name}, {city.state}</span>
                </nav>

                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase px-3 py-1 rounded-full mb-4">
                        Served by our {city.closestHub} · {city.isHub ? 'Home Base' : `${city.miles} miles (${city.driveTime})`}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white">
                        Wholesale Flooring &amp; On-Site Takeoffs in <span className="text-amber-400">{city.name}, {city.state}</span>
                    </h1>

                    <p className="mt-5 text-stone-300 text-base md:text-lg leading-relaxed">
                        {city.description}
                    </p>

                    {/* Core Trade Services in this City */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-stone-950 border border-stone-800 p-5 rounded-xl">
                            <h2 className="text-amber-400 font-bold text-sm uppercase tracking-wider">1. On-Site Laser Measures</h2>
                            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                                We dispatch directly to jobsites across {city.name} and {city.county} to verify square footage, stair counts, seam diagrams, and waste factors so you never over-order or come up short.
                            </p>
                        </div>
                        <div className="bg-stone-950 border border-stone-800 p-5 rounded-xl">
                            <h2 className="text-amber-400 font-bold text-sm uppercase tracking-wider">2. White-Label Client Showroom</h2>
                            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                                Send your {city.name} homeowners to our Portland or Lake Oswego showroom to touch full-size samples while our team protects your custom trade markup.
                            </p>
                        </div>
                        <div className="bg-stone-950 border border-stone-800 p-5 rounded-xl">
                            <h2 className="text-amber-400 font-bold text-sm uppercase tracking-wider">3. Direct Wholesale Brokerage</h2>
                            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                                Trade-direct pricing on commercial and residential carpet, waterproof SPC luxury vinyl, engineered hardwood, AC4/AC5 laminate, and porcelain tile.
                            </p>
                        </div>
                    </div>

                    {/* Popular Specs & Neighborhoods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-stone-800">
                        <div>
                            <h3 className="text-white font-bold text-base mb-3">High-Demand Materials in {city.name}</h3>
                            <ul className="space-y-2 text-sm text-stone-300">
                                {city.popularSpecs.map((spec) => (
                                    <li key={spec} className="flex items-center gap-2">
                                        <span className="text-amber-400">✔</span> {spec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base mb-3">{city.name} Neighborhoods We Measure</h3>
                            <div className="flex flex-wrap gap-2">
                                {city.neighborhoods.map((hood) => (
                                    <span key={hood} className="bg-stone-950 border border-stone-800 text-stone-300 text-xs px-3 py-1.5 rounded-lg">
                                        {hood}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Direct Links into Catalog Categories */}
                    <div className="mt-10 pt-8 border-t border-stone-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <Link href="/category/lvp" className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 px-4 py-2 rounded-lg transition">Browse LVP</Link>
                            <Link href="/category/carpet" className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 px-4 py-2 rounded-lg transition">Browse Carpet</Link>
                            <Link href="/category/hardwood" className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 px-4 py-2 rounded-lg transition">Browse Hardwood</Link>
                            <Link href="/category/laminate" className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 px-4 py-2 rounded-lg transition">Browse Laminate</Link>
                            <Link href="/category/tile" className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 px-4 py-2 rounded-lg transition">Browse Tile</Link>
                        </div>
                        <Link href="/service-areas" className="text-xs text-amber-400 hover:underline font-semibold">
                            ← Back to Full Metro Map
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}