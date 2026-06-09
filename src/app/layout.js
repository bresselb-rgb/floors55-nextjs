import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This includes your Pro SEO, keywords, AND the new Favicon links
export const metadata = {
  title: "Floors 55 Pro | Wholesale Flooring for Portland Contractors",
  description: "Portland's premier wholesale flooring broker. Exclusive pricing on LVP, hardwood, and carpet for contractors, builders, and property managers in the PNW.",
  keywords: "wholesale flooring Portland, contractor flooring supplier, LVP wholesale Oregon, property management flooring, Floors 55 pro, trade flooring account",
  icons: {
    icon: '/images/f55-favicon.svg',
    shortcut: '/images/f55-favicon.svg',
    apple: '/images/f55-favicon.svg',
  },
  openGraph: {
    title: 'Floors 55 Pro | Wholesale Flooring',
    description: 'Exclusive wholesale flooring for Portland contractors and designers.',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  // Your Local SEO Schema is perfectly preserved here
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "name": "Floors 55 Pro",
    "image": "https://www.floors55pro.com/images/f55-pros-logo.jpg",
    "description": "Wholesale flooring supplier providing exclusive pricing and account management for contractors, builders, and property managers.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Portland",
      "addressRegion": "OR",
      "addressCountry": "US"
    },
    "areaServed": ["Portland, OR", "Lake Oswego, OR", "Pacific Northwest"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Contractors, Builders, Interior Designers, Property Managers"
    }
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}