"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Users, Zap, ShieldCheck, ArrowRight, Activity } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export default function InvitePage() {
    const { code } = useParams();
    const router = useRouter();
    const [inviter, setInviter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!code) return;
        axios.get(`${API_BASE_URL}/api/auth/referral-info/${code}`)
            .then(res => {
                setInviter(res.data.username);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-xs animate-pulse">Decrypting Invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Expired or Invalid Link</h1>
                <p className="text-slate-400 mb-8 max-w-sm">This invitation link has expired or reached the maximum number of nodes. You can still join directly.</p>
                <button onClick={() => router.push('/register')} className="bg-primary hover:brightness-110 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20">
                    Register Directly
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
            {/* 🎨 Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] -z-10 rounded-full"></div>
            
            <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                {/* 🔒 Aesthetic Overlays */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <div className="absolute -right-20 -bottom-20 text-white/5 group-hover:text-primary/10 transition-colors duration-1000">
                    <Users size={300} />
                </div>

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-primary/20">
                        <Zap size={14} fill="currentColor" /> Exclusive Network Invite
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                        You've been invited by <span className="text-primary underline decoration-primary/30 decoration-4 underline-offset-8">{inviter}</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-md mx-auto leading-relaxed">
                        Join the elite digital stock at <span className="text-white font-black">KeeStore</span>. Claim your discounted access to premium assets today.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                            <ShieldCheck className="text-emerald-500" size={24} />
                            <div className="text-left">
                                <h4 className="text-white font-black text-sm uppercase tracking-tight">Verified Source</h4>
                                <p className="text-slate-500 text-[10px] font-bold">100% Secure Invite</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                            <Activity className="text-blue-500" size={24} />
                            <div className="text-left">
                                <h4 className="text-white font-black text-sm uppercase tracking-tight">VIP Discount</h4>
                                <p className="text-slate-500 text-[10px] font-bold">Automatic Redemption</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push(`/register?ref=${code}`)}
                        className="w-full bg-primary hover:scale-[1.02] active:scale-95 text-white font-black py-5 px-8 rounded-[2rem] text-xl shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 group"
                    >
                        Accept Invitation & Join <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </button>

                    <p className="mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Powered by Secure Referral Engine v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
