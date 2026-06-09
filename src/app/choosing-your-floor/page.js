import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "How to Choose the Best Flooring | Floors 55",
  description: "Discover the perfect flooring for your lifestyle. Compare Luxury Vinyl, Hardwood, Laminate, and Carpet to find the right fit for your home, pets, and budget.",
};

export default function ChoosingYourFloorPage() {
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      {/* Hero Section */}
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${getFbUrl('images/heros/main-hero.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Find Your Perfect Floor</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
                Flooring is the foundation of your home’s design. Let’s break down the options so you can make a beautiful, lasting choice that fits your lifestyle.
            </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Quick Matcher Section */}
        <section className="mb-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-4">Shop by Lifestyle</h2>
                <p className="text-gray-500">Quick recommendations based on your home's unique demands.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="text-4xl mb-4">🐕</div>
                    <h3 className="text-lg font-bold mb-2">Pets & Kids</h3>
                    <p className="text-gray-500 text-sm mb-4">You need scratch resistance and waterproof durability.</p>
                    <span className="text-gold font-black uppercase tracking-widest text-xs">Winner: LVP or Laminate</span>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-lg font-bold mb-2">Max Home Value</h3>
                    <p className="text-gray-500 text-sm mb-4">You want timeless beauty that lasts generations.</p>
                    <span className="text-gold font-black uppercase tracking-widest text-xs">Winner: Engineered Hardwood</span>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="text-4xl mb-4">💧</div>
                    <h3 className="text-lg font-bold mb-2">Moisture Prone</h3>
                    <p className="text-gray-500 text-sm mb-4">For bathrooms, laundry rooms, and basements.</p>
                    <span className="text-gold font-black uppercase tracking-widest text-xs">Winner: LVP or Tile</span>
                </div>
            </div>
        </section>

        {/* Deep Dive Section */}
        <section className="space-y-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black mb-4">The Material Deep Dive</h2>
            </div>

            {/* LVP */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="md:w-1/2 h-64 md:h-auto self-stretch relative">
                    <img src={getFbUrl('images/heros/lvp.jpg')} alt="Luxury Vinyl Flooring" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Best Overall Versatility</div>
                    <h3 className="text-2xl font-bold mb-4">Luxury Vinyl Plank (LVP)</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        LVP has revolutionized the flooring industry. It offers ultra-realistic wood visuals with a rigid core that makes it 100% waterproof and incredibly resilient. It is the ultimate choice for busy households, large dogs, and wet areas like kitchens and bathrooms.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-gray-700 font-bold">
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 100% Waterproof</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Highly scratch & dent resistant</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Easy to clean and maintain</li>
                    </ul>
                    <Link href="/category/luxury-vinyl" className="text-gold font-black uppercase tracking-widest text-xs hover:text-black transition-colors" style={{ textDecoration: 'none' }}>Shop LVP Collections &rarr;</Link>
                </div>
            </div>

            {/* Hardwood */}
            <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="md:w-1/2 h-64 md:h-auto self-stretch relative">
                    <img src={getFbUrl('images/heros/hardwood.jpg')} alt="Hardwood Flooring" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Best for Resale Value</div>
                    <h3 className="text-2xl font-bold mb-4">Engineered Hardwood</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Nothing matches the authentic warmth, character, and feel of real hardwood. Engineered hardwood features a top layer of real wood veneer bonded to a stable core, making it less susceptible to expansion and contraction than solid wood. It adds immediate appraisal value to any home.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-gray-700 font-bold">
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unmatched natural beauty</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Increases home resale value</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Can be refinished (depending on veneer thickness)</li>
                    </ul>
                    <Link href="/category/hardwood" className="text-gold font-black uppercase tracking-widest text-xs hover:text-black transition-colors" style={{ textDecoration: 'none' }}>Shop Hardwood Collections &rarr;</Link>
                </div>
            </div>

            {/* Laminate */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="md:w-1/2 h-64 md:h-auto self-stretch relative">
                    <img src={getFbUrl('images/heros/laminate.jpg')} alt="Premium Laminate Flooring" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Best Scratch Resistance</div>
                    <h3 className="text-2xl font-bold mb-4">Premium Laminate</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Laminate has made a massive comeback. Today’s premium laminate features hyper-realistic wood textures and a highly durable wear layer that makes it arguably the most scratch-resistant flooring on the market. It’s perfect for active homes with large dogs where denting and scratching are the primary concerns.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-gray-700 font-bold">
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unbeatable scratch & dent resistance</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Hyper-realistic wood visuals and texture</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Water-resistant technology for everyday spills</li>
                    </ul>
                    <Link href="/category/laminate" className="text-gold font-black uppercase tracking-widest text-xs hover:text-black transition-colors" style={{ textDecoration: 'none' }}>Shop Laminate Collections &rarr;</Link>
                </div>
            </div>

            {/* Carpet */}
            <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="md:w-1/2 h-64 md:h-auto self-stretch relative">
                    <img src={getFbUrl('images/heros/carpet.jpg')} alt="Carpet" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12">
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Best for Comfort</div>
                    <h3 className="text-2xl font-bold mb-4">Designer Carpet</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        For bedrooms, nurseries, and cozy family rooms, carpet remains the standard. Modern carpets feature incredible stain-resistance technologies and durable fibers that stand up to heavy traffic while providing warmth, sound dampening, and slip-resistance.
                    </p>
                    <ul className="space-y-2 mb-8 text-sm text-gray-700 font-bold">
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Soft, warm, and comfortable</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Excellent noise reduction</li>
                        <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Cost-effective coverage for large areas</li>
                    </ul>
                    <Link href="/category/carpet" className="text-gold font-black uppercase tracking-widest text-xs hover:text-black transition-colors" style={{ textDecoration: 'none' }}>Shop Carpet Collections &rarr;</Link>
                </div>
            </div>

        </section>

        {/* CTA */}
        <section className="mt-24 text-center bg-gray-900 text-white rounded-3xl p-12 shadow-xl">
            <h2 className="text-3xl font-black mb-4">Still Unsure? Touch and Feel the Difference.</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                The best way to choose flooring is to see it in your own home's lighting. Order physical samples of any of our premium collections today.
            </p>
            <Link href="/order-sample" className="inline-block bg-gold text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>
                Order Physical Samples
            </Link>
        </section>

      </div>
    </main>
  );
}