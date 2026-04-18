"use client";
import { useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

function ResetContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { addToast } = useToast();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return addToast("Passwords do not match", "error");
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, newPassword: password });
            addToast("Your password has been successfully reset. Access restored.", "success");
            router.push("/login");
        } catch(err) {
            const errorMsg = err.response?.data?.error || "Expired or invalid link.";
            addToast(errorMsg, "error");
            
            // 🛡️ Redirect to forgot password after 2 seconds if token is expired
            if (errorMsg.includes("expired") || errorMsg.includes("invalid")) {
                setTimeout(() => router.push("/forgot-password"), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center p-10 bg-card border border-theme rounded-[2rem] shadow-xl">
                 <p className="text-theme font-black text-xl mb-4">Invalid Reset Link</p>
                 <button onClick={() => router.push("/forgot-password")} className="text-primary font-bold hover:underline">Request a new link</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-slate-200 w-full max-w-md">
            <h1 className="text-3xl font-black text-slate-900 mb-2">New Master Key</h1>
            <p className="text-slate-500 mb-8">Secure your vault with a strong new password.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                    <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          placeholder="••••••••" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 outline-none focus:border-primary text-slate-900" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm Password</label>
                    <div className="relative">
                        <input 
                          type={showConfirm ? "text" : "password"} 
                          value={confirm} 
                          onChange={(e) => setConfirm(e.target.value)} 
                          required 
                          placeholder="••••••••" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 outline-none focus:border-primary text-slate-900" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-700 shadow-lg text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 mt-2 flex justify-center items-center gap-2">
                   {loading ? "Rehashing..." : "Finalize Reset"} <ArrowRight size={18}/>
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <KeyRound size={20} className="rotate-45" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">KeeStore</span>
            </Link>
            <Suspense fallback={<div>Loading Configuration...</div>}>
               <ResetContent />
            </Suspense>
        </div>
    );
}
