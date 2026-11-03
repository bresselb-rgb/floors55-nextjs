// src/app/programs/page.js
import React from "react";
import Link from "next/link";

const BASE_URL = "https://www.floors55pro.com";

export const metadata = {
  title: "Flooring Trade & Concierge Programs | Realtors, Builders & Property Managers",
  description:
    "Explore Floors 55 Pro specialized flooring programs in Portland and Lake Oswego: Realtor & Homeowner Concierge, Multi-Family Property Management, and Custom Builder Trade Accounts.",
  alternates: {
    canonical: `${BASE_URL}/programs`,
  },
  openGraph: {
    title: "Flooring Trade & Concierge Programs | Floors 55 Pro",
    description:
      "Dedicated flooring resources for Portland & Lake Oswego Realtors, Homebuyers/Sellers, Property Managers, and General Contractors.",
    url: `${BASE_URL}/programs`,
    type: "website",
  },
};

const PROGRAMS_LIST = [
  {
    slug: "realtors",
    badge: "Realtor & Client Concierge",
    title: "For Realtors, Home Sellers & Buyers",
    subtitle: "A streamlined client resource for pre-listing refreshes, buyer move-in upgrades, and escrow repair estimates.",
    highlights: [
      "Fast-track pre-listing carpet & waterproof LVP packages before market photos",
      "Private showroom consultations in Lake Oswego (Oswego Village) & Portland",
      "Rapid written flooring quotes for inspection & escrow credit negotiations",
      "Direct-to-homeowner billing & turnkey professional installation",
    ],
    cta: "Open Realtor & Client Resource",
  },
  {
    slug: "property-management",
    badge: "Multi-Family & Commercial",
    title: "For Property Managers & Maintenance Teams",
    subtitle: "Standardized unit-turnover stock, dye-lot consistency, and overflow installation crews across the Portland & SW Washington metro.",
    highlights: [
      "Heavily stocked 20-mil SPC waterproof LVP & apartment-turn carpet lines",
      "Standardized property specs so every unit turn matches seamlessly",
      "Rapid regional vendor partner warehouse will-call or jobsite delivery",
      "Backup unit-turn installation crews when in-house maintenance is booked",
    ],
    cta: "Explore Property Management Program",
  },
  {
    slug: "builders-remodelers",
    badge: "GCs, Custom Builders & Designers",
    title: "For Builders, Remodelers & Interior Designers",
    subtitle: "Protected wholesale pricing tiers, white-label client presentations, and on-site project takeoffs.",
    highlights: [
      "Protected B2B wholesale pricing on hardwood, LVP, porcelain tile & carpet",
      "White-label digital Client Selection Boards with your custom margin built in",
      "On-site field measures, blueprint takeoffs & 1-page architectural spec sheets",
      "Material-only will-call or full turnkey installation by vetted crews",
    ],
    cta: "Explore Builder & Remodeler Program",
  },
];

export default function ProgramsHubPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Programs", item: `${BASE_URL}/programs` },
    ],
  };

  return (
    <main className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="bg-gray-900 text-white py-16 px-4 border-b-4 border-[#c5a059]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#c5a059] mb-3">
            <Link href="/" className="hover:underline text-gray-400" style={{ textDecoration: "none" }}>Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span>Trade &amp; Client Programs</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Tailored Flooring Programs for Portland &amp; Lake Oswego Professionals
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed">
            Whether you are a Realtor sharing a trusted flooring resource with a buyer or seller, a Property Manager standardizing unit turnovers, or a Custom Builder sourcing wholesale materials, choose your dedicated portal below.
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PROGRAMS_LIST.map((p) => (
            <div
              key={p.slug}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col justify-between hover:border-[#c5a059] hover:shadow-xl transition-all"
            >
              <div>
                <span className="inline-block bg-gray-900 text-[#c5a059] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  {p.badge}
                </span>
                <h2 className="text-2xl font-black text-gray-900 mb-3 leading-snug">{p.title}</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{p.subtitle}</p>
                <ul className="space-y-3 mb-8 pl-0 list-none">
                  {p.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="text-[#c5a059] font-black mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/programs/${p.slug}`}
                className="w-full block text-center bg-black hover:bg-[#c5a059] text-white hover:text-black font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-colors"
                style={{ textDecoration: "none" }}
              >
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}