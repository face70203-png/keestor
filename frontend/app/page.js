"use client";
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Download } from 'lucide-react';
import ProductGrid from './components/ProductGrid';
import { useLanguage } from './context/LanguageContext';
import { translations } from '../translations';

export default function Home() {
  const { lang } = useLanguage();
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
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/products" className="w-full sm:w-auto bg-primary hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 text-lg">
                   {t.ctaStore} <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''}/>
               </Link>
               <Link href="/about" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center text-lg">
                   {lang === 'ar' ? 'عرض المميزات' : 'View Features'}
               </Link>
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
    </div>
  );
}
