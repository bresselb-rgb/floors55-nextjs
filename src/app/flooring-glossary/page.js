import React from 'react';

export const metadata = {
  title: "Flooring Glossary & Terms | Floors 55",
  description: "Understand the jargon. From SPC and WPC to Wear Layers and Acclimation, our glossary explains flooring terminology in plain English.",
};

export default function GlossaryPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  const terms = [
    { term: "Acclimation", def: "The process of allowing flooring materials (like hardwood and laminate) to rest in the environment where they will be installed so they can adjust to the room's temperature and humidity before being locked down." },
    { term: "AC Rating", def: "A durability rating system for Laminate flooring ranging from AC1 to AC5. AC4 and AC5 are considered commercial grade and are highly scratch-resistant." },
    { term: "Bevel / Micro-Bevel", def: "The angled edge of a floor plank. When two planks click together, the bevels create a small V-groove that mimics the look of authentic, individual wood boards." },
    { term: "Engineered Hardwood", def: "Real wood flooring constructed with a top layer (veneer) of genuine hardwood bonded to a multi-ply or high-density core. It provides the exact look of solid wood but is much more dimensionally stable against moisture and temperature changes." },
    { term: "EIR (Embossed In Register)", def: "A premium manufacturing technique where the physical texture on the surface of the plank perfectly matches the wood grain image printed below it, creating hyper-realistic flooring." },
    { term: "Floating Floor", def: "A floor that is not glued or nailed to the subfloor. The planks click and lock together, resting over an underlayment pad. Most LVP and Laminate floors are floated." },
    { term: "LVP / LVT", def: "Luxury Vinyl Plank (or Tile). A highly durable, 100% waterproof synthetic flooring option that mimics the look of wood or stone." },
    { term: "Mil", def: "A unit of measurement used for the 'Wear Layer' on vinyl flooring. One mil is one-thousandth of an inch (not a millimeter). 12-mil is standard residential, while 20-mil or higher is commercial grade." },
    { term: "SPC (Stone Polymer Composite)", def: "A type of rigid-core LVP where the core is made from a mixture of limestone powder and plastic. It makes the floor incredibly dense, highly dent-resistant, and 100% waterproof." },
    { term: "Subfloor", def: "The structural layer (usually plywood or concrete) beneath your finished flooring. A flat, clean, and structurally sound subfloor is the most critical component of a successful installation." },
    { term: "T-Molding", def: "A transition piece used to connect two floors of the same height (like in a doorway), allowing the floating floors room to naturally expand and contract." },
    { term: "Wear Layer", def: "The clear, protective urethane coating applied to the very top of LVP and Laminate flooring. It is the invisible shield that protects the printed wood image from scratches, stains, and scuffs." },
    { term: "WPC (Wood Polymer Composite)", def: "A type of rigid-core LVP where the core includes foaming agents. It is 100% waterproof like SPC, but feels slightly softer and warmer underfoot, and has superior sound-dampening qualities." }
  ];

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/lvp.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The Flooring Glossary</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                SPC? Wear layers? Subfloors? We cut through the industry jargon so you can understand exactly what goes into a premium floor.
            </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {terms.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-black text-gold mb-2 uppercase tracking-wide">{item.term}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.def}</p>
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}