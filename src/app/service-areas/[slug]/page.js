// src/app/service-areas/[slug]/page.js
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TIER_1_CITIES } from '@/lib/serviceAreasData';

// Rotates the 3 SEO installation angles based on each city's primary project profile
function getCityInstallCopy(city) {
    const customBuildSlugs = ['lake-oswego-or', 'west-linn-or', 'oregon-city-or', 'happy-valley-or', 'camas-wa'];
    const highVolumeSlugs = ['portland-or', 'beaverton-or', 'vancouver-wa', 'hillsboro-or', 'gresham-or'];

    if (customBuildSlugs.includes(city.slug)) {
        return {
            title: '4. Turnkey Installation (By Request)',
            badge: 'Material-Only or Turnkey Installed Packages',
            body: `Need a complete material-and-labor package in ${city.name} to keep your build schedule moving? While many of our trade accounts use their own crews, we provide professional, vetted residential and commercial flooring installation by request across ${city.county}.`
        };
    }

    if (highVolumeSlugs.includes(city.slug)) {
        return {
            title: '4. On-Demand Installation Support',
            badge: 'Overflow & Turnkey Installation by Request',
            body: `Crews booked out or tackling a tight ${city.name} multi-unit turnover? In addition to wholesale material supply and vendor will-call, Floors 55 Pro offers professional installation services by request—giving you reliable backup labor capacity whenever your project timeline demands it.`
        };
    }

    return {
        title: '4. Professional Installation Upon Request',
        badge: 'Trade Supply · Vendor Will-Call · Install by Request',
        body: `From material specification at our Portland and Lake Oswego showrooms to final walkthrough in ${city.name}, we can take the flooring scope completely off your plate. Ask your account rep to bundle certified installation into your quote alongside your wholesale material order.`
    };
}

export async function generateStaticParams() {
    return TIER_1_CITIES.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const city = TIER_1_CITIES.find((c) => c.slug === slug);
    if (!city) return {};

    return {
        title: `Wholesale Flooring, On-Site Measures & Installation near ${city.name}, ${city.state} | Floors 55 Pro`,
        description: `${city.tagline} Serving ${city.name} contractors, builders, and property managers via our ${city.closestHub} (${city.miles} mi). Vendor will-call & professional installation by request.`
    };
}

export default async function CityServiceAreaPage({ params }) {
    const { slug } = await params;
    const city = TIER_1_CITIES.find((c) => c.slug === slug);
    if (!city) notFound();

    const installInfo = getCityInstallCopy(city);

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 py-10 md:py-14 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <nav className="text-xs font-semibold uppercase tracking-widest text-[#c5a059] mb-4 flex flex-wrap items-center gap-2">
                    <Link href="/" className="hover:underline">Home</Link>
                    <span className="text-gray-300">/</span>
                    <Link href="/service-areas" className="hover:underline">Service Areas</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-500">{city.name}, {city.state}</span>
                </nav>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 md:p-12 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
                        <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#c5a059]/40 text-gray-900 text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-[#c5a059] shrink-0" />
                            <span>Served by our {city.closestHub} · {city.isHub ? 'Showroom Hub' : `${city.miles} miles (${city.driveTime})`}</span>
                        </div>
                        <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full">
                            {installInfo.badge}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                        Wholesale Flooring, Takeoffs &amp; Installation in <span className="text-[#c5a059]">{city.name}, {city.state}</span>
                    </h1>

                    <p className="mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                        {city.description}
                    </p>

                    {/* 4 Core Trade Pillars (2x2 Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10">
                        <div className="bg-gray-50 border border-gray-200 p-5 sm:p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                1. On-Site Project Measures
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We dispatch directly to jobsites across {city.name} and {city.county} from our {city.closestHub} to verify square footage, stair runs, seam layouts, and waste factors so your material order is spot-on.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-5 sm:p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                2. Client Selection Showrooms
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Send your {city.name} clients to our Portland or Lake Oswego (Oswego Village) showroom to view full-size samples in person while you retain full control of your trade margin.
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-5 sm:p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                3. Vendor Partner Will-Call
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Skip showroom bottlenecks—your material orders are staged for rapid will-call pickup directly at our regional vendor partner distribution warehouses located along the major metro freight corridors.
                            </p>
                        </div>
                        <div className="bg-amber-50/50 border border-[#c5a059]/40 p-5 sm:p-6 rounded-xl">
                            <h2 className="text-gray-900 font-bold text-base mb-2">
                                {installInfo.title}
                            </h2>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {installInfo.body}
                            </p>
                        </div>
                    </div>

                    {/* Popular Specs & Neighborhoods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-10 pt-8 border-t border-gray-200">
                        <div>
                            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                High-Demand Materials in {city.name}
                            </h3>
                            <ul className="space-y-2.5 sm:space-y-3 text-sm sm:text-base text-gray-700">
                                {city.popularSpecs.map((spec) => (
                                    <li key={spec} className="flex items-start gap-2.5">
                                        <span className="text-[#c5a059] font-bold">✔</span>
                                        <span>{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3 sm:mb-4">
                                {city.name} Neighborhoods Covered
                            </h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {city.neighborhoods.map((hood) => (
                                    <span
                                        key={hood}
                                        className="bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg"
                                    >
                                        {hood}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Direct Links into Catalog Categories */}
                    <div className="mt-8 sm:mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                            <Link href="/category/luxury-vinyl" className="bg-gray-900 text-white hover:bg-[#c5a059] px-3.5 py-2.5 rounded-lg transition text-center">
                                Shop LVP
                            </Link>
                            <Link href="/category/carpet" className="bg-gray-900 text-white hover:bg-[#c5a059] px-3.5 py-2.5 rounded-lg transition text-center">
                                Shop Carpet
                            </Link>
                            <Link href="/category/hardwood" className="bg-gray-900 text-white hover:bg-[#c5a059] px-3.5 py-2.5 rounded-lg transition text-center">
                                Shop Hardwood
                            </Link>
                            <Link href="/category/laminate" className="bg-gray-900 text-white hover:bg-[#c5a059] px-3.5 py-2.5 rounded-lg transition text-center">
                                Shop Laminate
                            </Link>
                            <Link href="/category/tile" className="col-span-2 sm:col-span-1 bg-gray-900 text-white hover:bg-[#c5a059] px-3.5 py-2.5 rounded-lg transition text-center">
                                Shop Tile
                            </Link>
                        </div>
                        <Link href="/service-areas" className="text-sm text-[#c5a059] hover:underline font-bold text-center sm:text-right">
                            ← Back to Full Metro Map
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}