import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-white text-gray-900 font-sans flex flex-col flex-1">
      
      {}
      <header 
        className="relative min-h-[250px] md:min-h-[320px] py-8 flex items-center justify-center text-center text-white"
        style={{ 
          background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/heros/main-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-3xl px-4">
            <p className="text-gold uppercase tracking-[0.2em] font-bold mb-2 text-xs">Established 2008</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight">Professional Fashion Flooring for Less</h1>
            <p className="text-base md:text-lg mb-6 text-gray-200 font-light leading-relaxed">The Northwest's premier flooring broker. Secure wholesale pricing on Luxury Vinyl, Hardwood, Tile and Designer Carpet.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/category#All-Products" className="bg-gold text-black px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>Explore Collections</Link>
                <Link href="#locations" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold uppercase text-xs hover:bg-gold hover:text-black transition-all shadow-lg" style={{ textDecoration: 'none' }}>Our Locations</Link>
            </div>
        </div>
      </header>

      {}
      <section id="categories" className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <Link href="/category#Luxury-Vinyl" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <img src="/images/heros/lvp.jpg" alt="Luxury Vinyl" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-white text-3xl font-bold mb-1">Luxury Vinyl</h3>
                        <p className="text-gray-300 text-sm mb-6">100% Waterproof & Durable</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop LVP</span>
                    </div>
                </Link>
                
                <Link href="/category#Carpet" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <img src="/images/heros/carpet.jpg" alt="Designer Carpet" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-white text-3xl font-bold mb-1">Designer Carpet</h3>
                        <p className="text-gray-300 text-sm mb-6">Plush Comfort & Warmth</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Carpet</span>
                    </div>
                </Link>

                <Link href="/category#Laminate" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <img src="/images/heros/laminate.jpg" alt="Premium Laminate" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-white text-3xl font-bold mb-1">Premium Laminate</h3>
                        <p className="text-gray-300 text-sm mb-6">Scratch & Dent Resistant</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Laminate</span>
                    </div>
                </Link>

                <Link href="/category#Hardwood" className="group relative h-[450px] rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500" style={{ textDecoration: 'none' }}>
                    <img src="/images/heros/hardwood.jpg" alt="Hardwood" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-white text-3xl font-bold mb-1">Hardwood</h3>
                        <p className="text-gray-300 text-sm mb-6">Timeless Natural Beauty</p>
                        <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase px-6 py-3 rounded-full group-hover:bg-gold transition-all">Shop Hardwood</span>
                    </div>
                </Link>
            </div>
        </div>
      </section>

      {}
      <section id="locations" className="py-24 border-t border-gray-100 flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Visit Our Showrooms</h2>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">Experience our collections in person. Our Lake Oswego and SE Portland showrooms feature hundreds of samples for immediate order.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <p className="text-gold font-black uppercase tracking-widest text-[10px] mb-2">Lake Oswego</p>
                        <p className="font-bold text-gray-900">21 S State St</p>
                        <p className="text-sm text-gray-500">Lake Oswego, OR 97034</p>
                    </div>
                    <div>
                        <p className="text-gold font-black uppercase tracking-widest text-[10px] mb-2">SE Portland</p>
                        <p className="font-bold text-gray-900">1320 SE Water Ave</p>
                        <p className="text-sm text-gray-500">Portland, OR 97214</p>
                    </div>
                </div>
            </div>
            <div className="rounded-3xl h-[400px] overflow-hidden shadow-2xl">
                <img src="/images/heros/showroom.jpg" alt="Showrooms" className="w-full h-full object-cover" />
            </div>
        </div>
      </section>
    </main>
  );
}