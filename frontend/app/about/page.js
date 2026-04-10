"use client";
import { ShieldCheck, Target, Zap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = translations[lang].about;
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-5xl font-black mb-6 text-slate-900 tracking-tight">{lang === 'ar' ? 'حول' : 'About'} <span className="text-primary">KeeStore</span></h1>
      <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium">
        {t.subtitle}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
           <h2 className="text-3xl font-black mb-4 text-slate-900">{t.visionTitle}</h2>
           <p className="text-slate-500 leading-relaxed font-medium">
             {t.visionDesc}
           </p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
            <Target className="text-primary mb-4" size={48} />
            <h3 className="text-xl font-black text-slate-900">{t.precision}</h3>
        </div>
      </div>

      <h2 className="text-3xl font-black mb-8 text-slate-900">{t.whyTrust}</h2>
      <div className="flex flex-col gap-6">
         <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex gap-6 items-center transition-all hover:shadow-md">
             <div className="bg-blue-50 p-4 rounded-xl text-primary flex-shrink-0"><Zap size={32} /></div>
             <div>
                 <h4 className="text-xl font-black mb-2 text-slate-900">{lang === 'ar' ? 'تسليم فوري' : 'Instant Fulfillment'}</h4>
                 <p className="text-slate-500 font-medium">{t.instantDesc}</p>
             </div>
         </div>
         <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex gap-6 items-center transition-all hover:shadow-md">
             <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600 flex-shrink-0"><ShieldCheck size={32} /></div>
             <div>
                 <h4 className="text-xl font-black mb-2 text-slate-900">{lang === 'ar' ? 'بدون مساومات أمنية' : 'Zero Compromise on Security'}</h4>
                 <p className="text-slate-500 font-medium">{t.securityDesc}</p>
             </div>
         </div>
      </div>
    </div>
  );
}
