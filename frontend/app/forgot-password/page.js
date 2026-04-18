"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "../context/ToastContext";
import ReCAPTCHA from "react-google-recaptcha";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ld5DaQsAAAAAKWShozrkpaUz-tUeztmvMXXG-U5";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [captchaToken, setCaptchaToken] = useState(null);
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [error, setError] = useState("");
    const { addToast } = useToast();
    const recaptchaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Starting submission for password recovery...");

        // 📱 Mobile Bypass Detection
        let finalToken = captchaToken;
        const isMobile = typeof window !== 'undefined' && (window.Capacitor || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isMobile && !finalToken) {
            finalToken = "CAPACITOR_MOBILE_APP_BYPASS";
        }

        if (!finalToken) {
            console.log("Error: CAPTCHA not verified.");
            return addToast("Please verify the CAPTCHA.", "error");
        }

        setStatus("loading");
        try {
            console.log("Sending request to backend...");
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email, captchaToken: finalToken });
            console.log("Request successful.");
            setStatus("success");
            addToast("Recovery email dispatched!", "success");
        } catch (err) {
            console.error("Submission failed:", err);
            const errMsg = err.response?.data?.error || "Error sending email. Please try again.";
            setStatus("error");
            setError(errMsg);
            addToast(errMsg, "error");
            if (recaptchaRef.current) recaptchaRef.current.reset();
            setCaptchaToken(null);
        } finally {
            console.log("Submission process finished.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <KeyRound size={20} className="rotate-45" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">KeeStore</span>
            </Link>

            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-slate-200 w-full max-w-md">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Recover Digital Vault</h1>
                <p className="text-slate-500 mb-8">Enter your registered email address and we'll send you an authorized reset link.</p>

                {status === "success" ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
                        <h3 className="font-bold text-emerald-800 mb-2">Secure Link Sent!</h3>
                        <p className="text-sm text-emerald-600 mb-4">Please check your inbox (and spam folder) for the password reset instructions.</p>
                        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"><ArrowLeft size={16}/> Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address</label>
                            <input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              required 
                              placeholder="agent@example.com" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" 
                            />
                        </div>

                        {/* 🤖 Hide ReCAPTCHA on Mobile */}
                        {typeof window !== 'undefined' && !(window.Capacitor || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                          <div className="flex justify-center my-2">
                               <ReCAPTCHA
                                   ref={recaptchaRef}
                                   sitekey={RECAPTCHA_SITE_KEY}
                                   onChange={(token) => setCaptchaToken(token)}
                               />
                          </div>
                        )}

                        <button type="submit" disabled={status==='loading'} className="w-full bg-slate-900 hover:bg-black shadow-lg text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 mt-2">
                           {status === 'loading' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending Reset Link...
                              </div>
                           ) : "Send Reset Link"}
                        </button>

                        {status === 'success' && (
                           <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in zoom-in duration-300">
                              <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
                                 <ShieldCheck size={18}/> Reset link sent! Please check your inbox and spam folder.
                              </p>
                           </div>
                        )}

                        {status === 'error' && (
                           <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in zoom-in duration-300">
                              <p className="text-red-700 text-sm font-bold">
                                 {error || "Failed to initiate reset. Please check your email and try again."}
                              </p>
                           </div>
                        )}
                    </form>
                )}
            </div>
            
            <Link href="/login" className="mt-8 text-slate-500 hover:text-slate-900 font-bold transition flex items-center gap-2"><ArrowLeft size={16}/> Cancel and return</Link>
        </div>
    );
}
