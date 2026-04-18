"use client";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";
import { useState } from "react";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang].contact;
  const { addToast } = useToast();

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/contact`, formData);
      addToast(res.data.message || "Message sent successfully!", "success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to send message.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-slate-900 tracking-tight">{lang === 'ar' ? 'لنبق على' : "Let's Get in"} <span className="text-primary">{lang === 'ar' ? 'تواصل' : 'Touch'}</span></h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                <div className="bg-blue-50 text-primary p-4 rounded-xl flex-shrink-0"><Mail size={24}/></div>
                <div>
                    <h4 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-1">{t.email}</h4>
                    <p className="text-slate-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">yassinkhaled193@gmail.com</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex-shrink-0"><Phone size={24}/></div>
                <div>
                    <h4 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-1">{t.phone}</h4>
                    <p className="text-slate-900 font-bold" dir="ltr">+1 (555) Kee-Store</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl flex-shrink-0"><MapPin size={24}/></div>
                <div>
                    <h4 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-1">{t.hq}</h4>
                    <p className="text-slate-900 font-bold">KeeStore Digital Hub</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
            <h3 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">{t.sendMessage}</h3>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input name="name" type="text" placeholder={t.namePlaceholder} value={formData.name} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                    <input name="email" type="email" placeholder={t.emailPlaceholder} value={formData.email} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                </div>
                <input name="subject" type="text" placeholder={t.subjectPlaceholder} value={formData.subject} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                <textarea name="message" rows="5" placeholder={t.msgPlaceholder} value={formData.message} onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full resize-none" required></textarea>
                <button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 text-white py-4 rounded-xl font-bold transition-all self-start px-12 mt-2 flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</> : t.sendBtn}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
