import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Showroom Locations | Floors 55 Pro',
  description: 'Find a Floors 55 Pro showroom near you. Premium wholesale flooring for contractors and property managers.',
};

export default function LocationsPage() {
  const showrooms = [
    {
      id: 1,
      name: "Portland Showroom",
      address: "1320 SE Water Ave",
      cityStateZip: "Portland, OR 97214",
      phone: "(503) 491-1776",
      hours: "Mon-Fri: 8:30 AM - 4:30 PM",
      mapLink: "https://www.google.com/maps/search/?api=1&query=1320+SE+Water+Ave,+Portland,+OR+97214",
    },
    {
      id: 2,
      name: "Lake Oswego Showroom",
      address: "25 S State St Ste 2110",
      cityStateZip: "Lake Oswego, OR 97034",
      phone: "(503) 673-1333",
      hours: "Mon-Thu: 8:30 AM - 4:30 PM",
      mapLink: "https://www.google.com/maps/search/?api=1&query=25+S+State+St+Ste+2110,+Lake+Oswego,+OR+97034",
    }
  ];

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1 min-h-screen">
      
      {/* Page Header */}
      <header className="bg-black py-16 text-center text-white border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Showrooms</h1>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              Visit us in person to view premium hardwood, luxury vinyl, and designer carpet samples. 
            </p>
        </div>
      </header>

      {/* Locations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showrooms.map((room) => (
                <div key={room.id} className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl group-hover:scale-110 transition-transform duration-500 pointer-events-none">📍</div>
                    
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{room.name}</h2>
                    
                    <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="text-gold mt-1">🏢</span>
                            <div>
                                <p className="font-medium text-gray-900">{room.address}</p>
                                <p className="text-gray-500">{room.cityStateZip}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-gold">📞</span>
                            <a href={`tel:${room.phone.replace(/[^0-9]/g, '')}`} className="font-medium text-gray-900 hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>
                                {room.phone}
                            </a>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="text-gold mt-1">🕒</span>
                            <p className="font-medium text-gray-600">{room.hours}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <a 
                            href={room.mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block bg-black text-white px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gold hover:text-black transition-colors shadow-md"
                            style={{ textDecoration: 'none' }}
                        >
                            Get Directions
                        </a>
                    </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white border-t border-gray-100 text-center">
        <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Need Samples on the Job Site?</h2>
            <p className="text-gray-500 mb-8">We can ship physical samples directly to your firm or active project site so you can close bids faster.</p>
            <Link href="/order-sample" className="inline-block bg-gold text-black px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all shadow-lg" style={{ textDecoration: 'none' }}>
                Order Physical Samples
            </Link>
        </div>
      </section>

    </main>
  );
}