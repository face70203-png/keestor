"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

const NAMES = ["Ahmed", "John", "Mickael", "Youssef", "Sami", "Abdullah", "Marco", "Elena", "Liam", "Sophia"];
const ITEMS = ["Advanced Police System", "Custom Rim Pack", "Realistic Handling V2", "LS Customs MLO", "Premium HUD", "Anti-Cheat Pro"];

export default function SalesNotifications() {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { lang } = useLanguage();
  const { currentCurrencyInfo } = useCurrency();

  useEffect(() => {
    const showRandomNotification = () => {
      // Pick random data
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const timeAgo = Math.floor(Math.random() * 59) + 1;
      const price = (Math.random() * 50 + 10).toFixed(2);

      setCurrentNotification({ name, item, timeAgo, price });
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Initial delay
    const initialDelay = setTimeout(showRandomNotification, 10000);

    // Set interval for next notifications
    const interval = setInterval(() => {
      showRandomNotification();
    }, 25000 + Math.random() * 20000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  if (!currentNotification) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px] max-w-[350px]">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 relative">
           <ShoppingBag size={24} />
           <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-slate-900">
             <CheckCircle size={10} className="text-white" />
           </div>
        </div>
        
        <div className="flex-grow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Zap size={10} className="text-yellow-500 fill-yellow-500" />
            {lang === 'ar' ? 'عملية شراء ناجحة' : 'Successful Purchase'}
          </p>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            <span className="text-primary">{currentNotification.name}</span> {lang === 'ar' ? 'اشترى للتو' : 'just purchased'}
          </p>
          <p className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">{currentNotification.item}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold italic">
            {currentNotification.timeAgo} {lang === 'ar' ? 'دقيقة مضت' : 'minutes ago'}
          </p>
        </div>
      </div>
    </div>
  );
}
