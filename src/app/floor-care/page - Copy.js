import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Floor Care & Maintenance Guide | Floors 55",
  description: "Learn how to properly clean, maintain, and protect your Luxury Vinyl, Hardwood, Laminate, and Carpet to ensure a lifetime of beauty.",
};

export default function FloorCarePage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      {/* Hero Section */}
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/laminate.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <p className="text-gold uppercase tracking-[0.2em] font-bold mb-4 text-xs">Maintenance Guide</p>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Protect Your Investment</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                Proper care ensures your new flooring stays beautiful for decades. Follow these manufacturer-approved guidelines to maintain your warranty and preserve your floors.
            </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Universal Rules */}
        <section className="mb-16 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
            <h2 className="text-2xl font-black mb-6">The Golden Rules for Hard Surfaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><span className="text-xl">🛑</span> No Steam Cleaners</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Never use a steam mop on LVP, Laminate, or Hardwood. The intense heat and moisture can force water into seams, causing warping, delamination, and voiding your warranty.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><span className="text-xl">🛋️</span> Felt Protectors</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Apply heavy-duty felt pads to the bottom of all furniture legs (chairs, tables, sofas) to prevent deep scratches. Replace them every 6 months as they collect grit.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><span className="text-xl">🧹</span> Dirt is the Enemy</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Dirt acts like sandpaper under your shoes. Sweep or dust mop regularly, and use high-quality walk-off mats at all exterior doors to catch grit before it enters.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><span className="text-xl">🐾</span> Pet Maintenance</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Keep your pet's nails trimmed and paws clean. While hard surfaces are highly scratch-resistant, untrimmed dog nails can still damage the wear layer over time.</p>
                </div>
            </div>
        </section>

        {/* Material Specific Guides */}
        <div className="space-y-8">
            
            {/* LVP Care */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                    <h3 className="text-xl font-black tracking-wide">Luxury Vinyl (LVP) Care</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4 text-gray-600">
                    <p><strong>Routine Cleaning:</strong> Sweep, vacuum (with the beater bar turned OFF), or dust mop daily to remove dirt and grit.</p>
                    <p><strong>Deep Cleaning:</strong> Damp mop using a pH-neutral luxury vinyl floor cleaner. Do not flood the floor with water, even though LVP is waterproof, as water can still seep under the baseboards.</p>
                    <p><strong>What to Avoid:</strong> Never use abrasive cleaners, bleach, ammonia, wax, or "mop and shine" products. These will leave a dull, sticky film on the surface.</p>
                </div>
            </div>

            {/* Hardwood Care */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                    <h3 className="text-xl font-black tracking-wide">Engineered Hardwood Care</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4 text-gray-600">
                    <p><strong>Routine Cleaning:</strong> Dust mop with a microfiber cloth regularly. Vacuum only with a soft brush attachment (no beater bars).</p>
                    <p><strong>Deep Cleaning:</strong> Use only specialized hardwood floor cleaners (like Bona). Spray the cleaner directly onto a microfiber mop head, not directly onto the floor.</p>
                    <p><strong>Climate Control:</strong> Wood is a natural material. Keep your home's relative humidity between 35% and 55% year-round to prevent excessive shrinking or expanding.</p>
                    <p className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded">Warning: NEVER wet mop a hardwood floor. Standing water will irreparably damage the wood veneer.</p>
                </div>
            </div>

            {/* Laminate Care (Expanded) */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                    <h3 className="text-xl font-black tracking-wide">Laminate Flooring Care</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4 text-gray-600">
                    <p><strong>Routine Cleaning:</strong> Dry dust mop or vacuum (with the beater bar turned off) to keep the surface free of abrasive dirt.</p>
                    <p><strong>Moisture Management:</strong> While many modern laminates are highly water-resistant, they are not completely waterproof from the bottom up like LVP. Wipe up liquid spills immediately. Never let water puddle on the joints, as it can seep down and cause the fiberboard core to swell.</p>
                    <p><strong>Deep Cleaning:</strong> Use a specialized laminate floor cleaner. Apply the cleaner directly to a microfiber mop pad—never spray it directly onto the floor. Use as little moisture as possible during cleaning.</p>
                    <p><strong>Scratch Prevention:</strong> Although laminate has an incredibly tough aluminum oxide wear layer, you should still use felt protectors under heavy furniture and avoid dragging appliances across the room.</p>
                </div>
            </div>

            {/* Carpet Care */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                    <h3 className="text-xl font-black tracking-wide">Carpet Care</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4 text-gray-600">
                    <p><strong>Vacuuming:</strong> Vacuum 1-2 times a week. For ultra-soft or plush carpets, ensure your vacuum’s beater bar height is adjustable so it doesn't damage the yarn.</p>
                    <p><strong>Spills & Stains:</strong> Act fast! Blot (never rub) the stain with a clean, white cloth. Work from the outside of the stain inward to prevent spreading. Use water first, then a manufacturer-approved carpet spot cleaner if needed.</p>
                    <p><strong>Professional Cleaning:</strong> Most carpet warranties require professional hot water extraction (steam cleaning) every 12 to 18 months by an IICRC-certified technician. Keep your receipts!</p>
                </div>
            </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
            <p className="text-gray-500 mb-6">Have a specific question about an approved cleaner or a stubborn stain?</p>
            <Link href="/general-contact" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>
                Contact Our Support Team
            </Link>
        </div>

      </div>
    </main>
  );
}