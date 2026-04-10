"use client";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang].contact;
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
                    <p className="text-slate-900 font-bold" dir="ltr">+1 (555) 123-4567</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 items-center">
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl flex-shrink-0"><MapPin size={24}/></div>
                <div>
                    <h4 className="font-bold text-slate-500 text-xs tracking-wider uppercase mb-1">{t.hq}</h4>
                    <p className="text-slate-900 font-bold">123 Tech Avenue, NY</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
            <h3 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">{t.sendMessage}</h3>
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! Our team will reply shortly."); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input type="text" placeholder={t.namePlaceholder} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                    <input type="email" placeholder={t.emailPlaceholder} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                </div>
                <input type="text" placeholder={t.subjectPlaceholder} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full" required />
                <textarea rows="5" placeholder={t.msgPlaceholder} className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 outline-none focus:border-primary transition-colors text-slate-900 font-medium placeholder-slate-400 w-full resize-none" required></textarea>
                <button type="submit" className="bg-slate-900 hover:bg-black shadow-lg shadow-slate-200 text-white py-4 rounded-xl font-bold transition-all self-start px-12 mt-2">
                    {t.sendBtn}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
