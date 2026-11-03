// src/app/programs/[slug]/page.js
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth, appId } from "../../../lib/firebase";
import ProgramShareButton from "../../../components/ProgramShareButton";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.floors55pro.com";

const PROGRAM_DATA = {
  realtors: {
    slug: "realtors",
    isClientFacingResource: true,
    metaTitle: "Realtor & Homeowner Flooring Concierge | Pre-Listing & Move-In | Portland & Lake Oswego",
    metaDesc:
      "A streamlined flooring resource for Portland & Lake Oswego Realtors and their buyers or sellers. Fast pre-listing carpet & LVP refreshes, escrow repair estimates, and turnkey installation.",
    heroBadge: "Realtor & Homeowner Flooring Concierge",
    heroTitle: "Fast, Turnkey Flooring for Home Sellers, Buyers & Real Estate Agents",
    heroSubtitle:
      "Whether you are preparing a home to hit the market, customizing a newly purchased home before move-in, or requesting a written flooring estimate during inspection negotiations, Floors 55 handles the entire process—from on-site measure to professional installation.",
    shareButtonLabel: "Share This Resource with Your Client",
    shareMessage:
      "Here is our trusted local flooring partner, Floors 55 (Lake Oswego & Portland). You can browse their most popular pre-listing and move-in flooring collections or schedule a free on-site measure right here:",
    primaryCtaText: "Schedule a Free Measure or Estimate",
    primaryCtaHref: "/quote?program=Realtor+Concierge+Request",
    secondaryCtaText: "Browse Popular Flooring Styles",
    secondaryCtaHref: "/category",
    pillarsTitle: "How We Support Homeowners & Real Estate Timelines",
    pillars: [
      {
        icon: "🏡",
        tag: "For Home Sellers",
        title: "Pre-Listing Market Refresh",
        desc: "New flooring is one of the highest-ROI upgrades before listing photos. We stock neutral designer carpets and 100% waterproof Luxury Vinyl Plank (LVP) ready for rapid installation so your listing hits the market on schedule.",
        bullets: [
          "In-stock neutral tones curated to appeal to Pacific Northwest buyers",
          "Fast-track scheduling coordinated around staging and photography dates",
          "Complete tear-out, subfloor prep, furniture handling, and trim transitions",
        ],
      },
      {
        icon: "🔑",
        tag: "For Home Buyers",
        title: "Post-Close & Pre-Move-In Upgrades",
        desc: "Want new hardwood, LVP, tile, or plush carpet installed right after closing—before the moving truck arrives? Meet with our showroom specialists in Lake Oswego or Portland to finalize selections in advance.",
        bullets: [
          "Select samples early so materials are staged and ready for closing day",
          "Private showroom consultations at Oswego Village (Lake Oswego) or SE Water Ave (Portland)",
          "Take home large physical samples to test in your new home's natural light",
        ],
      },
      {
        icon: "📋",
        tag: "For Agents in Escrow",
        title: "Inspection & Repair Credit Estimates",
        desc: "Need an accurate, itemized replacement quote during inspection contingency to negotiate a buyer/seller repair credit? We dispatch quickly and deliver clear, formal written estimates.",
        bullets: [
          "Fast turnaround on formal written material-and-labor replacement quotes",
          "Clear room-by-room square footage and transition breakdowns",
          "Direct homeowner billing—agents never have to manage invoices or payments",
        ],
      },
    ],
    stepsTitle: "Simple 4-Step Process for Buyers & Sellers",
    steps: [
      {
        step: "1",
        title: "Browse Online or Visit a Showroom",
        desc: "Explore curated waterproof LVP, European White Oak hardwood, porcelain tile, and plush carpet online—or visit our Lake Oswego or Portland showrooms.",
      },
      {
        step: "2",
        title: "Free On-Site Laser Measure",
        desc: "We visit the property to take exact room measurements, check subfloor transitions, and bring physical samples directly to the home.",
      },
      {
        step: "3",
        title: "Clear Turnkey Quote (Direct to Client)",
        desc: "The homeowner receives a transparent, all-inclusive quote covering materials, pad/underlayment, tear-out, and guaranteed installation.",
      },
      {
        step: "4",
        title: "Deadline-Driven Installation",
        desc: "Our vetted local installation teams complete the project on time for listing photos, open houses, or move-in day.",
      },
    ],
    collectionsTitle: "Quick-Links: Most Requested Real Estate Flooring Collections",
    collections: [
      {
        name: "Waterproof Luxury Vinyl Plank (LVP)",
        tag: "Top Choice for Main Living & Rentals",
        desc: "100% waterproof, pet-friendly wood visuals with attached acoustical pad—ideal for kitchens, living rooms, and basements.",
        href: "/category/luxury-vinyl",
      },
      {
        name: "Pre-Listing & Plush Residential Carpet",
        tag: "Fastest ROI for Bedrooms & Stairs",
        desc: "Soft, stain-resistant designer carpets that instantly freshen bedrooms, bonus rooms, and staircases before listing.",
        href: "/category/carpet",
      },
      {
        name: "Engineered Hardwood",
        tag: "Luxury Custom Home Appeal",
        desc: "Wide-plank European White Oak and Pacific Northwest engineered wood built for dimensional stability.",
        href: "/category/hardwood",
      },
      {
        name: "Porcelain Tile & Waterproof Laminate",
        tag: "Baths, Entries & High-Traffic",
        desc: "Large-format bathroom/entry porcelain tile and scratch-resistant waterproof laminate.",
        href: "/category/tile",
      },
    ],
    faqs: [
      {
        q: "Does the Realtor or the homeowner pay for the flooring project?",
        a: "The homeowner (buyer or seller) contracts and pays Floors 55 directly. Realtors simply share this page or connect us with their client, and our showroom team handles all measurements, sample selections, billing, and installation scheduling directly with the client.",
      },
      {
        q: "How fast can you measure and install for an upcoming listing?",
        a: "We prioritize pre-listing and move-in timelines across Portland, Lake Oswego, West Linn, Beaverton, Tigard, and Vancouver WA. On-site measures are typically completed within 24–48 hours, with stocked carpet and waterproof LVP lines ready for rapid installation.",
      },
      {
        q: "Can a buyer pick out their flooring before their home closes?",
        a: "Yes! Buyers frequently visit our Lake Oswego (Oswego Village) or Portland (SE Water Ave) showrooms while in escrow so their materials are ordered, staged, and ready to install the moment keys are handed over.",
      },
      {
        q: "Can you provide a written estimate for an inspection repair addendum?",
        a: "Absolutely. Contact us with the property address and scope of damaged flooring, and we will provide a clean, itemized material-and-labor estimate for your escrow negotiations.",
      },
    ],
  },

  "property-management": {
    slug: "property-management",
    isClientFacingResource: false,
    metaTitle: "Multi-Family & Property Management Flooring Supplier | Portland & SW Washington",
    metaDesc:
      "Wholesale unit-turnover LVP and commercial carpet for Portland, Beaverton, Hillsboro & Vancouver WA property managers. Standardized dye-lots, fast will-call & turn crews.",
    heroBadge: "Multi-Family & Commercial Property Management",
    heroTitle: "Standardized Unit-Turnover Flooring & Rapid Will-Call for Property Managers",
    heroSubtitle:
      "Keep apartment vacancies short and maintenance budgets predictable. Floors 55 Pro supplies multi-family portfolios, HOAs, and single-family rental managers across Portland and SW Washington with heavily stocked waterproof LVP, turnover carpet, and on-demand installation crews.",
    shareButtonLabel: "Share Program with Maintenance / Asset Team",
    shareMessage:
      "Check out Floors 55 Pro's Multi-Family & Property Management flooring program for unit turnovers in Portland & SW Washington:",
    primaryCtaText: "Request Property Management Pricing",
    primaryCtaHref: "/quote?program=Property+Management+Account",
    secondaryCtaText: "View Prop Mgt Stock Catalog",
    secondaryCtaHref: "/category?program=propmgt",
    pillarsTitle: "Built for High-Velocity Multi-Family Operations",
    pillars: [
      {
        icon: "🏢",
        tag: "Standardized Specs",
        title: "Locked-In Property SKUs & Dye Lots",
        desc: "Stop mismatching planks between unit turns. We lock in standardized 20-mil SPC Luxury Vinyl Plank and solution-dyed carpet specs for each property in your portfolio.",
        bullets: [
          "Consistent plank locking systems for easy partial-room plank replacements",
          "IIC / STC acoustical underlayment ratings compliant with multi-family HOAs",
          "Dedicated account tracking by property name and unit number",
        ],
      },
      {
        icon: "🚚",
        tag: "Rapid Logistics",
        title: "Fast Regional Warehouse Will-Call",
        desc: "When a tenant moves out on the 30th and the new lease starts on the 5th, you cannot wait three weeks for freight. Our core turnover lines are staged for immediate regional will-call or jobsite delivery.",
        bullets: [
          "Fast pickup via regional vendor partner warehouses or Portland/Lake Oswego hubs",
          "Matching transitions, reducers, stair noses, and adhesives stocked alongside",
          "Pallet and multi-unit volume pricing tiers",
        ],
      },
      {
        icon: "🛠️",
        tag: "Flexible Labor",
        title: "Material-Only or Overflow Turn Crews",
        desc: "Have your own in-house maintenance techs install LVP, or call in our vetted multi-family installation crews when unit turns stack up at the end of the month.",
        bullets: [
          "Buy wholesale material-only whenever your maintenance team handles install",
          "Request turnkey tear-out and installation on tight unit-turn deadlines",
          "On-site laser measures to build reusable unit-type floorplan templates",
        ],
      },
    ],
    stepsTitle: "How to Onboard Your Property Portfolio",
    steps: [
      {
        step: "1",
        title: "Select Your Standard Property SKUs",
        desc: "Browse our Prop Mgt catalog filter or request a sample box of our top 20-mil SPC LVP and solution-dyed unit-turn carpets.",
      },
      {
        step: "2",
        title: "Lock In Wholesale Portfolio Pricing",
        desc: "We assign protected wholesale carton and roll pricing to your management company across all properties.",
      },
      {
        step: "3",
        title: "Map Out Reusable Unit Templates",
        desc: "We measure your 1BR, 2BR, and 3BR layouts once so future unit orders take a single text or email.",
      },
      {
        step: "4",
        title: "Will-Call Pickup or Turnkey Install",
        desc: "Pick up materials same/next-day for your techs, or dispatch our install crews for complete unit turnovers.",
      },
    ],
    collectionsTitle: "Core Multi-Family & Turnover Categories",
    collections: [
      {
        name: "Prop Mgt Selected Turnover Catalog",
        tag: "Filtered for Multi-Family Durability",
        desc: "View all products tagged specifically for multi-family unit turnovers and commercial durability.",
        href: "/category?program=propmgt",
      },
      {
        name: "20-Mil Waterproof SPC LVP",
        tag: "Zero Swell, High-Traffic Core",
        desc: "Rigid core waterproof vinyl planks with commercial wear layers and attached sound-deadening pad.",
        href: "/category/luxury-vinyl",
      },
      {
        name: "Solution-Dyed Turnover Carpet",
        tag: "Bleach & Stain Resistant",
        desc: "Frieze and textured plush carpets engineered for bedroom turnovers and common corridors.",
        href: "/category/carpet",
      },
      {
        name: "Carpet Cushion & Sundries",
        tag: "Rolls, Tack Strip & Transitions",
        desc: "Commercial and residential rebond pad rolls and matching transition moldings.",
        href: "/category/carpet-cushion",
      },
    ],
    faqs: [
      {
        q: "Can we buy material-only for our in-house maintenance crew and use your installers only when we're backed up?",
        a: "Yes. Many of our Portland and Vancouver property management accounts pick up LVP cartons for their in-house techs on standard turns, and use our installation crews for carpet installs or end-of-month overflow.",
      },
      {
        q: "Do you carry LVP with attached pad that meets condo HOA sound ratings?",
        a: "Yes, our SPC and WPC Luxury Vinyl Plank lines include attached acoustical underlayments (such as Soft Silence and IXPE pads), and we can provide 1-page architectural spec sheets for HOA architectural review boards.",
      },
      {
        q: "Can you deliver samples to our leasing office?",
        a: "Absolutely. Order samples online or contact our Portland (1320 SE Water Ave) or Lake Oswego (25 S State St Ste 2110) showrooms and we will drop off architectural sample boards for your leasing and maintenance teams.",
      },
    ],
  },

  "builders-remodelers": {
    slug: "builders-remodelers",
    isClientFacingResource: false,
    metaTitle: "Wholesale Flooring for Custom Builders, GCs & Designers | Portland & Lake Oswego",
    metaDesc:
      "B2B wholesale flooring portal for Portland & Lake Oswego general contractors, custom home builders, and interior designers. White-label client boards, on-site takeoffs & trade pricing.",
    heroBadge: "For Custom Builders, GCs & Interior Designers",
    heroTitle: "Wholesale Trade Pricing & White-Label Client Presentations for Builders",
    heroSubtitle:
      "Stop sending your remodel and custom home clients into big-box retail stores where you lose control of the spec and your margin. Floors 55 Pro combines protected B2B wholesale pricing with white-label digital client boards and two luxury showrooms in Portland and Lake Oswego.",
    shareButtonLabel: "Share Trade Portal with a Builder / Designer",
    shareMessage:
      "Check out Floors 55 Pro—wholesale flooring portal and white-label showroom for Portland & Lake Oswego builders and designers:",
    primaryCtaText: "Request a Pro Trade Account",
    primaryCtaHref: "/quote?program=Builder+Trade+Account",
    secondaryCtaText: "Explore Pro Select Catalog",
    secondaryCtaHref: "/category?program=contractor",
    pillarsTitle: "Built Around How Contractors & Designers Actually Sell",
    pillars: [
      {
        icon: "🛡️",
        tag: "Protected Margins",
        title: "White-Label Client Selection Boards",
        desc: "Build digital selection boards for your homeowners with your custom company logo and your exact retail markup percentage baked in. Wholesale costs stay 100% hidden.",
        bullets: [
          "Share magic links showing only your brand name and your custom client price",
          "Download 1-page architectural PDF spec sheets with or without pricing",
          "Send clients into our Lake Oswego or Portland showrooms under your account protection",
        ],
      },
      {
        icon: "📐",
        tag: "Field Support",
        title: "On-Site Laser Measures & Takeoffs",
        desc: "Eliminate costly carton shortages and stair-nose miscalculations. We dispatch to jobsites across the 15-city Portland/SW Washington metro to verify square footage, waste factors, and seam layouts.",
        bullets: [
          "Exact box, roll, and transition trim calculations",
          "Built-in Turnkey Proposal Builder inside every product page",
          "Jobsite sample delivery straight to your client's home or your office",
        ],
      },
      {
        icon: "⚡",
        tag: "Flexible Execution",
        title: "Material-Only Will-Call or Turnkey Installed",
        desc: "Whether you have your own finish carpenters laying hardwood and LVP or want our licensed installation crews to handle the entire flooring scope, we adapt to your project schedule.",
        bullets: [
          "Fast vendor partner warehouse will-call for contractors supplying their own labor",
          "Full material-and-labor installation quotes available on request",
          "Matching flush stair noses, bullnose tile trims, and custom moldings",
        ],
      },
    ],
    stepsTitle: "How Contractors & Designers Use Floors 55 Pro",
    steps: [
      {
        step: "1",
        title: "Log In to View Live Wholesale Tiers",
        desc: "Access your protected B2B wholesale pricing across engineered hardwood, 20-mil LVP, porcelain tile, laminate, and designer carpet.",
      },
      {
        step: "2",
        title: "Curate a White-Label Client Board",
        desc: "Set your desired margin (e.g. 20%–35%) and send your homeowner a branded selection link—or book them a showroom consultation.",
      },
      {
        step: "3",
        title: "Download Submittal Spec Sheets",
        desc: "Generate 1-page PDF architectural tear sheets with room scenes, 2-column specs, and full colorway palettes for client sign-off.",
      },
      {
        step: "4",
        title: "Will-Call Pickup or Turnkey Install",
        desc: "Stage materials for rapid warehouse pickup or schedule our vetted crews for complete turnkey installation.",
      },
    ],
    collectionsTitle: "Featured Builder & Designer Collections",
    collections: [
      {
        name: "Pro Select Contractor Catalog",
        tag: "Top Builder & Remodeler Specs",
        desc: "Browse our curated Pro Select lines favored by Portland and Lake Oswego custom builders.",
        href: "/category?program=contractor",
      },
      {
        name: "Architectural Engineered Hardwood",
        tag: "European White Oak & Wide Plank",
        desc: "Wire-brushed, matte-finish engineered hardwoods built for Pacific Northwest custom homes.",
        href: "/category/hardwood",
      },
      {
        name: "Large-Format Porcelain Tile",
        tag: "Coordinated Series & Bullnose Trims",
        desc: "Rectified porcelain floor and wall tile series with matching mosaics and bullnose accessories.",
        href: "/category/tile",
      },
      {
        name: "Rigid Core Waterproof LVP & Laminate",
        tag: "20-Mil Wear Layers & Attached Pad",
        desc: "Heavy-duty SPC/WPC luxury vinyl and AC4/AC5 waterproof laminates.",
        href: "/category/luxury-vinyl",
      },
    ],
    faqs: [
      {
        q: "Can I send my homeowner into your Lake Oswego or Portland showroom without them seeing wholesale prices?",
        a: "Yes. Both our physical showrooms and our digital portal are built to protect your trade margin. When you send a client in—or share a White-Label Client Board link—they only see retail or your custom-set margin pricing.",
      },
      {
        q: "How do I generate a 1-page spec sheet for an architect, HOA, or homeowner?",
        a: "On any product page on Floors55Pro.com, click the 'Sales Sheet' button at the top right. You can toggle pricing on or off, swap between the room scene and plank swatch, and save a clean 1-page PDF submittal sheet.",
      },
      {
        q: "Do you supply matching stair treads, flush stair noses, and transition moldings?",
        a: "Yes. Every product page automatically links its exact-match coordinating trims, flush stair noses, T-moldings, reducers, or tile bullnose pieces right below the main product viewer.",
      },
    ],
  },
};

const getGridImgUrl = (data) => {
  const safeName = (data.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const safeSku = (data.sku || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let folderName = data.imageFolder ? data.imageFolder : "images";
  if (!data.imageFolder) {
    if (safeName && safeSku) folderName = `${safeName}-${safeSku}`;
    else if (safeName) folderName = safeName;
    folderName = folderName.replace(/-+$/, "");
  }
  const displaySku = data.colors?.[0]?.sku || "01";
  const isCarpet = (data.category || "").toLowerCase() === "carpet";
  const imgType = isCarpet ? "swatch" : "main";
  const rawPath = `images/${folderName}/${data.imgPrefix || ""}${displaySku}_${imgType}.jpg`.toLowerCase();
  return `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(rawPath)}?alt=media`;
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const program = PROGRAM_DATA[slug];
  if (!program) return { title: "Program Not Found" };

  return {
    title: program.metaTitle,
    description: program.metaDesc,
    alternates: {
      canonical: `${BASE_URL}/programs/${program.slug}`,
    },
    openGraph: {
      title: program.metaTitle,
      description: program.metaDesc,
      url: `${BASE_URL}/programs/${program.slug}`,
      type: "website",
    },
  };
}

export default async function ProgramDetailPage({ params }) {
  const { slug } = await params;
  const program = PROGRAM_DATA[slug];
  if (!program) notFound();

  let featuredProducts = [];
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth).catch(() => {});
    }
    const q = query(collection(db, "artifacts", appId, "public", "data", "pricing"), limit(24));
    const snap = await getDocs(q);
    const allVisible = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.isVisible !== false && !data.isAccessory && parseFloat(data.price) > 0) {
        const basePrice = parseFloat(data.price) || 0;
        const retailPrice = data.retailPrice ? parseFloat(data.retailPrice) : basePrice * 2.2;
        allVisible.push({
          id: d.id,
          name: (data.usePrivateName && data.privateName) ? data.privateName : (data.name || "Flooring Collection"),
          category: data.category || "Flooring",
          unit: data.unit || "sqft",
          retailFormatted: retailPrice.toFixed(2),
          isPropMgt: !!data.isPropMgt,
          isContractor: !!data.isContractor,
          imgUrl: getGridImgUrl(data),
        });
      }
    });

    if (slug === "property-management") {
      const propMatches = allVisible.filter((p) => p.isPropMgt);
      featuredProducts = (propMatches.length >= 4 ? propMatches : allVisible).slice(0, 4);
    } else if (slug === "builders-remodelers") {
      const proMatches = allVisible.filter((p) => p.isContractor);
      featuredProducts = (proMatches.length >= 4 ? proMatches : allVisible).slice(0, 4);
    } else {
      featuredProducts = allVisible.slice(0, 4);
    }
  } catch (e) {
    console.error("Error loading featured program products:", e);
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: program.heroTitle,
    description: program.metaDesc,
    url: `${BASE_URL}/programs/${program.slug}`,
    provider: {
      "@type": "WholesaleStore",
      name: "Floors 55 Pro",
      url: BASE_URL,
      telephone: "+1-503-555-0155",
      parentOrganization: {
        "@type": "Organization",
        name: "Floors 55 Abbey Carpet & Floor",
        url: "https://www.floors55.com",
      },
    },
    areaServed: [
      { "@type": "City", name: "Portland" },
      { "@type": "City", name: "Lake Oswego" },
      { "@type": "City", name: "West Linn" },
      { "@type": "City", name: "Beaverton" },
      { "@type": "City", name: "Tigard" },
      { "@type": "City", name: "Vancouver" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: program.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Programs", item: `${BASE_URL}/programs` },
      { "@type": "ListItem", position: 3, name: program.heroBadge, item: `${BASE_URL}/programs/${program.slug}` },
    ],
  };

  return (
    <main className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* HERO SECTION */}
      <section className="bg-gray-900 text-white py-16 px-4 border-b-4 border-[#c5a059]">
        <div className="max-w-[1250px] mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-[#c5a059] transition-colors" style={{ textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/programs" className="hover:text-[#c5a059] transition-colors" style={{ textDecoration: "none" }}>Programs</Link>
            <span>/</span>
            <span className="text-[#c5a059]">{program.heroBadge}</span>
          </div>

          <span className="inline-block bg-[#c5a059]/20 border border-[#c5a059] text-[#c5a059] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full mb-4">
            {program.heroBadge}
          </span>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-5 max-w-4xl leading-tight">
            {program.heroTitle}
          </h1>

          <p className="text-gray-300 text-lg max-w-3xl leading-relaxed mb-8">
            {program.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={program.primaryCtaHref}
              className="bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-widest px-7 py-4 rounded-xl transition-colors shadow-lg"
              style={{ textDecoration: "none" }}
            >
              {program.primaryCtaText}
            </Link>
            <Link
              href={program.secondaryCtaHref}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 font-black text-xs uppercase tracking-widest px-7 py-4 rounded-xl transition-colors"
              style={{ textDecoration: "none" }}
            >
              {program.secondaryCtaText}
            </Link>
            <ProgramShareButton
              url={`${BASE_URL}/programs/${program.slug}`}
              title={program.heroTitle}
              shareText={program.shareMessage}
              buttonLabel={program.shareButtonLabel}
            />
          </div>
        </div>
      </section>

      {/* REALTOR CONCIERGE BANNER */}
      {program.isClientFacingResource && (
        <section className="bg-[#fdfbf7] border-b border-[#c5a059]/30 py-6 px-4">
          <div className="max-w-[1250px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="text-2xl">🤝</span>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                  Client-Safe Resource Page — Built for Realtors to Share Directly with Buyers &amp; Sellers
                </div>
                <p className="text-sm text-gray-700 m-0 mt-0.5">
                  Send your client this page link or bring them into our <strong>Lake Oswego (Oswego Village)</strong> or <strong>Portland (SE Water Ave)</strong> showrooms. We handle measuring, samples, direct homeowner billing, and installation on your closing timeline.
                </p>
              </div>
            </div>
            <Link
              href="/order-sample"
              className="shrink-0 bg-black hover:bg-[#c5a059] text-white hover:text-black px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors"
              style={{ textDecoration: "none" }}
            >
              Order Free Client Samples →
            </Link>
          </div>
        </section>
      )}

      {/* 3 CORE PILLARS */}
      <section className="max-w-[1250px] mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 text-center">
          {program.pillarsTitle}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {program.pillars.map((pillar, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{pillar.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-[#c5a059] px-3 py-1 rounded-full">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{pillar.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{pillar.desc}</p>
              </div>
              <ul className="space-y-2.5 pl-0 list-none m-0 pt-4 border-t border-gray-200">
                {pillar.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-700">
                    <span className="text-[#c5a059] font-black">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CURATED CATEGORY QUICK-LINKS */}
      <section className="bg-gray-50 border-y border-gray-200 py-16 px-4">
        <div className="max-w-[1250px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#c5a059]">Curated Flooring Lines</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1 mb-0">{program.collectionsTitle}</h2>
            </div>
            <Link
              href="/category"
              className="text-xs font-black uppercase tracking-widest text-gray-900 hover:text-[#c5a059] transition-colors"
              style={{ textDecoration: "none" }}
            >
              View Full Flooring Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {program.collections.map((col, idx) => (
              <Link
                key={idx}
                href={col.href}
                className="bg-white border border-gray-200 hover:border-[#c5a059] rounded-xl p-6 flex flex-col justify-between transition-all hover:shadow-lg group"
                style={{ textDecoration: "none" }}
              >
                <div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#c5a059] mb-2">
                    {col.tag}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-[#c5a059] transition-colors mb-2">
                    {col.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{col.desc}</p>
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-900 group-hover:translate-x-1 transition-transform inline-block">
                  Browse Styles →
                </span>
              </Link>
            ))}
          </div>

          {/* LIVE FEATURED PRODUCTS PREVIEW */}
          {featuredProducts.length > 0 && (
            <div className="mt-12 pt-10 border-t border-gray-200">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">
                Popular In-Stock &amp; Quick-Ship Selections
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    className="bg-white border border-gray-200 hover:border-[#c5a059] rounded-xl overflow-hidden transition-all hover:shadow-md flex flex-col"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={prod.imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                          {prod.category}
                        </span>
                        <h4 className="text-base font-black text-gray-900 m-0 mb-2">{prod.name}</h4>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold">
                          Retail: <strong className="text-gray-900">${prod.retailFormatted}</strong> /{prod.unit}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">
                          View Colors →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4-STEP WORKFLOW */}
      <section className="max-w-[1250px] mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 text-center">
          {program.stepsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {program.steps.map((s) => (
            <div key={s.step} className="bg-white border border-gray-200 rounded-xl p-6 relative">
              <div className="w-9 h-9 rounded-full bg-gray-900 text-[#c5a059] font-black text-sm flex items-center justify-center mb-4">
                {s.step}
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed m-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TWO SHOWROOM CONCIERGE HUBS */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-[1250px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#c5a059]">
              2 Convenient Metro Showrooms
            </span>
            <h2 className="text-2xl md:text-4xl font-black mt-2 mb-4">
              Visit With Your Clients in Lake Oswego or Central Eastside Portland
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Clients love seeing full-size wide-plank hardwood, waterproof LVP, porcelain tile, and carpet displays in person. Send your buyers or sellers into either showroom—or meet them at our work tables to coordinate paint, cabinets, and flooring together.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/locations"
                className="bg-[#c5a059] hover:bg-white text-black font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-colors"
                style={{ textDecoration: "none" }}
              >
                Showroom Directions &amp; Hours
              </Link>
              <Link
                href="/service-areas"
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-colors"
                style={{ textDecoration: "none" }}
              >
                View 15-City Metro Coverage Map
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] block mb-1">
                South Metro &amp; Clackamas Hub
              </span>
              <h3 className="text-lg font-black text-white mb-2">Lake Oswego Showroom</h3>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Oswego Village
                <br />
                25 S State St, Suite 2110
                <br />
                Lake Oswego, OR 97034
              </p>
              <span className="text-[11px] text-gray-400 block">
                Serving Lake Oswego, West Linn, Tigard, Tualatin, Wilsonville &amp; Oregon City
              </span>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] block mb-1">
                Central Metro &amp; SW Washington Hub
              </span>
              <h3 className="text-lg font-black text-white mb-2">Portland Showroom</h3>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Central Eastside
                <br />
                1320 SE Water Ave
                <br />
                Portland, OR 97214
              </p>
              <span className="text-[11px] text-gray-400 block">
                Serving Portland, Beaverton, Hillsboro, Happy Valley, Gresham, Vancouver &amp; Camas WA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-[1000px] mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {program.faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-black text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed m-0">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* OTHER PROGRAMS CROSS-LINKS */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-500">
          <span>Explore All Trade &amp; Client Programs:</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/programs/realtors" className="text-gray-900 hover:text-[#c5a059]" style={{ textDecoration: "none" }}>
              Realtor &amp; Homeowner Concierge
            </Link>
            <span>·</span>
            <Link href="/programs/property-management" className="text-gray-900 hover:text-[#c5a059]" style={{ textDecoration: "none" }}>
              Property Management
            </Link>
            <span>·</span>
            <Link href="/programs/builders-remodelers" className="text-gray-900 hover:text-[#c5a059]" style={{ textDecoration: "none" }}>
              Builders &amp; Remodelers
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}