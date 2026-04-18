"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ExternalLink, Package, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const { lang } = useLanguage();
    const [order, setOrder] = useState(null);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyOrder = async () => {
            const order_id = searchParams.get('order_id');
            const session_id = searchParams.get('session_id');

            if (!order_id && !session_id) {
                router.replace('/dashboard');
                return;
            }

            try {
                if (session_id) {
                    const res = await axios.post(`${API_BASE_URL}/api/orders/verify-session`, { session_id, order_id });
                    if (res.data.success && res.data.order) {
                        setOrder(res.data.order);
                    } else {
                        // Fallback to fetch dashboard orders to find it
                        const wRes = await axios.get(`${API_BASE_URL}/api/orders/my-orders`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        const found = wRes.data.find(o => o._id === order_id);
                        if (found) setOrder(found);
                    }
                } else if (order_id) {
                    const wRes = await axios.get(`${API_BASE_URL}/api/orders/my-orders`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    const found = wRes.data.find(o => o._id === order_id);
                    if (found) setOrder(found);
                }
            } catch (error) {
                console.error("Verification failed", error);
            } finally {
                setVerifying(false);
            }
        };

        if (user) {
            verifyOrder();
        } else if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, searchParams, router]);

    if (loading || verifying) {
        return (
            <div className="py-24 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Verifying Ledger...</h2>
                <p className="text-slate-500 font-medium">Securing your digital assets on the KeeStore Network.</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="py-24 text-center max-w-xl mx-auto">
                <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Order Record Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">We couldn't immediately retrieve your order. It might still be processing.</p>
                <button onClick={() => router.push('/dashboard')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all">
                    Check Dashboard Vault
                </button>
            </div>
        );
    }

    const firstItem = order?.items && order.items.length > 0 ? order.items[0] : null;

    return (
        <div className="py-12 max-w-3xl mx-auto px-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

                {/* Checkmark */}
                <div className="w-32 h-32 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-75"></div>
                    <CheckCircle className="text-emerald-500 relative z-10" size={64} strokeWidth={2.5} />
                </div>

                <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Order Placed!</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-10 leading-relaxed">
                    Your payment was successfully verified. Your digital assets have been cryptographically secured and deposited into your Vault.
                </p>

                {/* Info Card */}
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 text-left mb-10 shadow-inner">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700/50">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Invoice UID</p>
                            <p className="font-mono text-xl font-bold text-slate-900 dark:text-indigo-400">#{order._id.toString().slice(-12).toUpperCase()}</p>
                        </div>
                        <div className="md:text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 text-orange-500">Tracking PIN (Save This)</p>
                            <p className="font-mono text-2xl font-black text-rose-500 dark:text-rose-400 tracking-widest bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/50 inline-block">
                                {order.securityPin || '----'}
                            </p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Delivery Status</p>
                            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Fulfilled
                            </div>
                        </div>
                    </div>

                    {firstItem?.activationSteps && (
                        <div className="mb-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                <BookOpen size={14} className="text-indigo-500" /> Activation Protocol
                            </p>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {firstItem.activationSteps}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Action Button */}
                <button 
                    onClick={() => router.push('/dashboard')} 
                    className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1 active:scale-95"
                >
                    Reveal License Key <ArrowRight size={24} />
                </button>

                <p className="text-xs text-slate-400 font-bold mt-6 inline-flex items-center gap-1.5">
                    A receipt has also been dispatched to your email <ExternalLink size={12} />
                </p>
            </div>
        </div>
    );
}

export default function Success() {
    return (
        <Suspense fallback={
            <div className="py-24 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Connecting...</h2>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
