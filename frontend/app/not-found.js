"use client";

import Link from 'next/link';
import { Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="relative mb-8">
        <h1 className="text-[12rem] font-black text-slate-100 dark:text-slate-800 leading-none select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-bounce">
              <AlertTriangle size={60} className="text-primary" />
           </div>
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
        {lang === 'ar' ? 'عذراً، هذه الصفحة غير موجودة' : 'Oops! Page Not Found'}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 text-lg">
        {lang === 'ar' 
          ? 'قد يكون الرابط الذي اتبعته معطلاً أو تمت إزالة الصفحة. لا تقلق، لنعد إلى المسار الصحيح.' 
          : 'The link you followed might be broken, or the page has been removed. Don\'t worry, let\'s get back on track.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-transform hover:-translate-y-1 shadow-lg shadow-primary/25">
           <Home size={20} /> {lang === 'ar' ? 'الرئيسية' : 'Go Home'}
        </Link>
        <Link href="/products" className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-transform hover:-translate-y-1">
           <Search size={20} /> {lang === 'ar' ? 'تصفح الأصناف' : 'Browse Assets'}
        </Link>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="mt-12 text-slate-400 hover:text-primary font-bold transition-colors flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} /> {lang === 'ar' ? 'العودة للخلف' : 'Go Back'}
      </button>
    </div>
  );
}
