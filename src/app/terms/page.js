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

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. SMS Alert Program</h2>
            <p>Floors 55 utilizes an automated SMS alert system for internal operational notifications.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Opt-In:</strong> By providing your mobile number to a system administrator, you consent to receive internal system alerts, quote notifications, and administrative updates from Floors 55.</li>
                <li><strong>Message Frequency:</strong> Message frequency varies based on system activity and user submissions.</li>
                <li><strong>Pricing:</strong> Message and data rates may apply depending on your carrier plan.</li>
                <li><strong>Opt-Out Instructions:</strong> You can cancel the SMS service at any time. Just text "STOP" to the shortcode or number sending the messages. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, contact your system administrator.</li>
                <li><strong>Help:</strong> If you are experiencing issues with the messaging program you can reply with the keyword "HELP" for more assistance, or contact support directly.</li>
                <li><strong>Carrier Liability:</strong> Carriers are not liable for delayed or undelivered messages.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Account Security</h2>
            <p>If you are provided with an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Limitation of Liability</h2>
            <p>Floors 55 shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
          </div>
        </div>
      </div>
    </main>
  );
}