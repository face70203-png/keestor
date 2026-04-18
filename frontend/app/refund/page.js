import React from 'react';

export default function RefundPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-5xl font-black text-slate-900 mb-10 tracking-tight">Refund & Delivery Policy</h1>
            
            <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Instant Digital Delivery</h2>
                    <p>KeeStore operates on a 100% automated delivery model. Upon successful payment verification, your digital assets (keys, licenses, or files) are instantly generated and added to your secure library. Due to the high-entropy nature of these assets, delivery is irreversible.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Refund Eligibility</h2>
                    <p>Given the digital and instantaneous nature of our products, refunds are generally not offered once a key has been revealed or an asset downloaded. Exceptions are made only in the case of confirmed double-charges or if an asset is technically defective and cannot be resolved by our support team within 72 hours.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. Replacement Warranty</h2>
                    <p>We guarantee that all keys are valid and from authorized nodes at the time of delivery. If a key is found to be invalid, we provide an immediate replacement upon verification of the error log.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Cancellation</h2>
                    <p>Orders cannot be cancelled once the payment has been finalized and the key-generation protocol has been initiated.</p>
                </section>

                <div className="pt-10 border-t border-slate-100 italic text-sm text-slate-400 font-medium">
                    Last Updated: April 18, 2026. Review your assets carefully before revealing secure content.
                </div>
            </div>
        </div>
    );
}
