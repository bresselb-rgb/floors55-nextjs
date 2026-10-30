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
        <main className="min-h-screen bg-gray-50 text-gray-900 py-14 px-6">
            <div className="max-w-5xl mx-auto">
                <nav className="text-xs font-semibold uppercase tracking-widest text-[#c5a059] mb-4 flex items-center gap-2">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span className="text-gray-300">/</span>
                    <Link href="/service-areas" className="hover:underline">Service Areas</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-500">{city.name}, {city.state}</span>
                </nav>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#c5a059]/40 text-gray-900 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-5">
                        <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                        Served by our {city.closestHub} · {city.isHub ? 'Showroom Hub' : `${city.miles} miles (${city.driveTime})`}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                        Wholesale Flooring &amp; On-Site Takeoffs in <span className="text-[#c5a059]">{city.name}, {city.state}</span>
                    </h1>

                    <p className="mt-5 text-gray-600 text-base md:text-lg leading-relaxed">
                        {city.description}
                    </p>

                    {/* 3 Core Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                1. On-Site Laser Measures
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We dispatch directly to jobsites across {city.name} and {city.county} from our {city.closestHub} to verify square footage, stair runs, seam layouts, and waste factors so your material order is spot-on.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                2. Client Selection Showroom
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Send your {city.name} clients to our Portland or Lake Oswego (Oswego Village) showroom to view full-size samples in person while you retain full control of your trade margin.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                3. Wholesale Trade Pricing
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Protect your bids with trade-direct pricing on waterproof SPC luxury vinyl, engineered hardwood, commercial &amp; residential carpet, laminate, and porcelain tile.
                            </p>
                        </div>
                    </div>

                    {/* Popular Specs & Neighborhoods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-200">
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-4">
                                High-Demand Materials in {city.name}
                            </h3>
                            <ul className="space-y-3 text-base text-gray-700">
                                {city.popularSpecs.map((spec) => (
                                    <li key={spec} className="flex items-center gap-2.5">
                                        <span className="text-[#c5a059] font-bold">✔</span>
                                        <span>{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-4">
                                {city.name} Neighborhoods Covered
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {city.neighborhoods.map((hood) => (
                                    <span
                                        key={hood}
                                        className="bg-gray-100 border border-gray-200 text-gray-800 text-sm font-medium px-3.5 py-1.5 rounded-lg"
                                    >
                                        {hood}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Direct Links into Catalog Categories */}
                    <div className="mt-10 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2.5 text-xs font-bold uppercase tracking-wider">
                            <Link href="/category/luxury-vinyl" className="bg-gray-900 text-white hover:bg-[#c5a059] px-4 py-2.5 rounded-lg transition">
                                Shop Luxury Vinyl
                            </Link>
                            <Link href="/category/carpet" className="bg-gray-900 text-white hover:bg-[#c5a059] px-4 py-2.5 rounded-lg transition">
                                Shop Carpet
                            </Link>
                            <Link href="/category/hardwood" className="bg-gray-900 text-white hover:bg-[#c5a059] px-4 py-2.5 rounded-lg transition">
                                Shop Hardwood
                            </Link>
                            <Link href="/category/laminate" className="bg-gray-900 text-white hover:bg-[#c5a059] px-4 py-2.5 rounded-lg transition">
                                Shop Laminate
                            </Link>
                            <Link href="/category/tile" className="bg-gray-900 text-white hover:bg-[#c5a059] px-4 py-2.5 rounded-lg transition">
                                Shop Tile
                            </Link>
                        </div>
                        <Link href="/service-areas" className="text-sm text-[#c5a059] hover:underline font-bold">
                            ← Back to Full Metro Map
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}