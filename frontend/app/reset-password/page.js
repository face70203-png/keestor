"use client";
import { useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ResetContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const { addToast } = useToast();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
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
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">New Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirm} 
                      onChange={(e) => setConfirm(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" 
                    />
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
