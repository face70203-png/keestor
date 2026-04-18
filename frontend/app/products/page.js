"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { PackageSearch, Search, ShoppingCart, LayoutGrid, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../../translations";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

import { useCurrency } from "../context/CurrencyContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { lang } = useLanguage();
  const t = translations[lang].product;
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(res => setProducts(res.data.slice(0, 100)))
      .catch(console.error);
  }, []);

  const handleCheckout = async (productId) => {
      if (!user) {
        router.push("/login");
        return;
      }
      router.push(`/checkout?product_id=${productId}`);
  };

  const categories = ["All", "General", "Scripts", "Vehicles", "Maps", "Software"];

  const filteredProducts = products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "All" ? true : p.category === selectedCategory;
      const matchPrice = p.price <= maxPrice;
      const matchStock = onlyInStock ? p.keys?.length > 0 : true;
      return matchSearch && matchCategory && matchPrice && matchStock;
  });

  return (
    <div className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
         <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 text-slate-900"><LayoutGrid className="text-primary"/> {t.allAssetsTitle}</h1>
            <p className="text-slate-500 mt-2">{t.allAssetsSubtitle}</p>
         </div>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary text-slate-900 shadow-sm"
            />
         </div>
      </div>

      <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-wrap items-center gap-3">
             {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-tight transition-all shadow-sm border
                        ${selectedCategory === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                     {t.categories[cat] || cat}
                 </button>
             ))}
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-auto px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-tight flex items-center gap-2 transition-all border
                    ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-primary'}`}
             >
                <LayoutGrid size={16} /> {lang === 'ar' ? 'خيارات التصفية' : 'Advanced Filters'}
             </button>
          </div>

          {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'السعر الأقصى' : 'Max Price'}</label>
                          <span className="text-sm font-black text-primary">{formatPrice(maxPrice)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        step="10"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                  </div>
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setOnlyInStock(!onlyInStock)}
                        className={`flex-grow py-4 rounded-2xl font-black text-xs uppercase tracking-tight transition-all border flex items-center justify-center gap-3
                            ${onlyInStock ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-slate-200'}`}
                      >
                          <ShoppingCart size={16} /> {lang === 'ar' ? 'المتوفر فقط' : 'In Stock Only'}
                      </button>
                      <button 
                        onClick={() => {setMaxPrice(2000); setOnlyInStock(false); setSelectedCategory('All'); setSearch("");}}
                        className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-tight text-slate-400 bg-white border border-slate-200 hover:text-red-500 hover:border-red-200 transition-all"
                      >
                          {lang === 'ar' ? 'رسترت' : 'Reset'}
                      </button>
                  </div>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => {
          const isSoldOut = product.keys?.length === 0;
          const hasDiscount = product.originalPrice && product.originalPrice > product.price;
          const discountPct = hasDiscount
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : 0;

          return (
            <div key={product._id} className={`bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all flex flex-col group ${isSoldOut ? 'opacity-75 grayscale-[0.3]' : 'hover:shadow-xl'}`}>
              <Link href={`/products/${product._id}`} className={`h-48 overflow-hidden relative block ${isSoldOut ? 'pointer-events-none' : ''}`}>
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${isSoldOut ? '' : 'group-hover:scale-105'}`}
                />

                {/* Overlays */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-30">
                      <div className="bg-red-500/90 text-white font-black text-xl px-6 py-2 rounded-xl transform -rotate-12 border-2 border-red-400 shadow-xl backdrop-blur-md">
                          {t.soldOut}
                      </div>
                  </div>
                )}

                {hasDiscount && !isSoldOut && (
                  <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 scale-110 origin-top-left">
                    <div className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-xl flex items-center gap-1.5 border border-red-400/30">
                      <Zap size={12} fill="currentColor"/>
                      <span>-{discountPct}% OFF</span>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-slate-900 font-bold shadow-sm">
                  {formatPrice(product.price)}
                </div>
                <div className="absolute top-4 left-4 z-20 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase shadow-sm">
                  {t.categories[product.category] || product.category || t.categories['General']}
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/products/${product._id}`}>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 line-clamp-1 hover:text-primary transition-colors">{product.title}</h3>
                </Link>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="text-xl font-black text-primary">{formatPrice(product.price)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-xs text-slate-400 line-through decoration-red-500/50">{formatPrice(product.originalPrice)}</span>
                      <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                         Save {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                </div>
                
                <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2">{product.description}</p>
                
                <div className="flex items-center gap-3">
                    <button 
                      disabled={isSoldOut}
                      onClick={() => { addToCart(product); addToast(`${product.title} added!`); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t.addToCart}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button 
                      disabled={isSoldOut}
                      onClick={() => handleCheckout(product._id)}
                      className="flex-[3] bg-primary hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                      {isSoldOut ? t.outOfStock : (loadingId === product._id ? "Processing..." : t.buyNow)}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
         <div className="text-center py-20 text-slate-500 font-bold text-xl">
             No products found in "{selectedCategory}".
         </div>
      )}
    </div>
  );
}
