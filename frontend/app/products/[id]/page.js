"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { ShoppingCart, ShieldCheck, Zap, PackageOpen, ArrowLeft } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../../translations";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductDetailPage() {
  const { lang, dir } = useLanguage();
  const t = translations[lang].product;
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reviews/product/${id}`);
      setReviews(res.data);
    } catch (e) { console.error("Failed to fetch reviews", e); }
  };

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`);
            const found = res.data.find(p => p._id === id);
            if(found) setProduct(found);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const { user } = useAuth();

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return addToast("Please login to leave a review", "error");
    
    setSubmittingReview(true);
    try {
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        productId: id,
        rating: newRating,
        comment: newComment
      });
      
      addToast("Review submitted successfully!");
      setNewComment("");
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading digital asset...</div>;
  if (!product) return <div className="py-20 text-center text-slate-500">Product not found.</div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleAddToCart = () => {
     for(let i=0; i<qty; i++) {
        addToCart(product);
     }
     addToast(`Added ${qty}x ${product.title} to your cart!`);
  };

  return (
    <div className="py-10 max-w-6xl mx-auto" dir={dir}>
      <Link href="/products" className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 mb-8 transition-colors w-fit">
         <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'العودة للمتجر' : 'Back to Catalog'}
      </Link>
      
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
         
         {/* Image Section */}
         <div className="w-full md:w-1/2 bg-slate-50 relative min-h-[400px]">
             <img src={product.imageUrl} alt={product.title} className={`absolute inset-0 w-full h-full object-cover ${product.keys?.length === 0 ? 'grayscale opacity-80' : ''}`} />
             <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-slate-900 font-black shadow-sm uppercase text-xs z-20">
                 {product.category || 'General Asset'}
             </div>
             {product.keys?.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-900/40 backdrop-blur-sm">
                      <div className="bg-red-500/90 text-white font-black text-3xl px-8 py-3 rounded-xl transform -rotate-12 border-4 border-red-400 shadow-2xl backdrop-blur-md">
                           {t.soldOut}
                      </div>
                 </div>
             )}
         </div>

         {/* Details Section */}
         <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
             <h1 className="text-4xl font-black text-slate-900 leading-tight mb-2">{product.title}</h1>
             
             <div className="flex items-center gap-2 mb-4">
                 <div className="flex items-center">
                     {[1,2,3,4,5].map(star => (
                       <svg key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                     ))}
                 </div>
                 <span className="text-sm font-bold text-slate-500">{avgRating > 0 ? `${avgRating} Rating` : (lang === 'ar' ? 'لا توجد تقييمات' : 'No reviews yet')} • {reviews.length} {lang === 'ar' ? 'تقييم' : 'Reviews'}</span>
             </div>

             <p className="text-3xl font-black text-primary mb-6">${product.price?.toFixed(2)}</p>

             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                 <h3 className="font-bold text-slate-900 mb-2">{t.description}</h3>
                 <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">{product.description}</p>
             </div>

             <div className="flex flex-col gap-3 mb-8">
                 <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                     <ShieldCheck className="text-emerald-500" size={20}/> {lang === 'ar' ? 'خالٍ من الفيروسات بنسبة 100٪ وموثق' : '100% Virus-Free & Verified'}
                 </div>
                 <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                     <Zap className="text-blue-500" size={20}/> {lang === 'ar' ? 'تسليم رقمي فوري عبر الخزنة' : 'Instant Digital Delivery via Vault'}
                 </div>
                 <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                     <PackageOpen className="text-indigo-500" size={20}/> {lang === 'ar' ? 'وصول كامل لمدى الحياة' : 'Complete Lifetime Access'}
                 </div>
                 <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                     <ShoppingCart className="text-orange-500" size={20}/> {product.keys?.length > 0 ? <span className="text-emerald-600">{lang === 'ar' ? 'متوفر' : 'In Stock'} ({product.keys?.length} {lang === 'ar' ? 'متبقي' : 'Left'})</span> : <span className="text-red-500">{lang === 'ar' ? 'غير متوفر' : 'Out of Stock'}</span>}
                 </div>
             </div>

             <div className="mt-auto flex gap-4">
                 <div className="flex items-center bg-slate-100 rounded-xl p-2 border border-slate-200">
                     <button onClick={()=>setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center font-black text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors">-</button>
                     <span className="w-12 text-center font-black text-slate-900">{qty}</span>
                     <button onClick={()=>setQty(qty+1)} className="w-10 h-10 flex items-center justify-center font-black text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors">+</button>
                 </div>
                 <button 
                  onClick={handleAddToCart}
                  disabled={product.keys?.length === 0}
                  className="flex-grow bg-slate-900 hover:bg-black shadow-lg text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                 >
                     <ShoppingCart size={20}/> {product.keys?.length === 0 ? t.soldOut : t.addToCart}
                 </button>
                 <button 
                  onClick={() => router.push(`/checkout?product_id=${product._id}`)}
                  disabled={product.keys?.length === 0}
                  className="flex-grow bg-primary hover:bg-blue-700 shadow-lg text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                 >
                     {t.buyNow}
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
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 uppercase">{review.user?.username.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{review.user?.username}</h4>
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
