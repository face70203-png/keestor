import React from 'react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-5xl font-black text-slate-900 mb-10 tracking-tight">Terms of Service</h1>
            
            <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
                    <p>By accessing KeeStore, you agree to be bound by these professional terms of service. Our platform provides digital licensure and software assets subject to the conditions outlined herein.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Digital Asset Usage</h2>
                    <p>Unless explicitly stated, digital assets purchased on KeeStore are for personal or internal business use. Resale, redistribution, or unauthorized modification of software keys and licenses is strictly prohibited and may result in permanent node-level bans.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. User Responsibility</h2>
                    <p>Users are responsible for maintaining the security of their account credentials. KeeStore is not liable for assets lost due to compromised user passwords or failure to enable Two-Factor Authentication (2FA).</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Service Uptime</h2>
                    <p>While we strive for 99.9% uptime, we reserve the right to perform scheduled maintenance on our global asset delivery network. Major maintenance periods will be announced via the platform dashboard.</p>
                </section>

                <div className="pt-10 border-t border-slate-100 italic text-sm text-slate-400 font-medium">
                    Last Updated: April 18, 2026. Non-compliance with these terms may lead to termination of service.
                </div>
            </div>
        </div>
    );
}
