import React from 'react';

export const metadata = {
  title: "Privacy Policy | Floors 55",
  description: "Privacy Policy and terms of data collection for Floors 55.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <h1 className="text-3xl font-black mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you request a quote, apply for a wholesale account, or contact us for support. This may include your name, email address, phone number, business details, and project specifications.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including processing your quotes, fulfilling sample orders, and communicating with you about your account or our products.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
            <p>We implement reasonable security measures to protect the confidentiality of your personal information. However, no security system is impenetrable, and we cannot guarantee the absolute security of our database.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us via our website's contact form.</p>
          </div>
        </div>
      </div>
    </main>
  );
}