"use client";

import Link from "next/link";
import { Key, LayoutDashboard, LogIn, LogOut, ShieldCheck, ShoppingCart, Globe, Sun, Moon, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { translations } from "../../translations";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentCurrencyInfo, formatPrice } = useCurrency();
  const t = translations[lang].nav;
  
  // 🔍 Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/search?q=${searchQuery}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 py-3 px-4 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-grow">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-10 w-auto flex items-center min-w-[32px]">
              <img src="/logo.png" alt="Store Logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} className="h-full w-auto object-contain z-10 drop-shadow-sm max-w-[150px]" />
              <div className="hidden items-center gap-2 z-0">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-all">
                    <Key size={16} className="rotate-45" />
                 </div>
              </div>
          </div>
        </Link>

        {/* 🔍 Professional Live Search */}
        <div className="hidden lg:relative lg:flex flex-grow max-w-md mx-4" ref={searchRef}>
          <div className="relative w-full">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder={lang === 'ar' ? "ابحث عن ملفات، سيارات، سكريبتات..." : "Search for assets, scripts, maps..."}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => searchQuery.length > 1 && setShowResults(true)}
               className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl py-2.5 pl-12 pr-10 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
             />
             {searchQuery && (
               <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                 <X size={14} />
               </button>
             )}
          </div>

          {/* Search Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
               {isSearching ? (
                 <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50">
                   <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="mt-2 text-xs font-bold text-slate-500">{lang === 'ar' ? 'جاري البحث...' : 'Scanning inventory...'}</p>
                 </div>
               ) : searchResults.length > 0 ? (
                 <div className="max-h-[70vh] overflow-y-auto">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'ar' ? 'نتائج البحث' : 'Top Results'}</span>
                    </div>
                    {searchResults.map(p => (
                      <Link key={p._id} href={`/products/${p._id}`} onClick={() => setShowResults(false)} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                         <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 relative">
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                         </div>
                         <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{p.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-xs font-black text-primary">{formatPrice(p.price)}</span>
                               <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold uppercase">{p.category}</span>
                            </div>
                         </div>
                      </Link>
                    ))}
                    <Link href={`/products?search=${searchQuery}`} className="block p-4 text-center text-xs font-black text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-primary/5 uppercase tracking-wide">
                       {lang === 'ar' ? `رؤية جميع النتائج لـ "${searchQuery}"` : `See All Results for "${searchQuery}"`}
                    </Link>
                 </div>
               ) : (
                 <div className="p-8 text-center text-slate-400">
                    <p className="text-sm font-bold">{lang === 'ar' ? 'لا توجد نتائج' : 'No matches found'}</p>
                    <p className="text-xs mt-1">{lang === 'ar' ? 'جرب البحث عن شيء آخر' : 'Try different keywords'}</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-6">
            <Link href="/about" className="text-slate-600 dark:text-slate-300 hover:text-primary font-bold transition-colors">{t.about}</Link>
            <Link href="/tracking" className="text-slate-600 dark:text-slate-300 hover:text-primary font-bold transition-colors">
               {lang === 'ar' ? 'تتبع الطلب' : 'Tracking'}
            </Link>
            <Link href="/faq" className="text-slate-600 dark:text-slate-300 hover:text-primary font-bold transition-colors flex items-center gap-1">
               {lang === 'ar' ? 'المساعدة' : 'Support'}
            </Link>
        </div>
        
        <div className="flex items-center gap-2">
            {/* 🌍 Language Toggle */}
            <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-black uppercase">
                <Globe size={18} className="text-primary"/>
                <span className="hidden sm:inline">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* 💱 Currency Badge */}
            {currentCurrencyInfo && (
              <Link href="/dashboard#settings" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-700">
                <span>{currentCurrencyInfo.flag}</span>
                <span>{currentCurrencyInfo.symbol}</span>
              </Link>
            )}

            {/* 🌙 Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-yellow-400 hover:scale-110"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            {/* 🛒 Cart */}
            <Link href="/cart" className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartItemsCount}
                  </span>
              )}
            </Link>
        </div>
        
        {!loading && user ? (
          <>
             {user.role === 'admin' ? (
                 <Link href="/admin" className="text-primary hover:text-blue-700 font-bold transition-colors flex items-center gap-2">
                   <ShieldCheck size={20} />
                   <span className="hidden sm:inline">Admin</span>
                 </Link>
             ) : (
                 <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors flex items-center gap-2">
                   <LayoutDashboard size={20} />
                   <span className="hidden sm:inline">{t.dashboard}</span>
                 </Link>
             )}
            
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-full pl-4 pr-1 py-1 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
               <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.username}</span>
               <button onClick={logout} className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors" title="Logout">
                 <LogOut size={16} strokeWidth={2.5} />
               </button>
            </div>
          </>
        ) : !loading ? (
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary font-bold flex items-center gap-2 transition-colors">
              <LogIn size={18} /> {t.login}
            </Link>
            <Link href="/register" className="bg-slate-900 dark:bg-primary hover:bg-slate-800 shadow-lg text-white px-5 py-2 rounded-xl font-bold transition-transform hover:-translate-y-0.5">
              {t.register}
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
