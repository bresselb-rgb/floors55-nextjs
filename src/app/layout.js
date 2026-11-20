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
  alternates: {
    canonical: './',
  },
  title: {
    default: 'Floors 55 Pro | Portland & Lake Oswego Flooring Showrooms & Trade Portal',
    template: '%s | Floors 55 Pro',
  },
  description: 'Portland and Lake Oswego flooring showrooms and B2B trade portal for contractors, custom builders, realtors, designers, and property managers. Trade pricing on LVP, hardwood, carpet, laminate & tile with local warehouse will-call.',
  keywords: 'Portland flooring showroom, Lake Oswego flooring showroom, trade flooring pricing Portland, contractor flooring supplier Oregon, LVP flooring Portland, property management flooring, on-site flooring takeoffs, Floors 55 Pro',
  openGraph: {
    title: 'Floors 55 Pro | Portland & Lake Oswego Flooring Showrooms & Trade Portal',
    description: 'Portland & Lake Oswego flooring showrooms, exclusive B2B trade pricing, on-site project measures, and local warehouse will-call for Pacific Northwest pros and homeowners.',
    url: 'https://www.floors55pro.com',
    siteName: 'Floors 55 Pro',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Sitewide Local Showroom + B2B Trade SEO Schema
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.floors55pro.com/#website",
        "url": "https://www.floors55pro.com",
        "name": "Floors 55 Pro",
        "publisher": {
          "@id": "https://www.floors55pro.com/#organization"
        }
      },
      {
        "@type": ["HomeGoodsStore", "HomeAndConstructionBusiness"],
        "@id": "https://www.floors55pro.com/#organization",
        "name": "Floors 55 Pro",
        "url": "https://www.floors55pro.com",
        "logo": "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Ff55-pros-logo.jpg?alt=media",
        "image": "https://firebasestorage.googleapis.com/v0/b/floors-55.firebasestorage.app/o/images%2Fheros%2Fmain-hero.jpg?alt=media",
        "description": "Portland and Lake Oswego flooring showrooms and B2B trade portal providing exclusive trade pricing, on-site project measures, local warehouse will-call, and installation by request for contractors, builders, realtors, designers, property managers, and homeowners.",
        "telephone": "+1-503-662-9230",
        "parentOrganization": {
          "@type": "HomeAndConstructionBusiness",
          "name": "Floors 55 Abbey Carpet & Floor",
          "url": "https://www.floors55.com"
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "1320 SE Water Ave",
          "addressLocality": "Portland",
          "addressRegion": "OR",
          "postalCode": "97214",
          "addressCountry": "US"
        },
        "location": [
          {
            "@type": "Place",
            "name": "Floors 55 Pro — Portland Showroom",
            "telephone": "+1-503-662-9230",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1320 SE Water Ave",
              "addressLocality": "Portland",
              "addressRegion": "OR",
              "postalCode": "97214",
              "addressCountry": "US"
            }
          },
          {
            "@type": "Place",
            "name": "Floors 55 Pro — Lake Oswego Showroom (Oswego Village)",
            "telephone": "+1-503-662-9230",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "25 S State St Ste 2110",
              "addressLocality": "Lake Oswego",
              "addressRegion": "OR",
              "postalCode": "97034",
              "addressCountry": "US"
            }
          }
        ],
        "areaServed": [
          "Portland, OR",
          "Lake Oswego, OR",
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
          "audienceType": "Contractors, Custom Builders, Interior Designers, Realtors, Property Managers, Homeowners"
        },
        "sameAs": [
          "https://www.floors55.com"
        ]
      }
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
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