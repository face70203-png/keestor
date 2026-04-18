"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Mail, Users, Eye, EyeOff, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ld5DaQsAAAAAKWShozrkpaUz-tUeztmvMXXG-U5";

function RegisterContent() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inviterName, setInviterName] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      axios.get(`${API_BASE_URL}/api/auth/referral-info/${ref}`)
        .then(res => setInviterName(res.data.username))
        .catch(() => {});
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 📱 Mobile Bypass Detection
    let finalToken = captchaToken;
    const isMobile = typeof window !== 'undefined' && (window.Capacitor || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isMobile && !finalToken) {
        finalToken = "CAPACITOR_MOBILE_APP_BYPASS";
    }

    if (!finalToken) return setError("Please verify the CAPTCHA.");

    setLoading(true);
    setError("");
    try {
      const ref = searchParams.get("ref");
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { username, email, password, ref, captchaToken: finalToken });
      
      if (res.status === 201 || res.data) {
          alert("Welcome! A 6-digit confirmation code has been sent to your email. Please login to verify.");
          router.push("/login");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl w-full max-w-md relative overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
        
        <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
               <Users size={32} />
            </div>
            <h1 className="text-3xl font-black mb-2 text-center text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mb-8 text-center">Join thousands of others today.</p>

            {inviterName && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl mb-6 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Zap size={14} fill="currentColor" />
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  You were invited by <span className="text-primary">{inviterName}</span>
                </p>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 font-medium text-center">{error}</div>}

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
            
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 font-medium placeholder-slate-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
            </div>

            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 font-medium placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
            </div>
            
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 font-medium placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* 🤖 ReCAPTCHA Verification */}
            <div className="flex justify-center my-4 scale-95 origin-center">
                <ReCAPTCHA 
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY} 
                  onChange={(token) => setCaptchaToken(token)}
                  theme="light"
                />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 shadow-lg text-white py-4 rounded-xl font-bold mt-2 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? "Creating Profile..." : "Sign Up Securely"}
            </button>
            </form>

            <p className="text-center text-slate-500 mt-8 font-medium">
            Already have an account? <Link href="/login" className="text-primary hover:text-blue-700 font-bold transition-colors">Sign in</Link>
            </p>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[80vh] font-bold text-slate-500">Loading Registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
