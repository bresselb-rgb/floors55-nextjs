import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
// Import your analytics component so tracking works
import FirebaseAnalytics from "../components/FirebaseAnalytics"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Merged metadata block (Only ONE export allowed)
export const metadata = {
  metadataBase: new URL('https://floors55pro.com'),
  title: {
    default: 'Floors 55 Pro | Wholesale Flooring for Portland Contractors',
    template: '%s | Floors 55 Pro Portal',
  },
  description: 'Exclusive B2B trade portal for Portland and Lake Oswego contractors, custom builders, and property managers. Access wholesale LVP, hardwood, carpet, and tile.',
  keywords: 'wholesale flooring Portland, contractor flooring supplier, LVP wholesale Oregon, property management flooring, Floors 55 pro, trade flooring account',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Floors 55 Pro | Portland Wholesale Flooring',
    description: 'Exclusive B2B trade portal for Portland and Lake Oswego contractors.',
    url: 'https://floors55pro.com',
    siteName: 'Floors 55 Pro',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Local SEO Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "name": "Floors 55 Pro",
    "image": "https://www.floors55pro.com/images/f55-pros-logo.jpg",
    "description": "Wholesale flooring supplier providing exclusive pricing and account management for contractors, builders, and property managers.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "312 Oswego Pointe Dr",
      "addressLocality": "Lake Oswego",
      "addressRegion": "OR",
      "postalCode": "97034",
      "addressCountry": "US"
    },
    "areaServed": ["Portland, OR", "Lake Oswego, OR", "Pacific Northwest"],
    "audience": {
      "@type": "Audience",
      "audienceType": "Contractors, Builders, Interior Designers, Property Managers"
    },
    "sameAs": [
      "https://floors55.com"
    ]
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
        <FirebaseAnalytics />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}