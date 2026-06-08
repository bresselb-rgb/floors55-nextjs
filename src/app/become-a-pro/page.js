import React from 'react';
import Link from 'next/link';

// Inject perfect SEO tags for this specific page
export const metadata = {
  title: "Become a Pro | Floors 55",
  description: "Gain exclusive access to wholesale flooring, dedicated account management, and trade-only showrooms in Portland and Lake Oswego.",
};

export default function BecomeAProPage() {
  // Helper to dynamically pull images from your Firebase Storage
  const getFbUrl = (path) => `https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/${encodeURIComponent(path)}?alt=media`;

  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1">
      
      {/* Hero Section */}
      <header 
        className="py-16 md:py-24 text-center text-white relative border-b-4 border-gold"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('${getFbUrl('images/heros/pro-hero.jpg')}')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Elevate Your Bids. <br className="hidden md:block"/>Protect Your Margins.</h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-10 max-w-2xl mx-auto">
                Exclusive wholesale pricing, dedicated account management, and seamless will-call logistics for Portland’s top contractors, designers, and property managers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/wholesale-request" className="bg-gold text-black px-8 py-4 rounded-xl font-black uppercase text-sm hover:bg-white transition-all shadow-lg flex items-center justify-center" style={{ textDecoration: 'none' }}>
                    Apply for Pro Access
                </Link>
                <a href="#consultation" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold uppercase text-sm hover:bg-white hover:text-black transition-all flex items-center justify-center" style={{ textDecoration: 'none' }}>
                    Book a Consultation
                </a>
            </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Value Proposition Section */}
        <section className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-black mb-6 flex flex-wrap justify-center items-baseline gap-x-2">
                <span>Why Partner with</span>
                <span className="tracking-tighter">FLOORS <span className="text-gold">55</span></span>
                <span className="text-red-600 text-2xl md:text-3xl font-black italic tracking-tight">for Pros?</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
                Your time is money. At Floors 55 for Pros, we skip the retail showroom experience and give you direct access to the industry’s best flooring lines at true wholesale pricing. We curate top-tier carpet, hardwood, laminate, and LVP—ensuring industry accuracy and quality—so you can source exactly what your project needs without the fluff. No retail spillover, no hidden fees, just a streamlined pipeline for your business.
            </p>
        </section>

        {/* 3-Column Process Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 text-gold rounded-full flex items-center justify-center font-black text-xl mb-6">1</div>
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-4">Apply for Access</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    Gain exclusive entry to our wholesale portal. Our vetted professional accounts guarantee your pricing remains protected from retail customers, giving you the competitive edge on every bid.
                </p>
                <Link href="/wholesale-request" className="text-black font-black uppercase tracking-widest text-xs hover:text-gold transition-colors" style={{ textDecoration: 'none' }}>
                    Go to Application Form &rarr;
                </Link>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
                <div className="w-12 h-12 bg-gray-50 text-gold rounded-full flex items-center justify-center font-black text-xl mb-6">2</div>
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-4">Meet Your Account Manager</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    Stop dealing with a different rep every time you call. You are assigned a dedicated Account Manager who acts as your single point of contact. From sourcing materials to locking in quotes, we handle the heavy lifting.
                </p>
                <a href="#consultation" className="text-gold font-black uppercase tracking-widest text-xs hover:text-black transition-colors" style={{ textDecoration: 'none' }}>
                    Schedule a Visit &rarr;
                </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 text-gold rounded-full flex items-center justify-center font-black text-xl mb-6">3</div>
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-4">Streamlined Will-Call</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                    Pick up your materials exactly when your crew is ready. We coordinate localized will-call at our network of regional distribution centers, tailored specifically to the product lines you order for maximum efficiency.
                </p>
            </div>

        </section>

        {/* Booking Section */}
        <section id="consultation" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-16 text-center max-w-5xl mx-auto scroll-mt-24">
            <h2 className="text-3xl font-black mb-4">Ready to Talk Specs?</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                Select a time below to connect with an Account Manager. Choose a quick introductory phone call, or schedule a private, trade-only visit at our Portland or Lake Oswego showrooms to review samples.<br/><span className="text-xs italic mt-2 block">(Physical addresses will be provided in your secure confirmation email).</span>
            </p>
            
            {/* Embedded Calendar Widget (Calendly Example) */}
            <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden h-[700px] shadow-inner relative">
                {/* 
                  NOTE FOR BYRON:
                  When you create your free Calendly account, just change the URL in the 'src' below to your specific link! 
                  (e.g. https://calendly.com/floors55) 
                */}
                <iframe 
                    src="https://calendly.com" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    title="Schedule a Consultation"
                    className="absolute inset-0"
                ></iframe>
            </div>
        </section>

      </div>
    </main>
  );
}