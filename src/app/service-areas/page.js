// src/app/service-areas/page.js
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { TIER_1_CITIES, TIER_2_TOWNS, SHOWROOM_HUBS } from '@/lib/serviceAreasData';

const CITY_COORDS = {
    'lake-oswego-or': { lat: 45.4207, lng: -122.6706 },
    'portland-or': { lat: 45.5152, lng: -122.6784 },
    'west-linn-or': { lat: 45.3657, lng: -122.6123 },
    'tigard-or': { lat: 45.4312, lng: -122.7715 },
    'tualatin-or': { lat: 45.3840, lng: -122.7639 },
    'milwaukie-or': { lat: 45.4462, lng: -122.6393 },
    'beaverton-or': { lat: 45.4871, lng: -122.8037 },
    'vancouver-wa': { lat: 45.6280, lng: -122.6739 },
    'oregon-city-or': { lat: 45.3573, lng: -122.6068 },
    'happy-valley-or': { lat: 45.4451, lng: -122.5315 },
    'sherwood-or': { lat: 45.3565, lng: -122.8401 },
    'wilsonville-or': { lat: 45.3001, lng: -122.7726 },
    'gresham-or': { lat: 45.4982, lng: -122.4315 },
    'hillsboro-or': { lat: 45.5229, lng: -122.9898 },
    'camas-wa': { lat: 45.5871, lng: -122.3995 }
};

export default function ServiceAreasPage() {
    const [activeCity, setActiveCity] = useState(TIER_1_CITIES[0]);
    const [hubFilter, setHubFilter] = useState('ALL');
    const mapSectionRef = useRef(null);

    const filteredCities = hubFilter === 'ALL'
        ? TIER_1_CITIES
        : TIER_1_CITIES.filter(c => c.closestHub.toLowerCase().includes(hubFilter.toLowerCase()));

    const coords = CITY_COORDS[activeCity.slug] || { lat: 45.4650, lng: -122.6750 };
    const bbox = `${coords.lng - 0.14}%2C${coords.lat - 0.09}%2C${coords.lng + 0.14}%2C${coords.lat + 0.09}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

    const handleCitySelect = (city, shouldScrollOnMobile = false) => {
        setActiveCity(city);
        if (shouldScrollOnMobile && typeof window !== 'undefined' && window.innerWidth < 1024 && mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 pb-20 md:pb-24">
            {/* Hero Header */}
            <header className="bg-white border-b border-gray-200 py-10 md:py-14 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="text-xs font-semibold uppercase tracking-widest text-[#c5a059] mb-3 flex items-center gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-500">Showrooms &amp; On-Site Measure Radius</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                        <div className="lg:col-span-7">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-2">
                                Portland &amp; Lake Oswego Trade Coverage
                            </p>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                Two Metro Showrooms. <br className="hidden sm:inline" />
                                <span className="text-[#c5a059]">On-Site Jobsite Measures.</span>
                            </h1>
                            <p className="mt-3 md:mt-4 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                                Anchored by our <strong className="text-gray-900">Portland</strong> and <strong className="text-gray-900">Lake Oswego (Oswego Village)</strong> showrooms, Floors 55 Pro supports general contractors, custom builders, and property managers across the metro with on-site measuring, waste-factor verification, and white-label client showroom consultations.
                            </p>
                        </div>

                        {/* Dual Showroom Hub Cards */}
                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            {SHOWROOM_HUBS.map((hub) => (
                                <div
                                    key={hub.id}
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm"
                                >
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
                                        Showroom Hub
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{hub.name}</h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{hub.location}</p>
                                    <p className="text-xs text-gray-500 mt-2.5 pt-2.5 border-t border-gray-200 leading-relaxed">
                                        {hub.coverage}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Interactive Section */}
            <section ref={mapSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-12 scroll-mt-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            15 Metro Service Areas · One Short Drive
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Tap any city to view its map location, closest showroom hub, and local flooring specs.
                        </p>
                    </div>

                    {/* Hub Filter Buttons */}
                    <div className="grid grid-cols-3 sm:inline-flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm text-xs sm:text-sm w-full sm:w-auto">
                        {['ALL', 'Portland', 'Lake Oswego'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setHubFilter(tab)}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-center ${
                                    hubFilter === tab
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab === 'ALL' ? 'All (15)' : `${tab}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Left Column: Map + Active City Info Card (7 cols) */}
                    <div className="lg:col-span-7 space-y-5 md:space-y-6 lg:sticky lg:top-6">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gray-900 text-white p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#c5a059] block">
                                        Active Measure Zone · Dispatched via {activeCity.closestHub}
                                    </span>
                                    <h3 className="text-lg sm:text-xl font-bold mt-0.5">
                                        {activeCity.name}, {activeCity.state} ({activeCity.isHub ? 'Showroom Hub' : `${activeCity.miles} mi · ${activeCity.driveTime}`})
                                    </h3>
                                </div>
                                <Link
                                    href={`/service-areas/${activeCity.slug}`}
                                    className="w-full sm:w-auto text-center bg-[#c5a059] hover:bg-[#b08d48] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition shrink-0"
                                >
                                    Open {activeCity.name} Page →
                                </Link>
                            </div>

                            <div className="relative w-full h-[250px] sm:h-[340px] md:h-[380px] bg-gray-100">
                                <iframe
                                    title={`Map of ${activeCity.name}, ${activeCity.state}`}
                                    src={mapUrl}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                />
                            </div>

                            <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex overflow-x-auto lg:flex-wrap gap-1.5">
                                {TIER_1_CITIES.map((city) => (
                                    <button
                                        key={city.slug}
                                        onClick={() => handleCitySelect(city, false)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border whitespace-nowrap shrink-0 ${
                                            activeCity.slug === city.slug
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#c5a059]'
                                        }`}
                                    >
                                        {city.isHub ? `★ ${city.name}` : city.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                                        {activeCity.county} · {activeCity.closestHub}
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                        {activeCity.name}, {activeCity.state} Trade &amp; Measure Coverage
                                    </h3>
                                </div>
                                <Link
                                    href={`/service-areas/${activeCity.slug}`}
                                    className="text-sm font-bold text-[#c5a059] hover:underline shrink-0"
                                >
                                    View Full {activeCity.name} Details →
                                </Link>
                            </div>

                            <p className="text-gray-700 text-sm sm:text-base mt-4 leading-relaxed">
                                {activeCity.description}
                            </p>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-gray-100">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Popular Specs in {activeCity.name}
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-800 font-medium">
                                        {activeCity.popularSpecs.map((spec) => (
                                            <li key={spec} className="flex items-start gap-2">
                                                <span className="text-[#c5a059] font-bold">✔</span>
                                                <span>{spec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Neighborhoods We Measure
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {activeCity.neighborhoods.map((hood) => (
                                            <span
                                                key={hood}
                                                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200"
                                            >
                                                {hood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: City Directory List (5 cols) */}
                    <aside className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-2 sm:p-4 shadow-sm divide-y divide-gray-100">
                        {filteredCities.map((city) => {
                            const isSelected = activeCity.slug === city.slug;
                            return (
                                <div
                                    key={city.slug}
                                    onClick={() => handleCitySelect(city, true)}
                                    className={`p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer rounded-xl transition ${
                                        isSelected
                                            ? 'bg-amber-50/70 border-l-4 border-[#c5a059]'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div
                                            className={`w-14 sm:w-16 text-center py-2 rounded-xl shrink-0 border ${
                                                city.isHub
                                                    ? 'bg-gray-900 text-white border-gray-900 font-bold'
                                                    : isSelected
                                                    ? 'bg-[#c5a059] text-white border-[#c5a059] font-bold'
                                                    : 'bg-gray-50 text-gray-900 border-gray-200'
                                            }`}
                                        >
                                            <div className="text-sm sm:text-base font-bold leading-none">
                                                {city.miles}<small className="text-[11px] ml-0.5 font-normal">mi</small>
                                            </div>
                                            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider mt-1 opacity-90">
                                                {city.isHub ? 'HUB' : city.driveTime}
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                <span className="text-sm sm:text-base font-bold text-gray-900">
                                                    {city.name}, {city.state}
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                                                    {city.closestHub.replace(' Showroom', '')}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                                                {city.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/service-areas/${city.slug}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-gray-900 shrink-0 px-2.5 py-2 sm:px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
                                    >
                                        Page →
                                    </Link>
                                </div>
                            );
                        })}
                    </aside>
                </div>
            </section>

            {/* Tier 2 Outer Metro Coverage Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 md:mt-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">
                    <div className="max-w-3xl mb-5 sm:mb-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-1">
                            Regional Project Support
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Extended Valley, Gorge &amp; Clark County Coverage
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Working on a larger residential build or multi-unit project further out? We coordinate scheduled on-site takeoffs and showroom sample packages across these outer metro communities:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {TIER_2_TOWNS.map((town) => (
                            <div
                                key={town.slug}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between hover:border-[#c5a059] transition"
                            >
                                <div>
                                    <div className="font-bold text-sm sm:text-base text-gray-900">{town.name}, {town.state}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{town.county} · via {town.closestHub}</div>
                                </div>
                                <span className="text-xs font-bold text-gray-800 bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 shadow-sm shrink-0">
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