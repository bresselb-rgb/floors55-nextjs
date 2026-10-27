import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Frequently Asked Questions | Floors 55",
  description: "Find answers to the most common flooring questions, including installation, underlayment, and choosing between LVP, Laminate, and Hardwood.",
};

export default function FAQPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
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
                Expert answers to help you make the best decisions for your next renovation project.
            </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Can I install Luxury Vinyl (LVP) over my existing tile?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">In many cases, yes. LVP can be floated over existing hard surfaces like tile or well-adhered sheet vinyl. However, the existing floor must be flat. If your tile has deep grout lines, they must be filled with a leveling compound first, otherwise, the LVP will eventually settle and "telegraph" the grout lines through the surface.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Do I need to buy a separate underlayment pad?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">It depends on the product. Almost all of our premium Luxury Vinyl (LVP) and many Laminates come with a high-density acoustic pad already attached to the back. If a pad is pre-attached, adding a second soft pad under it will actually cause the locking system to break! For solid hardwood or traditional laminate without a pad, a separate underlayment is required.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Why does my doorway need a T-Molding?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Floating floors naturally expand and contract with temperature and humidity changes. A T-molding in doorways acts as an expansion joint, breaking up massive continuous spans of flooring so it doesn't buckle, peak, or gap under pressure.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Which is better for big dogs: Laminate or LVP?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">If scratch resistance is your #1 concern, modern Premium Laminate is the winner. It is coated with aluminum oxide, making it vastly more scratch-resistant to heavy dog claws than vinyl. However, LVP is 100% waterproof. If you are worried about pet accidents sitting on the floor all day while you are at work, LVP might be the safer structural choice.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-3">What happens if I use a steam mop on my floor?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Steam mops will permanently ruin hardwood, laminate, and LVP floors, instantly voiding the manufacturer warranty. The intense heat and injected moisture will cause wood to warp and vinyl adhesives to delaminate. Stick to lightly damp microfiber mops with pH-neutral cleaners.</p>
            </div>

        </div>

        <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">Didn't find what you were looking for?</p>
            <Link href="/general-contact" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>
                Contact Our Support Team
            </Link>
        </div>

      </div>
    </main>
  );
}