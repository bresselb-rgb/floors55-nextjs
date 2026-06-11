import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Hard Surface Transitions Guide | Floors 55",
  description: "Understand the different types of flooring moldings and transitions including T-Moldings, Reducers, End Caps, and Stair Noses for your LVP or Laminate project.",
};

export default function TransitionsPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      {/* Hero Section */}
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/hardwood.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <p className="text-gold uppercase tracking-[0.2em] font-bold mb-4 text-xs">Installation Resources</p>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Understanding Transitions</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                Moldings and transitions provide the finishing touches to your hard surface flooring. Learn which profiles you need to bridge gaps, cover edges, and finish stairs flawlessly.
            </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Molding Profiles Explained</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Whether you are installing Luxury Vinyl Plank (LVP), Laminate, or Hardwood, floating floors require expansion gaps. These transition pieces allow your floor to breathe while seamlessly connecting different rooms and heights.
            </p>
        </div>

        <div className="space-y-8">
            
            {/* T-Molding */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center font-black text-6xl text-gray-300 select-none pb-4">T</div>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black mb-3">T-Molding</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        A "T" shaped transition piece used to bridge the narrow gap between two adjacent hard surface floors that are of the <strong>exact same height</strong>. 
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                        <strong className="text-black">Where to use it:</strong> Standard doorways, or when breaking up massive continuous spans of flooring (over 40-50 feet) to provide necessary expansion joints and prevent buckling.
                    </div>
                </div>
            </div>

            {/* Reducer */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center font-black text-6xl text-gray-300 select-none">
                        <span className="transform block -rotate-12 translate-y-1">╲</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black mb-3">Reducer</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        A sloped transition piece used to gracefully step down from a <strong>higher-profile floor to a lower-profile floor</strong>, preventing a blunt tripping hazard.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                        <strong className="text-black">Where to use it:</strong> Transitioning from thick Hardwood or Laminate down to lower-profile sheet vinyl, stained concrete, or directly to a subfloor.
                    </div>
                </div>
            </div>

            {/* End Cap / Baby Threshold */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center font-black text-5xl text-gray-300 select-none pb-1">
                        <span className="transform block rotate-90">⎍</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black mb-1">End Cap</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Also known as: Baby Threshold</p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        A squared-off finishing piece used to transition from hard surface floors to a surface of a different height, or to cap off the edge of a floor where it meets an obstacle.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                        <strong className="text-black">Where to use it:</strong> Butting up against sliding glass door tracks, masonry fireplaces, or transitioning abruptly into thick, plush carpet.
                    </div>
                </div>
            </div>

            {/* Quarter Round */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <div className="w-full md:w-1/3 shrink-0 flex justify-center">
                    <div className="w-32 h-32 bg-gray-50 rounded-full border-4 border-gray-100 flex items-center justify-center font-black text-6xl text-gray-300 select-none pb-4 ml-4">◿</div>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black mb-1">Quarter Round</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Similar to: Shoe Molding</p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        A small, curved piece of trim that creates the final finishing touch between the hard surface floor and the vertical baseboards or walls.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700">
                        <strong className="text-black">Where to use it:</strong> Installed around the entire perimeter of a room. It covers the required 1/4" expansion gap left between the floating planks and the wall.
                    </div>
                </div>
            </div>

        </div>

        {/* Stair specific section */}
        <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-4">Stair & Step Moldings</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Finishing stairs requires specialized moldings that can handle heavy foot traffic while providing a safe, slip-resistant edge.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Flush Stair Nose</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        A highly sought-after, premium finishing touch. A flush stair nose actually clicks or locks directly into the adjoining flooring plank, creating a completely smooth, seamless transition right over the edge of the stair. 
                    </p>
                    <p className="text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Best For:</strong> Modern, clean aesthetics on full staircases. Requires careful subfloor prep and structural adhesive.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Overlap Stair Nose</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        As the name implies, this molding has a slight lip that overlaps the edge of the adjoining flooring plank, capping the edge of the stair while leaving a small expansion gap hidden underneath.
                    </p>
                    <p className="text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Best For:</strong> The top-step landing of a second floor where the hallway requires a floating expansion joint.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm md:col-span-2">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Full Stair Treads & Risers</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Instead of piecing together a separate plank and a stair nose, many premium LVP lines offer one-piece Stair Treads. These are solid, pre-formed pieces that cover the entire step with an integrated bullnose. Risers are the vertical back-plates installed between each step (often painted white or matched to the tread).
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
            <p className="text-gray-500 mb-6">Need help calculating how many transitions your project needs?</p>
            <Link href="/general-contact" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gold hover:text-black transition-all shadow-md" style={{ textDecoration: 'none' }}>
                Contact Our Support Team
            </Link>
        </div>

      </div>
    </main>
  );
}