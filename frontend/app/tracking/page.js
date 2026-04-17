"use client";

import { useState } from 'react';
import axios from 'axios';
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [securityPin, setSecurityPin] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  const fetchOrder = async (idToFetch, pinToFetch = "") => {
    if (!idToFetch) return;
    setLoading(true);
    setError("");
    setOrderData(null);
    try {
      const qs = pinToFetch ? `?pin=${pinToFetch.trim()}` : '';
      const res = await axios.get(`${API_BASE_URL}/api/orders/${idToFetch.trim()}${qs}`);
      setOrderData(res.data);
    } catch (err) {
      setError(lang === 'ar' ? "رقم الطلب غير صحيح أو غير موجود." : "Invalid Order ID or order not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    fetchOrder(orderId.trim(), securityPin);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrder(idFromUrl.trim());
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {lang === 'ar' ? 'أدخل رقم الطلب الخاص بك لمتابعة الحالة واستلام الرموز.' : 'Enter your Order ID to monitor status and receive keys.'}
        </p>
      </div>

      <form onSubmit={handleTrack} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3 mb-12">
        <div className="relative flex-grow">
          <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Order ID (e.g. 64f7b...)" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-[1.25rem] py-4 pl-14 pr-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white font-mono text-sm"
          />
        </div>
        <div className="relative md:w-48">
          <input 
            type="text" 
            placeholder="PIN (Optional)" 
            value={securityPin}
            onChange={(e) => setSecurityPin(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-[1.25rem] py-4 px-6 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white font-mono text-sm text-center"
            maxLength={4}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-blue-700 text-white font-black px-8 py-4 rounded-[1.25rem] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search size={20} />
          )}
          {lang === 'ar' ? 'تتبع الآن' : 'Track Now'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-in fade-in zoom-in duration-300">
           <AlertCircle size={20} /> {error}
        </div>
      )}

      {orderData && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
           {/* Progress Tracker */}
           <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mb-8">
              <div className="flex justify-between items-center mb-10 relative">
                 <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0">
                    <div className={`h-full bg-emerald-500 transition-all duration-1000 ${orderData.status === 'success' ? 'w-full' : 'w-1/2'}`}></div>
                 </div>
                 
                 {[
                   { icon: Clock, label: lang === 'ar' ? 'تم الاستلام' : 'Placed', active: true },
                   { icon: Truck, label: lang === 'ar' ? 'جاري المعالجة' : 'Processing', active: true },
                   { icon: CheckCircle, label: lang === 'ar' ? 'تم التسليم' : 'Delivered', active: orderData.status === 'success' }
                 ].map((step, i) => (
                   <div key={i} className="flex flex-col items-center gap-3 relative z-10 w-1/3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${step.active ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                         <step.icon size={20} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{step.label}</span>
                   </div>
                 ))}
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase block leading-none mb-1">Status</span>
                       <span className={`text-sm font-black px-3 py-1 rounded-full uppercase ${orderData.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                         {orderData.status}
                       </span>
                    </div>
                    <div className="text-right flex items-center gap-4">
                       <div>
                           <span className="text-[10px] font-black text-slate-400 uppercase block leading-none mb-1">Total Payed</span>
                           <span className="text-lg font-black text-slate-900 dark:text-white">{formatPrice(orderData.totalAmount)}</span>
                       </div>
                       {orderData.isAuthorized && (
                           <button onClick={() => window.open(`${API_BASE_URL}/api/orders/${orderData._id}/invoice?pin=${securityPin}`, '_blank')} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-black transition-colors">
                               📄 PDF Invoice
                           </button>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                   {orderData.status === 'success' ? (
                     orderData.isAuthorized ? (
                         <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase block mb-3">Your Digital Assets (Reveal Only)</span>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-xs font-black bg-white dark:bg-slate-800 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800 break-all select-all cursor-copy" onClick={() => {navigator.clipboard.writeText(orderData.deliveredKey); alert("Copied!");}}>
                               {orderData.deliveredKey || 'No keys dispensed.'}
                            </p>
                            <p className="text-[10px] text-emerald-600/60 mt-2 italic">*Keep this key safe. Do not share with anyone.</p>
                         </div>
                     ) : (
                         <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-black mb-2">Security PIN Required</h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">Please enter the 4-digit PIN provided on your order success screen to unlock your digital assets and official invoice.</p>
                         </div>
                     )
                   ) : (
                     <p className="text-sm text-slate-500 text-center py-4">{lang === 'ar' ? 'الطلب لا يزال قيد المعالجة، سيظهر الرمز هنا قريباً.' : 'Order is still processing. Your key will appear here shortly.'}</p>
                   )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
