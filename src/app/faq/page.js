import React from 'react';
import Link from 'next/link';

const BASE_URL = 'https://www.floors55pro.com';

export const metadata = {
  title: 'Flooring FAQ: LVP, Laminate, Hardwood & Installation | Portland & Lake Oswego',
  description: 'Expert answers to common flooring questions from our Portland and Lake Oswego showrooms—covering LVP over tile, underlayment pads, T-moldings, pet-friendly floors, and care.',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
  openGraph: {
    title: 'Flooring FAQ: LVP, Laminate, Hardwood & Installation | Floors 55 Pro',
    description: 'Expert answers to common flooring questions from our Portland and Lake Oswego showrooms.',
    url: `${BASE_URL}/faq`,
    type: 'website',
  },
};

export default function FAQPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I install Luxury Vinyl (LVP) over my existing tile?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In many cases, yes. Luxury Vinyl (LVP) can be floated over existing hard surfaces like tile or well-adhered sheet vinyl. However, the existing floor must be flat. If your tile has deep grout lines, they must be filled with a leveling compound first, otherwise the LVP will eventually settle and telegraph the grout lines through the surface.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to buy a separate underlayment pad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It depends on the product. Almost all premium Luxury Vinyl (LVP) and many Laminates come with a high-density acoustic pad already attached to the back. If a pad is pre-attached, adding a second soft pad under it can cause the locking system to break. For solid hardwood or traditional laminate without an attached pad, a separate underlayment is required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does my doorway need a T-Molding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Floating floors naturally expand and contract with temperature and humidity changes. A T-molding in doorways acts as an expansion joint, breaking up large continuous spans of flooring so it does not buckle, peak, or gap under pressure.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which is better for big dogs: Laminate or LVP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'If scratch resistance is your #1 concern, modern Premium Laminate is the winner because its aluminum oxide wear layer is highly resistant to heavy dog claws. However, LVP is 100% waterproof, making it the safer structural choice if pet accidents may sit on the floor.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if I use a steam mop on my floor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Steam mops can permanently damage hardwood, laminate, and LVP floors and void the manufacturer warranty. Intense heat and injected moisture cause wood to warp and vinyl adhesives to delaminate. Use a lightly damp microfiber mop with a pH-neutral floor cleaner instead.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Frequently Asked Questions',
        item: `${BASE_URL}/faq`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
        <header 
          className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/hardwood.jpg')}')`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="max-w-4xl mx-auto px-4 relative z-10">
              <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Frequently Asked Questions</h1>
              <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                  Expert answers from our Portland &amp; Lake Oswego flooring specialists to help you plan your next project.
              </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-6">
              
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-3">Can I install Luxury Vinyl (LVP) over my existing tile?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">In many cases, yes. <Link href="/category/luxury-vinyl" className="text-gold font-bold hover:underline transition-colors">Luxury Vinyl (LVP)</Link> can be floated over existing hard surfaces like <Link href="/category/tile" className="text-gold font-bold hover:underline transition-colors">tile</Link> or well-adhered sheet vinyl. However, the existing floor must be flat. If your tile has deep grout lines, they must be filled with a leveling compound first, otherwise, the LVP will eventually settle and &ldquo;telegraph&rdquo; the grout lines through the surface.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-3">Do I need to buy a separate underlayment pad?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">It depends on the product. Almost all of our premium <Link href="/category/luxury-vinyl" className="text-gold font-bold hover:underline transition-colors">Luxury Vinyl (LVP)</Link> and many <Link href="/category/laminate" className="text-gold font-bold hover:underline transition-colors">Laminates</Link> come with a high-density acoustic pad already attached to the back. If a pad is pre-attached, adding a second soft pad under it will actually cause the locking system to break! For <Link href="/category/hardwood" className="text-gold font-bold hover:underline transition-colors">solid hardwood</Link> or traditional laminate without a pad, a separate underlayment is required.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-3">Why does my doorway need a T-Molding?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">Floating floors naturally expand and contract with temperature and humidity changes. A T-molding in doorways acts as an expansion joint, breaking up massive continuous spans of flooring so it doesn&apos;t buckle, peak, or gap under pressure.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-3">Which is better for big dogs: Laminate or LVP?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">If scratch resistance is your #1 concern, modern <Link href="/category/laminate" className="text-gold font-bold hover:underline transition-colors">Premium Laminate</Link> is the winner. It is coated with aluminum oxide, making it vastly more scratch-resistant to heavy dog claws than vinyl. However, <Link href="/category/luxury-vinyl" className="text-gold font-bold hover:underline transition-colors">LVP</Link> is 100% waterproof. If you are worried about pet accidents sitting on the floor all day while you are at work, LVP might be the safer structural choice.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-3">What happens if I use a steam mop on my floor?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">Steam mops will permanently ruin <Link href="/category/hardwood" className="text-gold font-bold hover:underline transition-colors">hardwood</Link>, <Link href="/category/laminate" className="text-gold font-bold hover:underline transition-colors">laminate</Link>, and <Link href="/category/luxury-vinyl" className="text-gold font-bold hover:underline transition-colors">LVP</Link> floors, instantly voiding the manufacturer warranty. The intense heat and injected moisture will cause wood to warp and vinyl adhesives to delaminate. Stick to lightly damp microfiber mops with pH-neutral cleaners.</p>
              </div>

          </div>

          <div className="mt-12 text-center">
              <p className="text-gray-500 mb-6">Need expert advice for your Portland or Lake Oswego home?</p>
              <Link href="/locations" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>
                  Contact Our Portland or Lake Oswego Team
              </Link>
          </div>

        </div>
      </main>
    </>
  );
}