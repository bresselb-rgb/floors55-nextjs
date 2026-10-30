// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FirebaseAnalytics from "../components/FirebaseAnalytics"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.floors55pro.com'),
  title: {
    default: 'Floors 55 Pro | Wholesale Flooring for Portland & Lake Oswego Contractors',
    template: '%s | Floors 55 Pro Portal',
  },
  description: 'Exclusive B2B trade portal for Portland, Lake Oswego, and SW Washington contractors, custom builders, designers, and property managers. Wholesale LVP, hardwood, carpet, laminate & tile.',
  keywords: 'wholesale flooring Portland, contractor flooring supplier Lake Oswego, LVP wholesale Oregon, property management flooring, on-site flooring takeoffs, Floors 55 Pro',
  openGraph: {
    title: 'Floors 55 Pro | Portland & Lake Oswego Wholesale Flooring',
    description: 'Exclusive B2B trade portal, on-site project measures, vendor will-call, and showroom support for Pacific Northwest pros.',
    url: 'https://www.floors55pro.com',
    siteName: 'Floors 55 Pro',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Sitewide Local & B2B Trade SEO Schema (Accurate Addresses + Parent Organization Link)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WholesaleStore",
    "@id": "https://www.floors55pro.com/#organization",
    "name": "Floors 55 Pro",
    "url": "https://www.floors55pro.com",
    "image": "https://www.floors55pro.com/images/f55-pros-logo.jpg",
    "description": "Wholesale flooring supplier providing exclusive trade pricing, on-site project measures, vendor partner will-call, and installation by request for contractors, builders, designers, and property managers.",
    "telephone": "+1-503-673-1333",
    "parentOrganization": {
      "@type": "HomeAndConstructionBusiness",
      "name": "Floors 55 Abbey Carpet & Floor",
      "url": "https://www.floors55.com"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "25 S State St Ste 2110",
      "addressLocality": "Lake Oswego",
      "addressRegion": "OR",
      "postalCode": "97034",
      "addressCountry": "US"
    },
    "location": [
      {
        "@type": "Place",
        "name": "Floors 55 Pro — Lake Oswego Showroom (Oswego Village)",
        "telephone": "+1-503-673-1333",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "25 S State St Ste 2110",
          "addressLocality": "Lake Oswego",
          "addressRegion": "OR",
          "postalCode": "97034",
          "addressCountry": "US"
        }
      },
      {
        "@type": "Place",
        "name": "Floors 55 Pro — Portland Showroom",
        "telephone": "+1-503-491-1776",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "1320 SE Water Ave",
          "addressLocality": "Portland",
          "addressRegion": "OR",
          "postalCode": "97214",
          "addressCountry": "US"
        }
      }
    ],
    "areaServed": [
      "Lake Oswego, OR",
      "Portland, OR",
      "West Linn, OR",
      "Tigard, OR",
      "Tualatin, OR",
      "Beaverton, OR",
      "Milwaukie, OR",
      "Oregon City, OR",
      "Happy Valley, OR",
      "Sherwood, OR",
      "Wilsonville, OR",
      "Hillsboro, OR",
      "Gresham, OR",
      "Vancouver, WA",
      "Camas, WA"
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Contractors, Custom Builders, Interior Designers, Property Managers"
    },
    "sameAs": [
      "https://www.floors55.com"
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