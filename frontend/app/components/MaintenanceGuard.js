"use client";
import React from 'react';
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { MonitorOff, Construction, Cpu, ShieldAlert, Sparkles } from "lucide-react";

export default function MaintenanceGuard({ children }) {
    const { settings, loading } = useSettings();
    const { user } = useAuth();
    
    // Allow admins to bypass maintenance mode
    const isAdmin = user?.role === 'admin';

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Initializing Protocol</div>
                </div>
            </div>
        );
    }

    if (settings?.maintenanceMode && !isAdmin) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
                {/* 🎨 Abstract Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                
                <div className="relative z-10 w-full max-w-2xl">
                    <div className="glass dark:bg-slate-900/40 border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl backdrop-blur-3xl text-center">
                        {/* 🏗️ Icon Section */}
                        <div className="relative w-24 h-24 mx-auto mb-10">
                            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-ping"></div>
                            <div className="relative bg-gradient-to-br from-primary to-blue-600 w-full h-full rounded-3xl flex items-center justify-center text-white shadow-2xl border border-white/20 transform rotate-12">
                                <Cpu size={40} className="animate-spin-slow" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 p-2 rounded-xl text-primary shadow-lg">
                                <Sparkles size={16} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic">
                            Elevating the <span className="text-primary not-italic">Engine</span>
                        </h1>
                        
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto mb-12 leading-relaxed">
                            We're currently performing deep-core optimizations to ensure you get the absolute best performance. We'll be back online in a flash.
                        </p>

                        {/* 📊 Status Bar */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <ShieldAlert size={20} />
                            </div>
                            <div className="flex-grow">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Protocol</div>
                                <div className="text-sm font-bold text-white">Maintenance Guard Active — 100% Secure</div>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse delay-150"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 animate-pulse delay-300"></div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                                Check Status
                            </button>
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                                Protected by {settings?.platformName || "KeeStore"} Safeguard
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            {settings?.maintenanceMode && isAdmin && (
                <div className="fixed bottom-6 left-6 z-[9999] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white/20">
                    <MonitorOff size={18} />
                    <span className="text-xs font-black uppercase tracking-tighter">Maintenance Active (Admin Bypass)</span>
                </div>
            )}
            {children}
        </>
    );
}
