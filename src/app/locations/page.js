// src/app/locations/page.js
import React from 'react';
import Link from 'next/link';
import { TIER_1_CITIES } from '@/lib/serviceAreasData';

export const metadata = {
    title: 'Portland & Lake Oswego Trade Showrooms | Floors 55 Pro',
    description: 'Visit our Portland (1320 SE Water Ave) and Lake Oswego (Oswego Village) trade showrooms for client sample consultations, on-site project measures, and wholesale flooring support.',
    alternates: {
        canonical: 'https://floors55pro.com/locations'
    }
};

export default function LocationsPage() {
    // JSON-LD Schema explicitly linking floors55pro.com as the B2B Trade Division of floors55.com
    const locationsJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://floors55pro.com/#organization',
        name: 'Floors 55 Pro',
        url: 'https://floors55pro.com',
        description: 'Wholesale & commercial flooring trade division serving contractors, builders, designers, and property managers in the Portland & SW Washington metro.',
        parentOrganization: {
            '@type': 'HomeAndConstructionBusiness',
            name: 'Floors 55 Abbey Carpet & Floor',
            url: 'https://www.floors55.com'
        },
        department: [
            {
                '@type': 'WholesaleStore',
                name: 'Floors 55 Pro — Portland Trade & Sample Showroom',
                telephone: '+1-503-491-1776',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '1320 SE Water Ave',
                    addressLocality: 'Portland',
                    addressRegion: 'OR',
                    postalCode: '97214',
                    addressCountry: 'US'
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: 45.5135,
                    longitude: -122.6635
                },
                openingHoursSpecification: [
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        opens: '08:30',
                        closes: '16:30'
                    }
                ]
            },
            {
                '@type': 'WholesaleStore',
                name: 'Floors 55 Pro — Lake Oswego Trade Showroom (Oswego Village)',
                telephone: '+1-503-673-1333',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '25 S State St Ste 2110',
                    addressLocality: 'Lake Oswego',
                    addressRegion: 'OR',
                    postalCode: '97034',
                    addressCountry: 'US'
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: 45.4207,
                    longitude: -122.6706
                },
                openingHoursSpecification: [
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                        opens: '08:30',
                        closes: '16:30'
                    }
                ]
            }
        ]
    };

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(locationsJsonLd) }}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-12 md:py-16 px-4 sm:px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-2">
                        White-Label Client Selection &amp; Measure Dispatch
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900">
                        Our Trade &amp; Sample Showrooms
                    </h1>
                    <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Visit us in person or send your clients in to view full-size{' '}
                        <Link href="/category/hardwood" className="text-[#c5a059] font-semibold hover:underline">hardwood</Link>,{' '}
                        <Link href="/category/luxury-vinyl" className="text-[#c5a059] font-semibold hover:underline">luxury vinyl</Link>,{' '}
                        <Link href="/category/tile" className="text-[#c5a059] font-semibold hover:underline">porcelain tile</Link>, and{' '}
                        <Link href="/category/carpet" className="text-[#c5a059] font-semibold hover:underline">designer carpet</Link>{' '}
                        samples while your trade pricing and margins remain protected.
                    </p>
                </div>
            </header>

            {/* Two Primary Showroom Cards */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 md:mt-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* Portland Showroom */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#c5a059]/40 text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                                <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                                Central Eastside · Measure &amp; Sample Hub
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Portland Showroom
                            </h2>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                Serving central city remodelers, multi-family property managers, East County contractors, and Southwest Washington builders.
                            </p>

                            <div className="mt-6 space-y-3.5 text-sm sm:text-base text-gray-800 border-t border-gray-100 pt-5">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#c5a059] font-bold">🏢</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">1320 SE Water Ave</p>
                                        <p className="text-gray-600">Portland, OR 97214</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#c5a059] font-bold">📞</span>
                                    <a href="tel:5034911776" className="font-semibold text-gray-900 hover:text-[#c5a059] transition">
                                        (503) 491-1776
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#c5a059] font-bold">🕒</span>
                                    <p className="text-gray-700">Mon–Fri: 8:30 AM – 4:30 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=1320+SE+Water+Ave,+Portland,+OR+97214"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center bg-gray-900 hover:bg-[#c5a059] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition"
                            >
                                Get Directions
                            </a>
                            <Link
                                href="/service-areas/portland-or"
                                className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-gray-900 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
                            >
                                Portland Trade Specs →
                            </Link>
                        </div>
                    </div>

                    {/* Lake Oswego Showroom */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-amber-50 border border-[#c5a059]/40 text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                                <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                                Oswego Village · South Metro Headquarters
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Lake Oswego Showroom
                            </h2>
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                Our flagship client selection center for custom home builders, designers, and remodelers across the South Metro, West Hills, and Hwy 217 corridor.
                            </p>

                            <div className="mt-6 space-y-3.5 text-sm sm:text-base text-gray-800 border-t border-gray-100 pt-5">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#c5a059] font-bold">🏢</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">25 S State St Ste 2110</p>
                                        <p className="text-gray-600">Lake Oswego, OR 97034</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#c5a059] font-bold">📞</span>
                                    <a href="tel:5036731333" className="font-semibold text-gray-900 hover:text-[#c5a059] transition">
                                        (503) 673-1333
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#c5a059] font-bold">🕒</span>
                                    <p className="text-gray-700">Mon–Thu: 8:30 AM – 4:30 PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=25+S+State+St+Ste+2110,+Lake+Oswego,+OR+97034"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center bg-gray-900 hover:bg-[#c5a059] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition"
                            >
                                Get Directions
                            </a>
                            <Link
                                href="/service-areas/lake-oswego-or"
                                className="text-xs font-bold uppercase tracking-wider text-[#c5a059] hover:text-gray-900 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
                            >
                                Lake Oswego Specs →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vendor Partner Will-Call & Installation Note */}
                <div className="mt-6 bg-amber-50/70 border border-[#c5a059]/40 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                            Trade Logistics &amp; Turnkey Support
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                            Vendor Partner Will-Call &amp; Installation by Request
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                            While our Portland and Lake Oswego showrooms handle sample selections and on-site measure dispatch, bulk material orders are staged for rapid <strong>will-call pickup at our regional vendor partner warehouses</strong>. Need labor support? We also offer <strong>professional installation by request</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bridge to Interactive /service-areas Map & 15 City Pages */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 md:mt-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#c5a059] mb-1">
                                On-Site Project Measures &amp; Trade Coverage
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Working on a Jobsite Outside Portland or Lake Oswego?
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                We dispatch from both showrooms across 15+ surrounding Tri-County and Clark County cities for field measurements, takeoffs, and turnkey installations.
                            </p>
                        </div>
                        <Link
                            href="/service-areas"
                            className="bg-[#c5a059] hover:bg-[#b08d48] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition shrink-0 text-center"
                        >
                            Open Interactive Metro Map →
                        </Link>
                    </div>

                    <div className="mt-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                            Direct City Trade Pages:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {TIER_1_CITIES.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/service-areas/${city.slug}`}
                                    className="bg-gray-50 hover:bg-gray-900 text-gray-800 hover:text-white border border-gray-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                                >
                                    {city.name}, {city.state} ({city.isHub ? 'Hub' : `${city.miles} mi`})
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Need Samples CTA */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 md:mt-12">
                <div className="bg-gray-900 text-white rounded-2xl p-8 sm:p-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold">
                        Need Samples Delivered to the Jobsite?
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                        We can ship physical samples of hardwood, luxury vinyl, laminate, tile, or carpet directly to your firm or active project site so you can close bids faster.
                    </p>
                    <Link
                        href="/order-sample"
                        className="inline-block mt-6 bg-[#c5a059] hover:bg-[#b08d48] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition"
                    >
                        Order Physical Samples
                    </Link>
                </div>
            </section>
        </main>
    );
}