"use client";

import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FAQ_DATA = {
  en: [
    { q: "How do I receive my digital product?", a: "Immediately after a successful payment, your digital keys will be displayed on the screen and also sent to your registered email address and dashboard." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe, as well as local wallet systems for maximum convenience." },
    { q: "Can I get a refund for a digital asset?", a: "Refunds are generally only available if the digital key is proven to be defective. Once a key is revealed, it is considered consumed." },
    { q: "How do I set up my FiveM script?", a: "Each product comes with a 'Setup Guide' link in your dashboard. You can also contact our support team via live chat or tickets." }
  ],
  ar: [
    { q: "كيف أستلم المنتج الرقمي؟", a: "فور إتمام عملية الدفع بنجاح، ستظهر الرموز (Keys) على الشاشة، كما ستصلك نسخة إلى بريدك الإلكتروني المعتمد ولوحة التحكم الخاصة بك." },
    { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل جميع البطاقات الائتمانية عبر Stripe، بالإضافة إلى أنظمة المحفظة المحلية لراحتك التامة." },
    { q: "هل يمكنني استرداد المبلغ؟", a: "عادةً ما يكون الاسترجاع متاحاً فقط في حال ثبت وجود خلل في الرمز الرقمي. بمجرد الكشف عن الرمز، يعتبر المنتج قد استُخدم." },
    { q: "كيف أقوم بتثبيت السكريبتات الخاصة بـ FiveM؟", a: "كل منتج معه رابط 'دليل الإعداد' في لوحة التحكم. كما يمكنك التواصل مع فريق الدعم عبر التذاكر أو المحادثة المباشرة." }
  ]
};

export default function FAQPage() {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const data = FAQ_DATA[lang];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <HelpCircle size={14} /> Help Center
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
           {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
         </h1>
         <p className="text-slate-500 dark:text-slate-400 text-lg">
           {lang === 'ar' ? 'كل ما تحتاج لمعرفته حول KeeStore في مكان واحد.' : 'Everything you need to know about KeeStore in one place.'}
         </p>
      </div>

      <div className="space-y-4">
        {data.map((item, i) => (
          <div 
            key={i} 
            className={`group bg-white dark:bg-slate-900 border ${openIndex === i ? 'border-primary shadow-xl shadow-primary/5' : 'border-slate-100 dark:border-slate-800'} rounded-3xl overflow-hidden transition-all duration-300`}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <span className={`text-lg font-bold transition-colors ${openIndex === i ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                {item.q}
              </span>
              <div className={`p-2 rounded-xl transition-all ${openIndex === i ? 'bg-primary text-white rotate-180' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-100'}`}>
                <ChevronDown size={20} />
              </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 pb-6 pt-2 text-slate-500 dark:text-slate-400 text-base leading-relaxed border-t border-slate-50 dark:border-slate-800/50 mt-2">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Support CTA */}
      <div className="mt-20 bg-slate-900 dark:bg-primary rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Zap size={140} />
         </div>
         <h2 className="text-3xl font-black mb-4 relative z-10">{lang === 'ar' ? 'ما زلت تبحث عن إجابة؟' : 'Still looking for an answer?'}</h2>
         <p className="text-white/70 mb-8 relative z-10">{lang === 'ar' ? 'فريق الدعم متاح على مدار الساعة لمساعدتك.' : 'Our support team is available 24/7 to help you with any issues.'}</p>
         <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center gap-2">
               <MessageCircle size={18} /> {lang === 'ar' ? 'فتح تذكرة دعم' : 'Open Support Ticket'}
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black text-sm transition-colors">
               {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </button>
         </div>
      </div>
    </div>
  );
}
