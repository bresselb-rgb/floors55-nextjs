import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Installation Preparation Guide | Floors 55",
  description: "Learn how to prepare your home for a professional flooring installation. What to expect before, during, and after the project.",
};

export default function InstallationPrepPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/main-hero.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <p className="text-gold uppercase tracking-[0.2em] font-bold mb-4 text-xs">Homeowner Guide</p>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Installation Prep Guide</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                Getting new floors is exciting! To ensure a flawless installation and a smooth process for your installation team, here is exactly what you need to know and do before they arrive.
            </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="space-y-12">
            
            {/* The Week Before */}
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><span className="text-3xl">🗓️</span> The Week Before</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p><strong>Climate Control:</strong> Your home's HVAC system must be operational. Wood, laminate, and luxury vinyl need to acclimate to your home's normal living conditions (typically 65-75°F with 35-55% humidity) for at least 48 to 72 hours prior to installation.</p>
                    <p><strong>Clear the Space:</strong> Remove all personal items, electronics, lamps, books, and breakables from the rooms being installed. Strip the beds and remove items from the floors of closets.</p>
                    <p><strong>Furniture Moving:</strong> Unless specifically included in your contractor's quote, the room should be completely empty of furniture. If your team is handling furniture, ensure all drawers are emptied to make the pieces lighter and safer to move.</p>
                </div>
            </section>

            {/* The Day Of */}
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><span className="text-3xl">🛠️</span> Installation Day</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p><strong>Access & Parking:</strong> The installation team will be carrying heavy materials and tools. Please ensure your driveway is clear and they have safe, close access to the entry doors.</p>
                    <p><strong>Dust & Noise:</strong> Flooring installation is construction. There will be loud power tools (saws, nailers, compressors) and dust. While professional crews take steps to minimize mess, we recommend keeping doors to other rooms closed and covering delicate items nearby.</p>
                    <p><strong>Pets & Children:</strong> For their safety, please keep all pets and children out of the work area and away from power tools for the duration of the project.</p>
                    <p><strong>Unforeseen Subfloor Issues:</strong> Once the old flooring is removed, the installers might discover uneven concrete, rotted wood, or moisture issues. Be prepared that fixing the "canvas" before laying the new floor may require a change order and additional costs.</p>
                </div>
            </section>

            {/* After Completion */}
            <section className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gray-300"></div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><span className="text-3xl">✨</span> After Completion</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p><strong>Walk-Through:</strong> Conduct a walk-through with your lead installer to inspect the work, ensure transitions and baseboards are properly placed, and ask any final questions.</p>
                    <p><strong>Leftover Material:</strong> It is standard to have a small amount of leftover material (from waste cuts). We highly recommend keeping 1-2 unopened boxes stored in a climate-controlled space. If a plank gets severely damaged in 5 years, you will have an exact dye-lot match to repair it!</p>
                    <p><strong>Protect Your Investment:</strong> Do not drag your furniture back into the room! Lift and place items, and ensure heavy-duty felt pads are installed on all chair and table legs.</p>
                </div>
            </section>

        </div>
      </div>
    </main>
  );
}