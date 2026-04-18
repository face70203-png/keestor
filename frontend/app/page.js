"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Download, X, Smartphone, ShieldAlert } from 'lucide-react';
import ProductGrid from './components/ProductGrid';
import { useLanguage } from './context/LanguageContext';
import { translations } from '../translations';

export default function Home() {
  const { lang, dir } = useLanguage();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const t = translations[lang].home;

  const features = {
    en: [
        { title: "Instant Delivery", desc: "Your digital keys are securely deposited to your account within milliseconds of payment.", icon: <Zap size={32}/>, color: "bg-blue-50 text-primary" },
        { title: "100% Verified", desc: "All assets are manually checked by our team to guarantee performance without errors.", icon: <ShieldCheck size={32}/>, color: "bg-emerald-50 text-emerald-600" },
        { title: "Unlimited Access", desc: "Log into your dashboard anytime to recover your purchased keys and licenses.", icon: <Download size={32}/>, color: "bg-purple-50 text-purple-600" }
    ],
    ar: [
        { title: "تسليم فوري", desc: "يتم إيداع مفاتيحك الرقمية بأمان في حسابك في غضون أجزاء من الثانية من الدفع.", icon: <Zap size={32}/>, color: "bg-blue-50 text-primary" },
        { title: "موثق 100%", desc: "يتم فحص جميع الأصول يدويًا من قبل فريقنا لضمان الأداء دون أخطاء.", icon: <ShieldCheck size={32}/>, color: "bg-emerald-50 text-emerald-600" },
        { title: "وصول غير محدود", desc: "سجل الدخول إلى لوحة التحكم الخاصة بك في أي وقت لاستعادة مفاتيحك المشتراة.", icon: <Download size={32}/>, color: "bg-purple-50 text-purple-600" }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full rounded-[40px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center py-32 px-6 mb-20 shadow-2xl">
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="z-10 max-w-4xl">
           <span className="bg-blue-500/20 text-blue-300 font-bold px-4 py-1.5 rounded-full text-sm inline-block mb-6 border border-blue-400/20 shadow-sm backdrop-blur-sm">
             {lang === 'ar' ? 'أدوات رقمية وألعاب عالية الجودة' : 'Premium Quality Games & Digital Assets'}
           </span>
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
             {t.heroTitle}
           </h1>
           <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
             {t.heroSubtitle}
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
               <Link href="/products" className="w-full sm:w-auto bg-primary hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 text-lg">
                   {t.ctaStore} <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''}/>
               </Link>
               <Link href="/about" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center text-lg">
                   {lang === 'ar' ? 'عرض المميزات' : 'View Features'}
               </Link>
               <button 
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full sm:w-auto bg-[#3DDC84]/10 hover:bg-[#3DDC84]/20 text-[#3DDC84] border border-[#3DDC84]/30 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-lg backdrop-blur-md"
               >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.523 15.3414C17.1528 15.3414 16.8525 15.0411 16.8525 14.6709C16.8525 14.3006 17.1528 14.0003 17.523 14.0003C17.8932 14.0003 18.1936 14.3006 18.1936 14.6709C18.1936 15.0411 17.8932 15.3414 17.523 15.3414ZM6.4716 15.3414C6.10134 15.3414 5.80105 15.0411 5.80105 14.6709C5.80105 14.3006 6.10134 14.0003 6.4716 14.0003C6.84186 14.0003 7.14214 14.3006 7.14214 14.6709C7.14214 15.0411 6.84186 15.3414 6.4716 15.3414ZM17.7551 10.6033L19.5398 7.51868C19.6469 7.33321 19.5833 7.0954 19.3978 6.98826C19.2124 6.88111 18.9746 6.94463 18.8674 7.13011L17.0674 10.2458C15.5414 9.5518 13.8291 9.15509 12 9.15509C10.1709 9.15509 8.45862 9.5518 6.93256 10.2458L5.13256 7.13011C5.02542 6.94463 4.78762 6.88111 4.60214 6.98826C4.41666 7.0954 4.35314 7.33321 4.46028 7.51868L6.24495 10.6033C2.71616 12.5445 0.320499 16.2084 0 20.4852H24C23.6795 16.2084 21.2838 12.5445 17.7551 10.6033Z"/>
                   </svg>
                   {lang === 'ar' ? 'تطبيق الأندرويد' : 'Android App'}
               </button>
           </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
         {features[lang].map((f, i) => (
            <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
         ))}
      </section>

      <section className="mb-20">
         <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
             <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{lang === 'ar' ? 'أحدث الإصدارات' : 'Featured Drops'}</h2>
                <p className="text-slate-500 mt-2 font-medium">{lang === 'ar' ? 'أكثر العناصر رواجا حاليا في مجتمعنا.' : 'The hottest items currently trending in our community.'}</p>
             </div>
             <Link href="/products" className="text-primary font-bold hover:text-blue-700 flex items-center gap-1 group">
                {lang === 'ar' ? 'عرض الكل' : 'View All'} <ArrowRight size={18} className={`group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
             </Link>
         </div>
         <ProductGrid />
      </section>

      {/* App Download Security Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir={dir}>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowDownloadModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
             
             {/* Header */}
             <div className="p-8 pb-4 flex justify-between items-start">
                 <div className="w-16 h-16 bg-[#3DDC84]/10 rounded-2xl flex items-center justify-center text-[#3DDC84]">
                    <Smartphone size={32} />
                 </div>
                 <button onClick={() => setShowDownloadModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                    <X size={20} />
                 </button>
             </div>

             {/* Content */}
             <div className="px-8 pb-8">
                <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-sm tracking-wide uppercase">
                    <ShieldCheck size={16} /> Verified & Secured
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {t.downloadTitle}
                </h2>
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3 mb-6">
                   <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                   <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                     {t.downloadDesc}
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                   <a 
                     href="/KeeStore.apk" 
                     download 
                     onClick={() => setShowDownloadModal(false)}
                     className="flex-grow bg-[#3DDC84] hover:bg-[#34c776] text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-[#3DDC84]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                   >
                      <Download size={20} /> {t.downloadBtn}
                   </a>
                   <button 
                     onClick={() => setShowDownloadModal(false)}
                     className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                   >
                     {t.downloadCancel}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
