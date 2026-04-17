"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { ShoppingCart, Zap, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { translations } from "../../translations";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ProductGridContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const t = translations[lang].product;
  const router = useRouter();

  // ⏱️ Countdown Timer State logic
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      products.forEach(p => {
        if (p.saleEndDate) {
          const difference = +new Date(p.saleEndDate) - +new Date();
          if (difference > 0) {
            newTimeLeft[p._id] = {
              days: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((difference / 1000 / 60) % 60),
              seconds: Math.floor((difference / 1000) % 60)
            };
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);
    return () => clearInterval(timer);
  }, [products]);

  useEffect(() => {
    setLoading(true);
    // Determine the URL based on search query
    let url = `${API_BASE_URL}/api/products`;
    if (searchQuery) {
        url = `${API_BASE_URL}/api/products/search?q=${searchQuery}`;
    }

    axios.get(url)
      .then(res => {
        let filtered = res.data;
        if (categoryFilter && categoryFilter !== "all" && !searchQuery) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }
        setProducts(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchQuery, categoryFilter]);

  const handleCheckout = async (productId) => {
      if (!user) {
        router.push("/login");
        return;
      }
      router.push(`/checkout?product_id=${productId}`);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
          <div className="h-48 bg-slate-200 dark:bg-slate-700" />
          <div className="p-6 space-y-3">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded-lg w-full" />
            <div className="h-10 bg-slate-100 dark:bg-slate-600 rounded-xl mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const isSoldOut = product.keys?.length === 0;
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const discountPct = hasDiscount
          ? Math.round((1 - product.price / product.originalPrice) * 100)
          : 0;

        return (
          <div key={product._id} className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex flex-col group ${isSoldOut ? 'opacity-75 grayscale-[0.3]' : 'hover:shadow-xl hover:-translate-y-1'}`}>
            <Link href={`/products/${product._id}`} className={`h-48 overflow-hidden relative block ${isSoldOut ? 'pointer-events-none' : ''}`}>
              <Image 
                src={product.imageUrl || '/placeholder.png'} 
                alt={product.title} 
                fill
                className={`object-cover transition-transform duration-500 ${isSoldOut ? '' : 'group-hover:scale-105'}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
              
              {/* Sold Out Overlay */}
              {isSoldOut && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-30">
                      <div className="bg-red-500/90 text-white font-black text-xl px-6 py-2 rounded-xl transform -rotate-12 border-2 border-red-400 shadow-xl">
                          {t.soldOut}
                      </div>
                  </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && !isSoldOut && (
                <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 scale-110 origin-top-left">
                  <div className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-xl flex items-center gap-1.5 border border-red-400/30">
                    <Zap size={12} fill="currentColor"/>
                    <span>-{discountPct}% OFF</span>
                  </div>
                </div>
              )}

              {/* ⏱️ Countdown Timer UI */}
              {timeLeft[product._id] && !isSoldOut && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 z-20">
                    <div className="flex justify-center gap-2">
                        {[
                          {v: timeLeft[product._id].days, l: 'D'},
                          {v: timeLeft[product._id].hours, l: 'H'},
                          {v: timeLeft[product._id].minutes, l: 'M'},
                          {v: timeLeft[product._id].seconds, l: 'S'}
                        ].map((unit, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-white text-xs font-black bg-slate-900/50 min-w-[24px] h-6 flex items-center justify-center rounded border border-white/20">{unit.v < 10 ? `0${unit.v}` : unit.v}</span>
                            <span className="text-[8px] text-white/70 font-bold mt-0.5 uppercase">{unit.l}</span>
                          </div>
                        ))}
                    </div>
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-slate-900 dark:text-white font-bold shadow-sm text-sm">
                {formatPrice(product.price)}
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-3 left-3 z-20 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase shadow-sm">
                {t.categories?.[product.category] || product.category || 'General'}
              </div>
            </Link>
            
            <div className="p-5 flex flex-col flex-grow">
              <Link href={`/products/${product._id}`}>
                 <h3 className="text-base font-bold mb-1 text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-primary transition-colors">{product.title}</h3>
              </Link>
              
              {/* Pricing row */}
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <span className="text-2xl font-black text-primary">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through decoration-red-500/50">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                       Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 flex-grow line-clamp-2">{product.description}</p>
              
              <div className="flex items-center gap-2">
                  <button 
                    disabled={isSoldOut}
                    onClick={() => { 
                      addToCart(product); 
                      addToast(`${product.title} added to cart!`); 
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-3 rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t.addToCart}
                  >
                    <ShoppingCart size={18} />
                  </button>
                  <button 
                    disabled={isSoldOut}
                    onClick={() => handleCheckout(product._id)}
                    className="flex-[3] bg-primary hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSoldOut ? t.outOfStock : <><Zap size={16} /> {t.buyNow}</>}
                  </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductGrid() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading Marketplace...</div>}>
            <ProductGridContent />
        </Suspense>
    );
}
