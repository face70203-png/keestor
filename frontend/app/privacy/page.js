import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-5xl font-black text-slate-900 mb-10 tracking-tight">Privacy Policy</h1>
            
            <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Data Encryption</h2>
                    <p>At KeeStore, security is not a feature; it is our foundation. All personal data, including email addresses and transaction logs, are encrypted using AES-256 standards at rest and TLS 1.3 during transit.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Information Collection</h2>
                    <p>We collect minimal information necessary to deliver your digital assets. This includes your username, email (for asset delivery), and transaction metadata. We do not store full credit card details on our servers; payments are processed via Stripe, a PCI-DSS compliant partner.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. Global Node Security</h2>
                    <p>Your regional data is stored across decentralized cloud nodes to ensure maximum uptime and protection against local regulatory interruptions. We do not sell or lease user data to third-party marketing entities.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Cookie Policy</h2>
                    <p>We use essential cookies to maintain your session and security context. Non-essential tracking is kept to an absolute minimum to ensure a clean, high-performance experience.</p>
                </section>

                <div className="pt-10 border-t border-slate-100 italic text-sm text-slate-400 font-medium">
                    Last Updated: April 18, 2026. For questions regarding your data, contact support@keestore.app.
                </div>
            </div>
        </div>
    );
}
