// src/app/service-areas/page.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TIER_1_CITIES, TIER_2_TOWNS, SHOWROOM_HUBS } from '@/lib/serviceAreasData';

// Real lat/lng coordinates for the interactive map iframe & links
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

    const filteredCities = hubFilter === 'ALL'
        ? TIER_1_CITIES
        : TIER_1_CITIES.filter(c => c.closestHub.toLowerCase().includes(hubFilter.toLowerCase()));

    const coords = CITY_COORDS[activeCity.slug] || { lat: 45.4650, lng: -122.6750 };
    const bbox = `${coords.lng - 0.14}%2C${coords.lat - 0.09}%2C${coords.lng + 0.14}%2C${coords.lat + 0.09}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 pb-24">
            {/* Hero Header — Matches Floors 55 Pro Aesthetic */}
            <header className="bg-white border-b border-gray-200 py-14 px-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="text-xs font-semibold uppercase tracking-widest text-[#c5a059] mb-3 flex items-center gap-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-500">Showrooms &amp; On-Site Measure Radius</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-2">
                                Portland &amp; Lake Oswego Trade Coverage
                            </p>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                Two Metro Showrooms. <br className="hidden sm:inline" />
                                <span className="text-[#c5a059]">Precision On-Site Measures.</span>
                            </h1>
                            <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl">
                                Anchored by our <strong className="text-gray-900">Portland</strong> and <strong className="text-gray-900">Lake Oswego (Oswego Village)</strong> showrooms, Floors 55 Pro supports general contractors, custom builders, and property managers across the metro with on-site laser measuring, waste-factor verification, and white-label client showroom consultations.
                            </p>
                        </div>

                        {/* Dual Showroom Hub Cards */}
                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {SHOWROOM_HUBS.map((hub) => (
                                <div
                                    key={hub.id}
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
                                        Showroom Hub
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">{hub.name}</h2>
                                    <p className="text-sm text-gray-600 mt-1">{hub.location}</p>
                                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200 leading-relaxed">
                                        {hub.coverage}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Interactive Section */}
            <section className="max-w-7xl mx-auto px-6 mt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            15 Metro Service Areas · One Short Drive
                        </h2>
                        <p className="text-base text-gray-600 mt-1">
                            Select any city on the right to view its map location, closest showroom hub, and local flooring specs.
                        </p>
                    </div>

                    {/* Hub Filter Buttons */}
                    <div className="inline-flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm text-sm">
                        {['ALL', 'Portland', 'Lake Oswego'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setHubFilter(tab)}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${
                                    hubFilter === tab
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab === 'ALL' ? 'All Metro (15)' : `${tab} Hub`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Real Daytime Map + Active City Info Card (7 cols) */}
                    <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-6">
                        {/* Real Map Container */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-gray-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] block">
                                        Active Measure Zone · Dispatched via {activeCity.closestHub}
                                    </span>
                                    <h3 className="text-xl font-bold">
                                        {activeCity.name}, {activeCity.state} ({activeCity.isHub ? 'Showroom Hub' : `${activeCity.miles} mi · ${activeCity.driveTime}`})
                                    </h3>
                                </div>
                                <Link
                                    href={`/service-areas/${activeCity.slug}`}
                                    className="bg-[#c5a059] hover:bg-[#b08d48] text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition"
                                >
                                    Open {activeCity.name} Page →
                                </Link>
                            </div>

                            <div className="relative w-full h-[380px] bg-gray-100">
                                <iframe
                                    title={`Map of ${activeCity.name}, ${activeCity.state}`}
                                    src={mapUrl}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                />
                            </div>

                            {/* Quick City Pills Underneath Map */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-1.5">
                                {TIER_1_CITIES.map((city) => (
                                    <button
                                        key={city.slug}
                                        onClick={() => setActiveCity(city)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
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

                        {/* Readable Active City Details Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                                        {activeCity.county} · {activeCity.closestHub}
                                    </span>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {activeCity.name}, {activeCity.state} Trade &amp; Measure Coverage
                                    </h3>
                                </div>
                                <Link
                                    href={`/service-areas/${activeCity.slug}`}
                                    className="text-sm font-bold text-[#c5a059] hover:underline"
                                >
                                    View Full {activeCity.name} Details →
                                </Link>
                            </div>

                            <p className="text-gray-700 text-base mt-4 leading-relaxed">
                                {activeCity.description}
                            </p>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
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
                                    <div className="flex flex-wrap gap-2">
                                        {activeCity.neighborhoods.map((hood) => (
                                            <span
                                                key={hood}
                                                className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200"
                                            >
                                                {hood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Clean, High-Contrast City Directory List (5 cols) */}
                    <aside className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm divide-y divide-gray-100">
                        {filteredCities.map((city) => {
                            const isSelected = activeCity.slug === city.slug;
                            return (
                                <div
                                    key={city.slug}
                                    onClick={() => setActiveCity(city)}
                                    className={`p-4 flex items-center justify-between gap-4 cursor-pointer rounded-xl transition ${
                                        isSelected
                                            ? 'bg-amber-50/70 border-l-4 border-[#c5a059]'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Mileage Badge */}
                                        <div
                                            className={`w-16 text-center py-2 rounded-xl shrink-0 border ${
                                                city.isHub
                                                    ? 'bg-gray-900 text-white border-gray-900 font-bold'
                                                    : isSelected
                                                    ? 'bg-[#c5a059] text-white border-[#c5a059] font-bold'
                                                    : 'bg-gray-50 text-gray-900 border-gray-200'
                                            }`}
                                        >
                                            <div className="text-base font-bold leading-none">
                                                {city.miles}<small className="text-xs ml-0.5 font-normal">mi</small>
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider mt-1 opacity-90">
                                                {city.isHub ? 'HUB' : city.driveTime}
                                            </div>
                                        </div>

                                        {/* City Name & Tagline */}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-base font-bold text-gray-900">
                                                    {city.name}, {city.state}
                                                </span>
                                                <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                                                    {city.closestHub.replace(' Showroom', '')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                                                {city.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/service-areas/${city.slug}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-gray-900 shrink-0 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
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
            <section className="max-w-7xl mx-auto px-6 mt-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                    <div className="max-w-3xl mb-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-1">
                            Regional Project Support
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Extended Valley, Gorge &amp; Clark County Coverage
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Working on a larger residential build or multi-unit project further out? We coordinate scheduled takeoffs and showroom sample packages across these outer metro communities:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {TIER_2_TOWNS.map((town) => (
                            <div
                                key={town.slug}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-[#c5a059] transition"
                            >
                                <div>
                                    <div className="font-bold text-base text-gray-900">{town.name}, {town.state}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{town.county} · via {town.closestHub}</div>
                                </div>
                                <span className="text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
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