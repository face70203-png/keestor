"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, ShieldCheck, Zap, PackageOpen, 
  ArrowLeft, Share2, Activity, Layers 
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../../translations";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export default function ProductDetailClient({ id }) {
  const { lang, dir } = useLanguage();
  const t = translations[lang].product;
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reviews/product/${id}`);
      setReviews(res.data);
    } catch (e) { 
      console.error("Failed to fetch reviews", e); 
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);
    try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        const found = res.data.find(p => p._id === id);
        if(found) {
          setProduct(found);
        } else {
          setFetchError(true);
        }
        setLoading(false);
    } catch (e) {
        console.error("Product fetch error:", e);
        setFetchError(true);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login to post a review", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        productId: id,
        rating: newRating,
        comment: newComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      addToast("Review posted successfully!", "success");
      setNewComment("");
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="py-40 text-center animate-pulse">
        <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Activity className="text-primary animate-spin" size={32} />
        </div>
        <p className="text-theme-muted font-black tracking-widest uppercase text-xs">Authenticating Digital Asset...</p>
    </div>
  );

  if (fetchError || !product) return (
    <div className="py-40 text-center">
         <div className="w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <PackageOpen className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-black text-theme mb-2">Sync Error</h2>
        <p className="text-theme-muted mb-8 max-w-xs mx-auto">The requested asset index could not be located on the global node.</p>
        <button onClick={() => router.push('/products')} className="bg-primary hover:bg-blue-700 text-white font-black px-8 py-3 rounded-2xl transition-all shadow-xl shadow-primary/20">
            Back to Catalog
        </button>
    </div>
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleAddToCart = () => {
     if(!product) return;
     for(let i=0; i<qty; i++) {
        addToCart(product);
     }
     addToast(`Added ${qty}x ${product.title} to your cart!`, "success");
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4" dir={dir}>
      <Link href="/products" className="text-theme-muted hover:text-theme font-bold flex items-center gap-2 mb-8 transition-colors w-fit">
         <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'العودة للمتجر' : 'Back to Catalog'}
      </Link>
      
      <div className="bg-card rounded-[2.5rem] border border-theme shadow-2xl overflow-hidden flex flex-col md:flex-row">
         
         {/* Image Section */}
         <div className="w-full md:w-5/12 bg-subtle relative min-h-[400px]">
             <img src={product.imageUrl} alt={product.title} className={`absolute inset-0 w-full h-full object-cover ${product.keys?.length === 0 ? 'grayscale opacity-80' : ''}`} />
             <div className="absolute top-6 left-6 bg-glass dark:bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-theme font-black shadow-sm uppercase text-[10px] tracking-widest z-20 border border-theme">
                 {product.category || 'General Asset'}
             </div>
             {product.keys?.length === 0 && (
                   <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-red-500 text-white font-black text-3xl px-8 py-3 rounded-2xl transform -rotate-12 border-4 border-red-400 shadow-2xl">
                             {t.soldOut}
                        </div>
                   </div>
             )}
         </div>

         {/* Details Section */}
         <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col">
             <div className="flex justify-between items-start gap-4 mb-4">
                 <h1 className="text-4xl md:text-5xl font-black text-theme leading-[1.1] tracking-tighter">{product.title}</h1>
                 <button 
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            navigator.clipboard.writeText(window.location.href);
                            addToast("Link copied to clipboard!", "success");
                        }
                    }} 
                    className="p-3 bg-subtle text-theme-muted hover:text-primary hover:bg-primary/10 rounded-2xl transition-all shrink-0"
                    title="Share Link"
                 >
                     <Share2 size={20} />
                 </button>
             </div>
             
             <div className="flex items-center gap-3 mb-6">
                 <div className="flex items-center gap-0.5">
                     {[1,2,3,4,5].map(star => (
                       <svg key={star} className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                     ))}
                 </div>
                 <span className="text-sm font-bold text-theme-muted">{avgRating > 0 ? `${avgRating} Rating` : (lang === 'ar' ? 'لا توجد تقييمات' : 'No reviews yet')} • {reviews.length} {lang === 'ar' ? 'تقييم' : 'Reviews'}</span>
             </div>

             <div className="flex items-center flex-wrap gap-4 mb-8">
                <p className="text-5xl font-black text-primary tracking-tighter">{formatPrice(product.price)}</p>
                {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-3">
                        <p className="text-2xl text-theme-muted line-through opacity-40 decoration-red-500/50">{formatPrice(product.originalPrice)}</p>
                        <div className="bg-red-600 text-white px-4 py-1.5 rounded-2xl text-[12px] font-black flex items-center gap-2 shadow-lg shadow-red-500/20 animate-pulse">
                            <Zap size={14} fill="currentColor"/>
                            <span>SALE: SAVE {formatPrice(product.originalPrice - product.price)}</span>
                        </div>
                    </div>
                )}
             </div>

             <div className="space-y-6 mb-10">
                <div className="bg-subtle/50 p-6 rounded-3xl border border-theme">
                    <h3 className="font-black text-theme text-xs uppercase tracking-[0.2em] mb-4 opacity-40">{t.description}</h3>
                    <p className="text-theme-muted leading-relaxed text-base whitespace-pre-wrap font-medium">{product.description}</p>
                </div>

                {product.activationSteps && (
                    <div className="glass-dark p-8 rounded-3xl border border-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <Activity size={120} />
                        </div>
                        <h3 className="font-black text-primary text-xs uppercase tracking-[0.2em] mb-4">Activation Protocol</h3>
                        <p className="text-theme font-medium text-sm leading-relaxed relative z-10">{product.activationSteps}</p>
                    </div>
                )}
             </div>

             {product.qrCodeUrl && (
                <div className="mb-10 flex items-center gap-6 p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl border border-white/5">
                    <div className="bg-white p-2 rounded-2xl shrink-0">
                        <img src={product.qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                    </div>
                    <div>
                        <h4 className="font-black text-lg mb-1 tracking-tight">Direct Node Activation</h4>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Scan this secure entry point to instantly authenticate your asset through our global network.</p>
                    </div>
                </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                 <div className="flex items-center gap-3 text-theme-muted text-sm font-bold">
                     <ShieldCheck className="text-emerald-500" size={20}/> {lang === 'ar' ? 'خالٍ من الفيروسات بنسبة 100٪' : '100% Virus-Free & Verified'}
                 </div>
                 <div className="flex items-center gap-3 text-theme-muted text-sm font-bold">
                     <Zap className="text-blue-500" size={20}/> {lang === 'ar' ? 'تسليم رقمي فوري' : 'Instant Digital Delivery'}
                 </div>
                 <div className="flex items-center gap-3 text-theme-muted text-sm font-bold">
                     <Layers className="text-indigo-500" size={20}/> {lang === 'ar' ? 'وصول كامل لمدى الحياة' : 'Complete Lifetime Access'}
                 </div>
                 <div className="flex items-center gap-3 text-theme-muted text-sm font-bold">
                     <ShoppingCart className="text-orange-500" size={20}/> {product.keys?.length > 0 ? <span className="text-emerald-600 font-black">{lang === 'ar' ? 'متوفر' : 'In Stock'} ({product.keys?.length})</span> : <span className="text-red-500">{lang === 'ar' ? 'غير متوفر' : 'Out of Stock'}</span>}
                 </div>
             </div>

             <div className="mt-auto flex flex-col sm:flex-row gap-4">
                 <div className="flex items-center bg-subtle rounded-2xl p-1.5 border border-theme">
                     <button onClick={()=>setQty(Math.max(1, qty-1))} className="w-12 h-12 flex items-center justify-center font-black text-theme hover:bg-card rounded-xl transition-all shadow-sm">-</button>
                     <span className="w-14 text-center font-black text-theme text-lg">{qty}</span>
                     <button onClick={()=>setQty(qty+1)} className="w-12 h-12 flex items-center justify-center font-black text-theme hover:bg-card rounded-xl transition-all shadow-sm">+</button>
                 </div>
                 <button 
                  onClick={handleAddToCart}
                  disabled={product.keys?.length === 0}
                  className="flex-grow bg-slate-900 dark:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                 >
                     <ShoppingCart size={20}/> {product.keys?.length === 0 ? t.soldOut : t.addToCart}
                 </button>
                 <button 
                  onClick={() => router.push(`/checkout?product_id=${product._id}`)}
                  disabled={product.keys?.length === 0}
                  className="flex-grow bg-primary hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                 >
                     <Zap size={20} /> {t.buyNow}
                 </button>
             </div>
         </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="md:col-span-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{t.postReview}</h2>
            <form onSubmit={handleSubmitReview} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div className="mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.rating}</label>
                    <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                            <button type="button" key={star} onClick={()=>setNewRating(star)} className={`p-1 transition-colors ${star <= newRating ? 'text-yellow-400' : 'text-slate-200'}`}>
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.feedback}</label>
                    <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} required placeholder={lang === 'ar' ? 'كيف كانت تجربتك؟' : "How was your experience?"} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-primary text-slate-900 text-sm resize-none font-medium"></textarea>
                </div>
                <button type="submit" disabled={submittingReview} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                    {lang === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                </button>
            </form>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{t.reviews}</h2>
            <div className="flex flex-col gap-6">
                {reviews.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-3xl font-bold">{lang === 'ar' ? 'كن أول من يقيم هذا المنتج!' : 'Be the first to review this product!'}</div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 uppercase">{review.user?.username?.charAt(0) || 'U'}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{review.user?.username || 'User'}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1,2,3,4,5].map(star => (
                                                    <svg key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {review.isVerifiedPurchase && (
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                        <ShieldCheck size={12}/> {t.verified}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
