// src/app/service-areas/page.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TIER_1_CITIES, TIER_2_TOWNS, SHOWROOM_HUBS } from '@/lib/serviceAreasData';

export default function ServiceAreasPage() {
    const [activeCity, setActiveCity] = useState(TIER_1_CITIES[0]);
    const [hubFilter, setHubFilter] = useState('ALL');

    const filteredCities = hubFilter === 'ALL'
        ? TIER_1_CITIES
        : TIER_1_CITIES.filter(c => c.closestHub.toLowerCase().includes(hubFilter.toLowerCase()));

    // Determine which hub pin to draw the active dispatch line from
    const activeHubCoords = activeCity.closestHub.includes('Portland') && !activeCity.closestHub.includes('Lake Oswego')
        ? { x: 50, y: 42 } // Portland Hub
        : { x: 48, y: 62 }; // Lake Oswego Hub

    return (
        <main className="min-h-screen bg-stone-950 text-stone-100 pb-20">
            {/* Hero Header */}
            <section className="relative border-b border-stone-800 bg-gradient-to-b from-stone-900 to-stone-950 py-14 px-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="text-xs uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <span>/</span>
                        <span className="text-stone-400">Showrooms &amp; Measure Radius</span>
                    </nav>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                                Two Metro Showrooms. <span className="text-amber-400">On-Site Jobsite Measures.</span>
                            </h1>
                            <p className="mt-4 text-stone-300 max-w-3xl text-base md:text-lg leading-relaxed">
                                Anchored by our <strong className="text-white">Portland</strong> and <strong className="text-white">Lake Oswego (Oswego Village)</strong> showrooms, Floors 55 Pro provides contractors, builders, and property managers across the Tri-County &amp; Clark County metro with precision on-site laser measuring, waste-factor verification, and white-label client sample consultations.
                            </p>
                        </div>
                        {/* Dual Hub Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                            {SHOWROOM_HUBS.map((hub) => (
                                <div key={hub.id} className="bg-stone-900/90 border border-amber-500/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                        Showroom &amp; Measure Hub
                                    </div>
                                    <div className="text-white font-semibold mt-1">{hub.name}</div>
                                    <div className="text-xs text-stone-400 mt-0.5">{hub.location}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Map + Ranked City List */}
            <section className="max-w-7xl mx-auto px-6 mt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            15 Core Metro Areas · <span className="text-amber-400">One Short Drive</span>
                        </h2>
                        <p className="text-sm text-stone-400 mt-1">
                            Click or hover any town to view nearest showroom dispatch, typical local material specs, and neighborhood coverage.
                        </p>
                    </div>
                    {/* Hub Filter Toggle */}
                    <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
                        {['ALL', 'Portland', 'Lake Oswego'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setHubFilter(tab)}
                                className={`px-3 py-1.5 rounded-md font-semibold transition ${
                                    hubFilter === tab
                                        ? 'bg-amber-500 text-stone-950'
                                        : 'text-stone-400 hover:text-white'
                                }`}
                            >
                                {tab === 'ALL' ? 'All Metro (15)' : `${tab} Hub`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Stylized Interactive Metro Map (7 cols) */}
                    <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                        <div className="relative w-full aspect-square max-h-[620px] bg-stone-950 rounded-xl border border-stone-800/80 overflow-hidden">
                            {/* Stylized Rivers & Highways SVG Background */}
                            <svg viewBox="0 0 100 100" className="w-full h-full opacity-45">
                                <defs>
                                    <radialGradient id="metroGlow" cx="50%" cy="52%" r="50%">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                                <rect width="100" height="100" fill="url(#metroGlow)" />
                                {/* Grid lines */}
                                {[20, 40, 60, 80].map((pos) => (
                                    <React.Fragment key={pos}>
                                        <line x1={pos} y1="0" x2={pos} y2="100" stroke="#292524" strokeWidth="0.25" />
                                        <line x1="0" y1={pos} x2="100" y2={pos} stroke="#292524" strokeWidth="0.25" />
                                    </React.Fragment>
                                ))}
                                {/* Columbia River (OR / WA Border) */}
                                <path d="M 0 18 Q 35 28, 52 26 T 100 30" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeOpacity="0.45" />
                                <text x="10" y="15" fill="#38bdf8" fontSize="2.2" opacity="0.7" letterSpacing="0.2">COLUMBIA RIVER (WA / OR)</text>
                                {/* Willamette River */}
                                <path d="M 46 26 Q 51 45, 49 62 T 42 95" fill="none" stroke="#0284c7" strokeWidth="1.6" strokeOpacity="0.45" />
                                {/* I-5 & I-205 Corridors */}
                                <path d="M 52 5 L 50 42 L 45 62 L 42 95" fill="none" stroke="#57534e" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
                                <path d="M 54 15 Q 64 42, 62 62 T 44 74" fill="none" stroke="#57534e" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
                                {/* Dispatch Line from Closest Showroom Hub to Active City */}
                                <line
                                    x1={activeHubCoords.x}
                                    y1={activeHubCoords.y}
                                    x2={activeCity.mapCoords.x}
                                    y2={activeCity.mapCoords.y}
                                    stroke="#f59e0b"
                                    strokeWidth="0.8"
                                    strokeDasharray="2,1.5"
                                />
                            </svg>

                            {/* Interactive City Pins */}
                            {TIER_1_CITIES.map((city) => {
                                const isSelected = activeCity.slug === city.slug;
                                return (
                                    <button
                                        key={city.slug}
                                        onClick={() => setActiveCity(city)}
                                        onMouseEnter={() => setActiveCity(city)}
                                        style={{ left: `${city.mapCoords.x}%`, top: `${city.mapCoords.y}%` }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                                        aria-label={`Select ${city.name}`}
                                    >
                                        <span
                                            className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                                                city.isHub
                                                    ? 'w-5 h-5 bg-amber-400 text-stone-950 ring-4 ring-amber-400/30 font-bold text-[10px]'
                                                    : isSelected
                                                    ? 'w-4 h-4 bg-white ring-4 ring-amber-400/50'
                                                    : 'w-3 h-3 bg-stone-400 hover:bg-amber-300'
                                            }`}
                                        >
                                            {city.isHub ? '★' : ''}
                                        </span>
                                        <span
                                            className={`mt-1 block whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                                isSelected
                                                    ? 'bg-amber-400 text-stone-950 font-bold shadow-lg scale-105'
                                                    : city.isHub
                                                    ? 'bg-stone-900/95 text-amber-300 border border-amber-500/40'
                                                    : 'bg-stone-900/80 text-stone-300 group-hover:text-white'
                                            }`}
                                        >
                                            {city.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active City Detail Card (Below Map) */}
                        <div className="mt-6 bg-stone-950 border border-stone-800 rounded-xl p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                                        Dispatched via {activeCity.closestHub} ({activeCity.miles === '00' ? 'Showroom Hub' : `${activeCity.miles} mi · ${activeCity.driveTime}`})
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mt-0.5">
                                        {activeCity.name}, {activeCity.state} <span className="text-sm font-normal text-stone-400">· {activeCity.county}</span>
                                    </h3>
                                </div>
                                <Link
                                    href={`/service-areas/${activeCity.slug}`}
                                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition"
                                >
                                    {activeCity.name} Trade Details →
                                </Link>
                            </div>

                            <p className="text-stone-300 text-sm mt-3 leading-relaxed">
                                {activeCity.description}
                            </p>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-900 text-xs">
                                <div>
                                    <span className="text-stone-400 uppercase font-semibold block mb-1.5">Popular Sub-Market Specs:</span>
                                    <ul className="space-y-1 text-stone-200">
                                        {activeCity.popularSpecs.map((spec) => (
                                            <li key={spec} className="flex items-center gap-1.5">
                                                <span className="text-amber-400">▪</span> {spec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-stone-400 uppercase font-semibold block mb-1.5">Neighborhoods Covered:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {activeCity.neighborhoods.map((hood) => (
                                            <span key={hood} className="bg-stone-900 border border-stone-800 text-stone-300 px-2 py-0.5 rounded">
                                                {hood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Triple-SSS Style Mileage & City List (5 cols) */}
                    <aside className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-4 divide-y divide-stone-800/80">
                        {filteredCities.map((city) => {
                            const isSelected = activeCity.slug === city.slug;
                            return (
                                <div
                                    key={city.slug}
                                    onMouseEnter={() => setActiveCity(city)}
                                    onClick={() => setActiveCity(city)}
                                    className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer rounded-xl transition ${
                                        isSelected ? 'bg-stone-800/90 border-l-4 border-amber-400' : 'hover:bg-stone-950/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className={`w-14 text-center py-1.5 rounded-lg font-mono shrink-0 ${
                                            city.isHub ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-950 text-amber-400 border border-stone-800'
                                        }`}>
                                            <div className="text-sm font-bold leading-none">{city.miles}<small className="text-[10px] ml-0.5">mi</small></div>
                                            <div className="text-[9px] uppercase opacity-80 mt-0.5">{city.isHub ? 'HUB' : city.driveTime}</div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white truncate">{city.name}, {city.state}</span>
                                                <span className="text-[10px] bg-stone-950 text-stone-400 px-2 py-0.5 rounded border border-stone-800">
                                                    {city.closestHub.replace(' Showroom', '')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-400 truncate mt-0.5">{city.tagline}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/service-areas/${city.slug}`}
                                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold shrink-0 px-2 py-1"
                                    >
                                        View →
                                    </Link>
                                </div>
                            );
                        })}
                    </aside>
                </div>
            </section>

            {/* Tier 2 Outer Metro Coverage Grid */}
            <section className="max-w-7xl mx-auto px-6 mt-14">
                <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white">
                        Extended Valley, Gorge &amp; Clark County Measure Coverage
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 mb-5">
                        Scheduled on-site project estimates, multi-unit takeoffs, and showroom sample support for outer metro communities:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {TIER_2_TOWNS.map((town) => (
                            <div
                                key={town.slug}
                                className="bg-stone-950 border border-stone-800/90 rounded-xl p-3.5 flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-semibold text-sm text-white">{town.name}, {town.state}</div>
                                    <div className="text-xs text-stone-400">{town.county} · via {town.closestHub}</div>
                                </div>
                                <span className="text-xs font-mono text-amber-400 bg-stone-900 px-2.5 py-1 rounded border border-stone-800">
                                    {town.miles} mi
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}