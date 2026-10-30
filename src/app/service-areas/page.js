// src/app/service-areas/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    const [mapLoaded, setMapLoaded] = useState(false);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const mapSectionRef = useRef(null);

    const filteredCities = hubFilter === 'ALL'
        ? TIER_1_CITIES
        : TIER_1_CITIES.filter(c => c.closestHub.toLowerCase().includes(hubFilter.toLowerCase()));

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!document.getElementById('maplibre-gl-css')) {
            const link = document.createElement('link');
            link.id = 'maplibre-gl-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
            document.head.appendChild(link);
        }

        const initMap = () => {
            if (!window.maplibregl || !mapContainerRef.current || mapInstanceRef.current) return;

            const map = new window.maplibregl.Map({
                container: mapContainerRef.current,
                style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
                center: [-122.6706, 45.4550],
                zoom: 9.8,
                pitch: 46,
                bearing: -10,
                attributionControl: false
            });

            map.addControl(new window.maplibregl.NavigationControl({ showCompass: true }), 'top-right');

            map.on('load', () => {
                setMapLoaded(true);

                const features = TIER_1_CITIES.filter(c => !c.isHub).map((city) => {
                    const target = CITY_COORDS[city.slug];
                    const origin = city.closestHub.includes('Portland') && !city.closestHub.includes('Lake Oswego')
                        ? CITY_COORDS['portland-or']
                        : CITY_COORDS['lake-oswego-or'];
                    return {
                        type: 'Feature',
                        properties: { slug: city.slug },
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [origin.lng, origin.lat],
                                [target.lng, target.lat]
                            ]
                        }
                    };
                });

                map.addSource('dispatch-lines', {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features }
                });

                map.addLayer({
                    id: 'dispatch-lines-layer',
                    type: 'line',
                    source: 'dispatch-lines',
                    paint: {
                        'line-color': '#c5a059',
                        'line-width': 1.75,
                        'line-dasharray': [2, 2],
                        'line-opacity': 0.5
                    }
                });

                TIER_1_CITIES.forEach((city) => {
                    const c = CITY_COORDS[city.slug];
                    if (!c) return;

                    const el = document.createElement('button');
                    el.type = 'button';
                    el.className = 'f55-map-pin group focus:outline-none';
                    el.innerHTML = `
                        <div class="pin-Wrap flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer border ${
                            city.isHub
                                ? 'bg-gray-900 text-white border-[#c5a059] font-bold text-[10px]'
                                : 'bg-white/90 text-gray-800 border-gray-300 hover:border-[#c5a059] font-semibold text-[10px]'
                        }">
                            <span class="w-1.5 h-1.5 rounded-full shrink-0 ${city.isHub ? 'bg-[#c5a059]' : 'bg-gray-700'}"></span>
                            <span>${city.name}</span>
                        </div>
                    `;

                    el.addEventListener('click', () => {
                        setActiveCity(city);
                    });

                    const marker = new window.maplibregl.Marker({ element: el, anchor: 'center' })
                        .setLngLat([c.lng, c.lat])
                        .addTo(map);

                    markersRef.current[city.slug] = { marker, el, city };
                });
            });

            mapInstanceRef.current = map;
        };

        if (window.maplibregl) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
            script.async = true;
            script.onload = initMap;
            document.body.appendChild(script);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        const c = CITY_COORDS[activeCity.slug];
        if (map && c && mapLoaded) {
            map.flyTo({
                center: [c.lng, c.lat],
                zoom: activeCity.isHub ? 10.6 : 11.2,
                pitch: 48,
                bearing: -10,
                speed: 0.9,
                curve: 1.3,
                essential: true
            });
        }

        Object.entries(markersRef.current).forEach(([slug, { el, city }]) => {
            const pill = el.querySelector('.pin-Wrap');
            if (!pill) return;
            if (slug === activeCity.slug) {
                pill.className = 'pin-Wrap flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md transition-all duration-200 cursor-pointer border border-white bg-[#c5a059] text-white font-bold text-[11px] scale-105';
                el.style.zIndex = '40';
            } else if (city.isHub) {
                pill.className = 'pin-Wrap flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer border bg-gray-900 text-white border-[#c5a059] font-bold text-[10px]';
                el.style.zIndex = '25';
            } else {
                pill.className = 'pin-Wrap flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer border bg-white/90 text-gray-800 border-gray-300 hover:border-[#c5a059] font-semibold text-[10px]';
                el.style.zIndex = '10';
            }
        });
    }, [activeCity, mapLoaded]);

    const handleCitySelect = (city, shouldScrollOnMobile = false) => {
        setActiveCity(city);
        if (shouldScrollOnMobile && typeof window !== 'undefined' && window.innerWidth < 1024 && mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const zoomOutFullMetro = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
                center: [-122.6706, 45.4550],
                zoom: 9.6,
                pitch: 45,
                bearing: -10,
                speed: 1.0
            });
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
                        <span className="text-gray-500">Showrooms, Measures &amp; Installation</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                        <div className="lg:col-span-7">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-2">
                                Trade Supply · Vendor Will-Call · Installation by Request
                            </p>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                From Our Showrooms <br className="hidden sm:inline" />
                                <span className="text-[#c5a059]">To Your Jobsite.</span>
                            </h1>
                            <p className="mt-3 md:mt-4 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                                Anchored by our <strong className="text-gray-900">Portland</strong> and <strong className="text-gray-900">Lake Oswego (Oswego Village)</strong> sample showrooms, Floors 55 Pro provides contractors, builders, designers, and property managers with on-site project measuring, rapid <strong className="text-gray-900">will-call at our regional vendor partner warehouses</strong>, and <strong className="text-gray-900">professional flooring installation by request</strong>.
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
                                        <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                                        Sample &amp; Measure Hub
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

            {/* Interactive Tilted Map + Numbered Mileage List */}
            <section ref={mapSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-12 scroll-mt-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            Fifteen Towns, <span className="text-[#c5a059]">One Short Drive.</span>
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Select any town to fly to that sub-market and view our on-site measure dispatch, material specs, and installation options.
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
                    {/* Left Column: Tilted 3D Vector Map + Slim Bottom Pill Bar (7 cols) */}
                    <div className="lg:col-span-7 space-y-5 md:space-y-6 lg:sticky lg:top-6">
                        <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
                            {/* Top Map Bar */}
                            <div className="bg-gray-900 text-white px-4 py-2.5 sm:px-5 flex items-center justify-between gap-2 border-b border-gray-800">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                                    <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                                    <span>Portland &amp; SW Washington Measure &amp; Install Radius</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={zoomOutFullMetro}
                                    className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-white transition"
                                >
                                    Reset Full Metro View ↺
                                </button>
                            </div>

                            {/* Tilted Vector Map Canvas */}
                            <div className="relative w-full h-[380px] sm:h-[480px] md:h-[520px] bg-gray-100">
                                <div ref={mapContainerRef} className="w-full h-full" />

                                {!mapLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 text-sm font-semibold text-gray-600">
                                        Laying out the metro map…
                                    </div>
                                )}

                                {/* Slim, Non-Occluding Bottom HUD Bar */}
                                <div className="absolute bottom-3 left-3 right-3 bg-gray-900/90 backdrop-blur-md text-white rounded-xl px-3.5 py-2.5 shadow-lg z-20 flex flex-wrap items-center justify-between gap-3 border border-white/10">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="bg-[#c5a059] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shrink-0">
                                            {activeCity.isHub ? 'HUB' : `${activeCity.miles} mi`}
                                        </span>
                                        <div className="truncate">
                                            <span className="font-bold text-sm text-white">
                                                {activeCity.name}, {activeCity.state}
                                            </span>
                                            <span className="hidden sm:inline text-xs text-gray-300 ml-2">
                                                · {activeCity.isHub ? 'Sample Showroom & Measure Dispatch' : `${activeCity.driveTime} via ${activeCity.closestHub}`}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/service-areas/${activeCity.slug}`}
                                        className="bg-[#c5a059] hover:bg-[#b08d48] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition shrink-0"
                                    >
                                        {activeCity.name} Page →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Specs, Vendor Will-Call, Install Badge & Neighborhoods Card Below Map */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                    What We Supply &amp; Measure in {activeCity.name}, {activeCity.state}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className="text-[11px] font-semibold text-[#c5a059] bg-amber-50 px-2.5 py-1 rounded-md border border-[#c5a059]/30">
                                        Vendor Partner Will-Call
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                        Installation Available by Request
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                                {activeCity.description}
                            </p>

                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                                        Popular Sub-Market Specs
                                    </span>
                                    <ul className="space-y-1.5 text-sm text-gray-800 font-medium">
                                        {activeCity.popularSpecs.map((spec) => (
                                            <li key={spec} className="flex items-start gap-2">
                                                <span className="text-[#c5a059] font-bold">✔</span>
                                                <span>{spec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                                        Neighborhoods Covered
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {activeCity.neighborhoods.map((hood) => (
                                            <span
                                                key={hood}
                                                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200"
                                            >
                                                {hood}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ordered Mileage List (5 cols) */}
                    <aside className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-2 sm:p-3 shadow-sm">
                        <ol className="divide-y divide-gray-100">
                            {filteredCities.map((city) => {
                                const isSelected = activeCity.slug === city.slug;
                                return (
                                    <li key={city.slug}>
                                        <div
                                            onClick={() => handleCitySelect(city, true)}
                                            onMouseEnter={() => {
                                                if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                                                    setActiveCity(city);
                                                }
                                            }}
                                            className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer rounded-xl transition ${
                                                isSelected
                                                    ? 'bg-amber-50/80 border-l-4 border-[#c5a059]'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <b
                                                    className={`w-14 sm:w-16 text-center py-2 rounded-xl shrink-0 border block ${
                                                        city.isHub
                                                            ? 'bg-gray-900 text-white border-gray-900'
                                                            : isSelected
                                                            ? 'bg-[#c5a059] text-white border-[#c5a059]'
                                                            : 'bg-gray-50 text-gray-900 border-gray-200'
                                                    }`}
                                                >
                                                    <span className="text-base sm:text-lg font-extrabold leading-none block">
                                                        {city.miles}<small className="text-[11px] ml-0.5 font-normal">mi</small>
                                                    </span>
                                                    <span className="text-[9px] uppercase tracking-wider mt-0.5 block opacity-85 font-semibold">
                                                        {city.isHub ? 'HUB' : city.driveTime}
                                                    </span>
                                                </b>

                                                <span className="min-w-0 block">
                                                    <span className="flex flex-wrap items-center gap-1.5">
                                                        <span className="text-sm sm:text-base font-bold text-gray-900">
                                                            {city.name}
                                                        </span>
                                                        <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                            {city.closestHub.replace(' Showroom', '')}
                                                        </span>
                                                    </span>
                                                    <em className="text-xs sm:text-sm text-gray-600 not-italic block mt-0.5 line-clamp-1">
                                                        {city.tagline}
                                                    </em>
                                                </span>
                                            </div>

                                            <Link
                                                href={`/service-areas/${city.slug}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-gray-900 shrink-0 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
                                            >
                                                Page →
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>
                </div>
            </section>

            {/* SEO Power Section: All 3 Installation Angles for GCs, Property Managers & Designers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 md:mt-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-1">
                                Material-Only or Turnkey Installed Packages
                            </p>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Professional Flooring Installation (Available by Request)
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 self-start md:self-auto">
                            Residential · Multi-Family · Commercial TI
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <h4 className="font-bold text-base text-gray-900 mb-2">
                                1. Turnkey Trade Partner (GCs &amp; Builders)
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Need a complete material-and-labor package to keep your construction schedule moving? While many of our trade accounts use their own crews, we provide vetted residential and commercial flooring installation by request across the Portland and SW Washington metro.
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <h4 className="font-bold text-base text-gray-900 mb-2">
                                2. Overflow &amp; Schedule Relief (Property Mgmt)
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Crews booked out or tackling a tight multi-unit turnover? In addition to wholesale material supply and vendor partner will-call, Floors 55 Pro offers professional installation services by request—giving you reliable backup labor capacity whenever your timeline demands it.
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                            <h4 className="font-bold text-base text-gray-900 mb-2">
                                3. Full-Scope Execution (Designers &amp; Realtors)
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                From material specification at our Portland and Lake Oswego showrooms to final jobsite walkthrough, we can take the flooring scope completely off your plate. Ask your account rep to bundle certified installation into your quote alongside your wholesale material order.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Outer Metro Coverage Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-10">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm">
                    <div className="max-w-3xl mb-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-1">
                            Extended Valley, Gorge &amp; Clark County Coverage
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Outer Metro Project Takeoff &amp; Sample Coverage
                        </h3>
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