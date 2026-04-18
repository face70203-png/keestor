"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Zap, ShieldCheck, Gift, Users, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";

function InviteContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { lang, dir } = useLanguage();
    const code = searchParams.get('code');
    const [inviter, setInviter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('syncing'); // syncing, valid, invalid
    const t = translations[lang].invite;

    useEffect(() => {
        const verifyInvite = async () => {
            if (!code) {
                setStatus('invalid');
                setLoading(false);
                return;
            }

            try {
                // We'll simulate a 1s "decryption" feel
                setTimeout(() => {
                    setInviter(code.toUpperCase()); // In a real app, fetch inviter name from DB
                    setStatus('valid');
                    setLoading(false);
                    // Store referral in session for registration
                    localStorage.setItem('referralCode', code);
                }, 1500);
            } catch (err) {
                setStatus('invalid');
                setLoading(false);
            }
        };

        verifyInvite();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6" dir={dir}>
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
                </div>
                <h2 className="mt-8 text-2xl font-black tracking-tighter italic animate-pulse">{t.loading}</h2>
                <p className="text-slate-500 mt-2 font-mono text-xs">{t.sync}</p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center" dir={dir}>
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-3xl font-black mb-4">{t.invalidTitle}</h1>
                <p className="text-slate-400 max-w-sm mb-8">{t.invalidDesc}</p>
                <button 
                    onClick={() => router.push('/register')}
                    className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-200 transition-all"
                >
                    {t.registerBtn} <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden" dir={dir}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-8 animate-in slide-in-from-top-4 duration-700">
                    <ShieldCheck size={14} /> {t.badge}
                </div>

                <div className="mb-10 animate-in fade-in zoom-in duration-1000">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Users size={48} className="text-white relative z-10" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic">
                        {t.invitedBy} <span className="text-primary not-italic">@{inviter}</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                        {t.heroDesc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-black text-white mb-1 uppercase tracking-tight">{t.feature1}</h3>
                        <p className="text-slate-500 text-sm font-medium">{t.sub1}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Gift size={24} />
                        </div>
                        <h3 className="font-black text-white mb-1 uppercase tracking-tight">{t.feature2}</h3>
                        <p className="text-slate-500 text-sm font-medium">{t.sub2}</p>
                    </div>
                </div>

                <button 
                    onClick={() => router.push('/register')}
                    className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 active:scale-95 group"
                >
                    {t.acceptBtn} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="mt-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    {t.footer}
                </p>
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div>Loading Configuration...</div>}>
            <InviteContent />
        </Suspense>
    );
}
