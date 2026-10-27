import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Understanding Flooring Warranties | Floors 55",
  description: "Learn the difference between wear warranties and structural warranties, and understand what actions will void your manufacturer guarantee.",
};

export default function WarrantiesPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/carpet.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Understanding Warranties</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                What does a "Lifetime Residential Warranty" actually mean? Let's break down how flooring guarantees work and how to protect your investment.
            </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">The "Wear" Warranty</h3>
                <p className="text-gray-600 text-sm leading-relaxed">This guarantees that the clear protective wear layer on top of your LVP or Laminate will not wear completely through to the printed decorative film underneath under normal household conditions. <strong>Note:</strong> This does not mean the floor is scratch-proof. Scratches, dents, and scuffs are considered normal wear and tear and are not covered.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-2">The "Structural" Warranty</h3>
                <p className="text-gray-600 text-sm leading-relaxed">This guarantees that the flooring will not delaminate, cup, warp, or fail structurally due to manufacturing defects. If a locking mechanism snaps because of a factory error, the structural warranty covers the replacement materials.</p>
            </div>
        </div>

        <section className="bg-red-50 p-8 md:p-10 rounded-3xl border border-red-100 mb-12">
            <h2 className="text-2xl font-black mb-6 text-red-900 flex items-center gap-3"><span className="text-2xl">⚠️</span> What Voids a Warranty?</h2>
            <p className="text-red-800 text-sm mb-6">Warranties only cover manufacturing defects. They do not cover damage caused by the environment, homeowner abuse, or improper installation. The following will universally void your manufacturer warranty:</p>
            
            <ul className="space-y-4 text-red-800 text-sm">
                <li className="flex items-start gap-3">
                    <span className="font-bold text-red-600 mt-0.5">1.</span>
                    <div><strong>Poor Subfloor Preparation:</strong> If the subfloor is not flat to the manufacturer's strict specifications (usually within 3/16" over a 10-foot radius), the locking mechanisms will break.</div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-red-600 mt-0.5">2.</span>
                    <div><strong>Steam Mops & Flooding:</strong> Using steam mops, abrasive chemical cleaners, or leaving standing water on the floor for extended periods.</div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-red-600 mt-0.5">3.</span>
                    <div><strong>Missing Expansion Joints:</strong> Floating floors expand. If heavy cabinets or kitchen islands are installed on top of the flooring, or if required T-moldings aren't used in doorways, the floor is pinned and will buckle.</div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="font-bold text-red-600 mt-0.5">4.</span>
                    <div><strong>Extreme Climate Swings:</strong> Turning off the HVAC system for months at a time, exposing the floor to extreme heat or freezing temperatures.</div>
                </li>
            </ul>
        </section>

        <div className="text-center">
            <p className="text-gray-600 italic text-sm">This is a general overview. Always refer to your specific product's manufacturer warranty documentation for exact details and coverage.</p>
        </div>

      </div>
    </main>
  );
}