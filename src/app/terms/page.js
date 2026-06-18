import React from 'react';

export const metadata = {
  title: "Terms and Conditions | Floors 55",
  description: "Terms and conditions for using the Floors 55 Pro platform.",
};

export default function TermsPage() {
  return (
    <main className="bg-gray-50 text-gray-900 font-sans flex flex-col flex-1 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <h1 className="text-3xl font-black mb-8">Terms and Conditions</h1>
          
          <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
            <p>Last Updated: {new Date().toLocaleDateString()}</p>

            <p>Welcome to Floors 55 Pro. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Use of the Platform</h2>
            <p>This platform is intended for professional use by approved contractors, property managers, and designers. You agree to use the platform only for lawful purposes and in a manner that does not infringe on the rights of others.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Account Security</h2>
            <p>If you are provided with an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Limitation of Liability</h2>
            <p>Floors 55 shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
          </div>
        </div>
      </div>
    </main>
  );
}