"use client";

import Link from "next/link";
import { Key, LayoutDashboard, LogIn, LogOut, ShieldCheck, ShoppingCart, Globe, Sun, Moon, Search, X, Menu, ArrowUpRight, Settings, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { translations } from "../../translations";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentCurrencyInfo, formatPrice, allRates, currency, changeCurrency } = useCurrency();
  const t = translations[lang].nav;
  
  // 🔍 Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
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
  <>
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 py-3 px-4 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-grow">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-10 w-auto flex items-center min-w-[32px]">
              <img src="/logo.png" alt="Store Logo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} className="h-full w-auto object-contain z-10 drop-shadow-sm max-w-[120px] md:max-w-[150px]" />
              <div className="hidden items-center gap-2 z-0">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-all">
                    <Key size={16} className="rotate-45" />
                 </div>
              </div>
          </div>
        </Link>
               {/* 📱 Mobile Menu Trigger */}
        <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={24} />
        </button>

        {/* 🔍 Professional Live Search (Desktop Only) */}
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

            {/* 💱 Smart Currency Selector */}
            {currentCurrencyInfo && (
              <div className="relative">
                <button 
                  onClick={() => setIsCurrencyPickerOpen(!isCurrencyPickerOpen)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <span className="text-sm">{currentCurrencyInfo.flag}</span>
                  <span>{currentCurrencyInfo.symbol}</span>
                </button>

                {isCurrencyPickerOpen && (
                   <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                         <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder={lang === 'ar' ? "ابحث عن عملة..." : "Search all currencies..."}
                              value={currencySearch}
                              onChange={(e) => setCurrencySearch(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                            />
                         </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin">
                         {Object.entries(allRates || {})
                           .filter(([code]) => code.toLowerCase().includes(currencySearch.toLowerCase()))
                           .slice(0, currencySearch ? 100 : 15) // Limit initial list for performance
                           .map(([code, rate]) => {
                             const isSelected = currency === code;
                             return (
                               <button 
                                 key={code} 
                                 onClick={() => { changeCurrency(code); setIsCurrencyPickerOpen(false); }}
                                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                               >
                                 <div className="flex items-center gap-3">
                                    <span className="text-lg opacity-80">{code === 'USD' ? '🇺🇸' : code === 'EUR' ? '🇪🇺' : code === 'EGP' ? '🇪🇬' : '🌐'}</span>
                                    <span className="font-bold text-sm tracking-tight">{code}</span>
                                 </div>
                                 <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">{rate.toFixed(2)} / $</span>
                               </button>
                             );
                         })}
                      </div>
                   </div>
                )}
              </div>
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

             {/* 🔍 Mobile Search Trigger */}
            <button onClick={() => setIsSearchOverlayOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                <Search size={22} />
            </button>

            {/* 🛒 Cart */}
        </div>
        
        {/* 📱 Mobile Top Quick Actions */}
        <div className="flex lg:hidden items-center gap-2">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/cart" className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <ShoppingCart size={18} />
              {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                  {cartItemsCount}
                  </span>
              )}
            </Link>
        </div>

        {!loading && user ? (
          <div className="hidden lg:flex items-center gap-3 relative" ref={profileRef}>
            {/* 👤 Profile Trigger */}
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1 pr-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all border border-slate-200 dark:border-slate-700 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary border-2 border-white dark:border-slate-900 shadow-sm relative">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-black">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 hidden md:inline group-hover:text-primary transition-colors">{user.username}</span>
            </button>

            {/* 🔽 Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-2 z-[60] animate-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Identity Verified</p>
                  <p className="text-sm font-black truncate text-slate-900 dark:text-white">{user.username}</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <Link href="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{lang === 'ar' ? 'لوحة التحكم' : 'Client Area'}</span>
                    </div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  
                  <Link href="/dashboard?tab=settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all">
                    <Settings size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{lang === 'ar' ? 'الإعدادات' : 'Security Settings'}</span>
                  </Link>
  
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary/10 group transition-all">
                      <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-black italic">COMMAND CENTER</span>
                    </Link>
                  )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2" />
                
                <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 group transition-all">
                  <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                  <span className="text-sm font-bold text-red-500 group-hover:text-red-700">Terminate Session</span>
                </button>
              </div>
            )}
          </div>
        ) : !loading ? (
          <div className="hidden lg:flex items-center gap-4 shrink-0">
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

    {/* 📱 Premium Mobile Bottom Navigation */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6 pt-2">
       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl flex items-center justify-around py-3">
          <Link href="/" className="flex flex-col items-center gap-1 group">
             <Key size={20} className="text-slate-400 group-focus:text-primary group-active:text-primary transition-colors" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Home</span>
          </Link>
          <button onClick={() => setIsSearchOverlayOpen(true)} className="flex flex-col items-center gap-1 group">
             <Search size={20} className="text-slate-400 group-focus:text-primary transition-colors" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Search</span>
          </button>
          <Link href="/cart" className="flex flex-col items-center gap-1 group relative">
             <ShoppingCart size={20} className="text-slate-400 group-focus:text-primary transition-colors" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Cart</span>
             {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartItemsCount}
                </span>
             )}
          </Link>
          {user ? (
            <button onClick={() => setIsProfileDropdownOpen(true)} className="flex flex-col items-center gap-1 group">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700">
                   {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <div className="text-[10px] flex items-center justify-center h-full text-slate-500">{user.username?.charAt(0)}</div>}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profile</span>
            </button>
          ) : (
            <Link href="/login" className="flex flex-col items-center gap-1 group">
                <LogIn size={20} className="text-slate-400 group-focus:text-primary transition-colors" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Join</span>
            </Link>
          )}
       </div>
    </div>

    {/* 🔍 Fullscreen Search Overlay (Mobile/Tablet) */}
    {isSearchOverlayOpen && (
       <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className="relative flex-grow">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder={lang === 'ar' ? 'ابحث عن أي شيء...' : 'Search for anything...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white font-bold outline-none ring-2 ring-primary/10"
                />
             </div>
             <button onClick={() => setIsSearchOverlayOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase text-slate-500">
                {lang === 'ar' ? 'إغلاق' : 'Close'}
             </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
             {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Searching Ecosystem...</p>
                </div>
             ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                   {searchResults.map(p => (
                      <Link key={p._id} href={`/products/${p._id}`} onClick={() => setIsSearchOverlayOpen(false)} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200">
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-grow">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1">{p.title}</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-black text-primary">{formatPrice(p.price)}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">{p.category}</span>
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>
             ) : searchQuery.length > 1 ? (
                <div className="py-20 text-center">
                   <p className="font-black text-slate-300 dark:text-slate-700 text-4xl uppercase tracking-tighter mb-2 italic">No Result</p>
                   <p className="text-slate-500 text-sm font-bold">Try searching for Cars, Scripts, or Maps</p>
                </div>
             ) : (
                <div className="py-10">
                   <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-6 px-2">Popular Searches</h5>
                   <div className="flex flex-wrap gap-2">
                      {['Scripts', 'Cars', 'Maps', 'Packages', 'Keys'].map(tag => (
                         <button key={tag} onClick={() => setSearchQuery(tag)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-sm text-slate-600 dark:text-slate-300">
                            {tag}
                         </button>
                      ))}
                   </div>
                </div>
             )}
          </div>
       </div>
    )}

    {/* 📱 Mobile Drawer Overlay */}
    {isMenuOpen && (
       <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300">
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 p-6 flex flex-col">
             <div className="flex justify-between items-center mb-10">
                <div className="font-black text-2xl tracking-tighter italic text-slate-900 dark:text-white">Kee<span className="text-primary font-black uppercase not-italic">Store</span></div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <X size={24} />
                </button>
             </div>

             <div className="space-y-4 overflow-y-auto flex-grow pb-10" onClick={() => setIsMenuOpen(false)}>
                <div className="relative mb-8" onClick={(e) => e.stopPropagation()}>
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                      value={searchQuery}
                      onFocus={() => router.push('/products')}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                </div>

                 {user && (
                    <div className="bg-subtle p-6 rounded-[2rem] border border-theme mb-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-primary border-2 border-white dark:border-slate-800 shadow-xl">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xl font-black">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-theme truncate w-32">{user.username}</h4>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest">{user.role}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <Link href="/dashboard" className="bg-card p-3 rounded-2xl text-center text-xs font-black shadow-sm border border-theme">DASHBOARD</Link>
                             <Link href="/dashboard/settings" className="bg-card p-3 rounded-2xl text-center text-xs font-black shadow-sm border border-theme">SETTINGS</Link>
                        </div>
                    </div>
                )}

                <Link href="/" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">
                    <Key size={20} className="text-primary"/>
                    <span>{lang === 'ar' ? 'الرئيسية' : 'Marketplace'}</span>
                </Link>
                <Link href="/about" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">
                    <Globe size={20} className="text-emerald-500"/>
                    <span>{t.about}</span>
                </Link>
                <Link href="/tracking" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">
                    <Search size={20} className="text-blue-500"/>
                    <span>{lang === 'ar' ? 'تتبع الطلب' : 'Global Tracking'}</span>
                </Link>
                <Link href="/faq" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">
                    <ShieldCheck size={20} className="text-purple-500"/>
                    <span>{lang === 'ar' ? 'المساعدة' : 'Legal & Help'}</span>
                </Link>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />

                <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={toggleLanguage} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-black text-xs uppercase">
                        <Globe size={20} className="text-primary"/>
                        {lang === 'en' ? 'Arabic' : 'English'}
                    </button>
                    <button onClick={toggleTheme} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-black text-xs uppercase">
                        {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                {!loading && user ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black">
                                {user.username?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{user.username}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role}</span>
                            </div>
                        </div>
                        <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center font-bold bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            {t.login}
                        </Link>
                        <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-center font-black bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                            {t.register}
                        </Link>
                    </div>
                )}
             </div>
          </div>
       </div>
    )}
  </>
  );
}
