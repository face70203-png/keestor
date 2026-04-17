"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Package, Wallet, CheckCircle, Clock, Settings, Ticket, Link as LinkIcon, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useToast } from "../context/ToastContext";
import { translations } from "../../translations";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function DashboardContent() {
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("assets");
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, toggleLanguage } = useLanguage();
  const t = translations[lang].dashboard;
  const { theme, toggleTheme } = useTheme();
  const { currency, changeCurrency, allCurrencies, formatPrice } = useCurrency();

  // Support Ticket Form
  const [ticketSub, setTicketSub] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  // Referral Hub State
  const [totalReferrals, setTotalReferrals] = useState(0);

  const fetchData = async () => {
      try {
          const [wRes, pRes, oRes, tRes, rRes] = await Promise.all([
             axios.get(`${API_BASE_URL}/api/wallet/balance`),
             axios.get(`${API_BASE_URL}/api/users/me`),
             axios.get(`${API_BASE_URL}/api/orders/my-orders`),
             axios.get(`${API_BASE_URL}/api/tickets/my-tickets`),
             axios.get(`${API_BASE_URL}/api/users/referrals`)
          ]);
          setWalletBalance(wRes.data.walletBalance || 0);
          setProfile(pRes.data);
          setOrders(oRes.data);
          setTickets(tRes.data);
          setTotalReferrals(rRes.data.totalReferrals || 0);
      } catch(e) { console.error("Fetch error", e); }
  };

  const topUpWallet = async () => router.push("/topup");

  useEffect(() => {
    const initData = async () => {
       // Handle Tab Switching from URL
       const urlTab = searchParams.get('tab');
       if (urlTab) setTab(urlTab);

       fetchData();

       // Handle Wallet Top-ups
       const topup_session_id = searchParams.get('topup_session_id');
       const amount = searchParams.get('amount');
       if (topup_session_id && amount) {
           try {
              await axios.post(`${API_BASE_URL}/api/wallet/verify-topup`, { session_id: topup_session_id, amount });
              alert("Funds successfully added to KeeWallet!");
              router.replace('/dashboard');
              fetchData();
           } catch (e) {}
       }

       // Handle Product Purchases via Stripe Checkout
       const session_id = searchParams.get('session_id');
       const order_id = searchParams.get('order_id');
       if (session_id && order_id) {
           try {
              await axios.post(`${API_BASE_URL}/api/orders/verify-session`, { session_id, order_id });
              alert("Payment successful! Your assets are now available in your Vault.");
              router.replace('/dashboard');
              fetchData();
           } catch (e) {
              console.error("Order verification failed:", e);
           }
       }
    };
    if (user) initData();
  }, [user, searchParams, router]);

  const submitTicket = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_BASE_URL}/api/tickets`, { subject: ticketSub, message: ticketMsg });
          alert("Ticket Submitted successfully!");
          setTicketSub(""); setTicketMsg("");
          fetchData();
      } catch(e) { alert(e.message); }
  };

  if (loading || !profile) return <div className="text-center mt-20 font-bold text-slate-500">Authenticating Vault...</div>;

  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.referralCode}`;

  return (
    <div className="py-10 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-8 mb-10 flex flex-col md:flex-row shadow-sm border border-slate-200 gap-8 items-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold mb-2 text-slate-900">{t.welcome}, {profile.username}</h1>
            
            <div className="inline-flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 mt-4">
                 <span className="text-slate-600 font-bold">{t.balance}:</span>
                 <span className="text-xl font-black text-emerald-500">{formatPrice(walletBalance)}</span>
                 <button onClick={topUpWallet} className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-black transition">{t.topUp}</button>
            </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[150px]">
          {profile.role === 'admin' && (
            <button onClick={() => router.push('/admin')} className="bg-primary hover:bg-blue-700 shadow-md text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
              {t.adminBtn}
            </button>
          )}
          <button onClick={() => { logout(); router.push('/'); }} className="bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition text-sm text-center">
            {t.signOut}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
          <button onClick={()=>setTab('assets')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='assets'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>{t.tabs.assets}</button>
          <button onClick={()=>setTab('billing')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='billing'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>{t.tabs.billing}</button>
          <button onClick={()=>setTab('affiliate')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='affiliate'?'bg-emerald-500 text-white shadow-md':'bg-white border hover:bg-emerald-50 text-emerald-600 border-slate-200'}`}><LinkIcon size={16} className="inline mr-1 -mt-1"/> {t.tabs.affiliate}</button>
          <button onClick={()=>setTab('support')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='support'?'bg-orange-500 text-white shadow-md':'bg-white border hover:bg-orange-50 text-orange-600 border-slate-200'}`}><Ticket size={16} className="inline mr-1 -mt-1"/> {t.tabs.support}</button>
          <button onClick={()=>setTab('settings')} className={`px-6 py-3 rounded-xl font-bold transition-all ml-auto ${tab==='settings'?'bg-slate-900 text-white':'bg-white border px-4 hover:bg-slate-50 text-slate-600 border-slate-200'}`}><Settings size={18}/></button>
      </div>

      {tab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Package size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tight">{t.assets.emptyTitle}</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">{t.assets.emptyDesc}</p>
                 <button onClick={()=>router.push('/products')} className="mt-8 bg-primary hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition shadow-lg shadow-primary/20">Explore Marketplace</button>
              </div>
            ) : (
                orders.flatMap(o => o.items.map(item => ({ ...item, orderId: o._id, date: o.createdAt }))).map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col group hover:border-primary transition-all duration-500 overflow-hidden relative">
                  
                  {/* Premium Header with Image */}
                  <div className="flex items-center gap-5 p-4 mb-2">
                    <div className="w-20 h-20 relative shrink-0">
                       <img src={item.imageUrl || '/placeholder.png'} alt="" className="w-full h-full rounded-[1.5rem] object-cover shadow-lg border-2 border-white dark:border-slate-700" />
                       <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">
                          <CheckCircle size={14} />
                       </div>
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 truncate mb-1">{item.title}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.assets.purchased}: {new Date(item.date).toLocaleDateString()}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                           <span className="text-[10px] font-black text-primary uppercase tracking-widest">Order Verified</span>
                        </div>
                    </div>
                  </div>
                  
                  {/* Keys Container */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 flex flex-col gap-4 border border-slate-100 dark:border-slate-800/50">
                    {item.keys && item.keys.length > 0 ? (
                        item.keys.map((keyObj, kIdx) => (
                            <div key={kIdx} className="flex flex-col gap-4">
                                
                                {keyObj.keyType === 'image' ? (
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-primary">
                                            <KeyRound size={80} />
                                        </div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Visual Activation Node</div>
                                        <img src={keyObj.value} alt="QR Key" className="w-48 h-48 rounded-2xl shadow-xl border-4 border-white dark:border-slate-800" />
                                        <div className="flex gap-3 w-full">
                                            <a href={keyObj.value} download target="_blank" className="flex-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl text-center hover:bg-black transition">Download QR</a>
                                            <button className="flex-1 bg-primary/10 text-primary text-xs font-bold py-3 rounded-xl hover:bg-primary/20 transition" onClick={() => {navigator.clipboard.writeText(keyObj.value); addToast("QR Link copied!", "success");}}>Copy Link</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm relative group/key">
                                        <div className="flex justify-between items-center mb-3">
                                             <div className="flex items-center gap-2">
                                                  <KeyRound size={14} className="text-primary" />
                                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encrypted License Key</span>
                                             </div>
                                             <button 
                                                className="text-[10px] text-primary font-black uppercase bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition" 
                                                 onClick={() => {
                                                    const val = keyObj?.value || '';
                                                    if (val) {
                                                        navigator.clipboard.writeText(val); 
                                                        addToast("Securely copied to clipboard!", "success");
                                                    } else {
                                                        addToast("License key is still processing...", "error");
                                                    }
                                                 }}
                                             >
                                                {t.assets.copy}
                                             </button>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 select-all transition-all group-hover/key:border-primary/30">
                                            <p className="text-theme font-mono text-sm tracking-[0.1em] font-black break-all text-center leading-relaxed">
                                                {keyObj.value || 'DECRYPTING...'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[1.5rem] flex flex-col items-center text-center gap-2">
                            <Clock className="text-amber-500 animate-pulse" size={24} />
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold tracking-tight uppercase">{t.assets.processing}</p>
                            <p className="text-[10px] text-amber-600/60 font-medium">Standard fulfillment usually takes 1-5 minutes.</p>
                        </div>
                    )}
                  </div>

                  {/* Vault Footer */}
                  <div className="p-4 flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                      <span>Secure Vault Entry</span>
                      <span>UID: {item.orderId.toString().slice(-8)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
      )}

      {tab === 'billing' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-primary"/> {t.billing.title}</h2>
             {orders.length === 0 ? (
                 <p className="text-slate-500 text-center py-10">{t.billing.empty}</p>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead>
                             <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                 <th className="pb-4 font-bold">{t.billing.colRef}</th>
                                 <th className="pb-4 font-bold">{t.billing.colQty}</th>
                                 <th className="pb-4 font-bold">{t.billing.colDate}</th>
                                 <th className="pb-4 font-bold text-right">{t.billing.colTotal}</th>
                             </tr>
                         </thead>
                         <tbody>
                             {orders.map(o => (
                                 <tr key={o._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                     <td className="py-4 font-mono text-xs text-slate-400">{o._id.substring(0, 10)}</td>
                                     <td className="py-4 font-bold text-slate-900">{o.items?.length || 0} Products</td>
                                     <td className="py-4 text-slate-500 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                                     <td className="py-4 text-right font-black text-slate-900">{formatPrice(o.totalAmount || 0)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>
      )}

      {tab === 'affiliate' && (
           <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                 <div className="max-w-xl">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                      <LinkIcon size={32} className="text-emerald-500"/> {t.affiliate.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                      {t.affiliate.desc1} <span className="font-black text-emerald-500">$5.00</span> {t.affiliate.desc2}
                    </p>
                 </div>
                 
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6 rounded-[2rem] min-w-[200px] text-center shadow-inner">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest block mb-1">Total Referrals</span>
                    <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{totalReferrals}</span>
                    <span className="text-[10px] font-bold text-emerald-600/60 block mt-1">LIFETIME GROWTH</span>
                 </div>
              </div>
              
              <div className="bg-slate-900 dark:bg-slate-700 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <LinkIcon size={120} />
                  </div>
                  <label className="text-xs font-black text-emerald-400 uppercase mb-3 block tracking-wider">{t.affiliate.label}</label>
                  <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                     <input type="text" readOnly value={refLink} className="flex-grow bg-white/10 border border-white/20 rounded-2xl px-5 py-4 font-mono font-bold text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                     <button onClick={()=>{navigator.clipboard.writeText(refLink); alert("Invite link copied!");}} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap">
                       {t.affiliate.btn}
                     </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 font-medium italic">Share this link to earn credit for every new user who registers and shops.</p>
              </div>
           </div>
      )}

      {tab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                 <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Ticket className="text-orange-500"/> {t.support.newTitle}</h2>
                 <form onSubmit={submitTicket} className="flex flex-col gap-4">
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.support.subject}</label>
                         <input type="text" value={ticketSub} onChange={e=>setTicketSub(e.target.value)} required placeholder={t.support.subPlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.support.msg}</label>
                         <textarea rows={5} value={ticketMsg} onChange={e=>setTicketMsg(e.target.value)} required placeholder={t.support.msgPlaceholder} className="w-full bg-slate-50 border border-slate-200 resize-none rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900"></textarea>
                     </div>
                     <button type="submit" className="bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Send size={16}/> {t.support.btnSubmit}</button>
                 </form>
             </div>

             <div className="flex flex-col gap-4">
                 <h2 className="text-xl font-black text-slate-900 mb-2">{t.support.activeTitle}</h2>
                 {tickets.length === 0 ? (
                     <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500">{t.support.empty}</div>
                 ) : (
                     tickets.map(tkt => (
                         <div key={tkt._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                             <div className="flex justify-between items-center mb-4">
                                 <h4 className="font-bold text-slate-900">{tkt.subject}</h4>
                                 <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${tkt.status==='open'?'bg-orange-100 text-orange-600':tkt.status==='answered'?'bg-blue-100 text-blue-600':'bg-slate-200 text-slate-600'}`}>{tkt.status}</span>
                             </div>

                             <div className="flex flex-col gap-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                               {tkt.messages && tkt.messages.map((m, i) => (
                                   <div key={i} className={`p-3 rounded-xl border ${m.sender === 'user' ? 'bg-slate-50 border-slate-100 ml-6 text-slate-700' : 'bg-blue-50 border-blue-100 mr-6 text-blue-900'}`}>
                                       <p className={`text-xs font-bold uppercase mb-1 ${m.sender === 'user' ? 'text-slate-500' : 'text-blue-800'}`}>
                                           {m.sender === 'user' ? t.support.you : t.support.admin}
                                       </p>
                                       <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                                   </div>
                               ))}
                             </div>

                             {tkt.status !== 'closed' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                                    <button onClick={async () => {
                                        const reply = prompt("Enter your reply to Admin:");
                                        if(!reply) return;
                                        try {
                                           const token = localStorage.getItem('token');
                                           await axios.put(`${API_BASE_URL}/api/tickets/${tkt._id}/user-reply`, { reply }, { headers:{ Authorization: `Bearer ${token}` }});
                                           alert("Reply sent!");
                                           const wRes = await axios.get(`${API_BASE_URL}/api/tickets/my-tickets`, { headers: { Authorization: `Bearer ${token}` }});
                                           setTickets(wRes.data);
                                        } catch(e) { alert("Failed to send reply"); }
                                    }} className="text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">
                                       {t.support.reply}
                                    </button>
                                    <Link href="/dashboard?tab=settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold group">
                                        <Settings size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                                        <span>{t.profile.settings}</span>
                                    </Link>
                                </div>
                             )}
                         </div>
                     ))
                 )}
             </div>
          </div>
      )}

      {tab === 'settings' && (
          <div id="settings" className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in max-w-2xl">
             <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">{t.settings.title}</h2>
             
             {/* 2FA Toggle */}
             <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6 rounded-2xl mb-6">
                 <div className="flex justify-between items-center">
                     <div className="pr-4">
                         <label className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 block">{t.settings.tfa}</label>
                         <p className="text-xs text-slate-500 dark:text-slate-400">{t.settings.tfaDesc}</p>
                     </div>
                     <button onClick={async () => {
                         try {
                             await axios.put(`${API_BASE_URL}/api/auth/toggle-2fa`, {});
                             alert("2FA setting updated! (Refresh to see status)");
                             fetchData();
                         } catch(e) { alert("Failed to toggle 2FA"); }
                     }} className={`${profile?.twoFactorEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-slate-900 hover:bg-black text-white'} px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap min-w-[120px]`}>
                         {profile?.twoFactorEnabled ? t.settings.disable : t.settings.enable}
                     </button>
                 </div>
             </div>

             {/* 🌙 Theme Toggle */}
             <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6 rounded-2xl mb-6">
                 <div className="flex justify-between items-center">
                     <div>
                         <label className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 block">🌙 Display Theme</label>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode for your comfort.</p>
                     </div>
                     <button onClick={toggleTheme} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${theme === 'dark' ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                         {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                     </button>
                 </div>
             </div>

             {/* 💱 Currency Selector */}
             <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-6 rounded-2xl mb-6">
                 <label className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 block">💱 Display Currency</label>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Prices across the store will be shown in your preferred currency.</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     {Object.entries(allCurrencies).map(([code, info]) => (
                         <button
                             key={code}
                             onClick={() => changeCurrency(code)}
                             className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all ${
                                 currency === code
                                 ? 'border-primary bg-blue-50 dark:bg-blue-900/30 text-primary'
                                 : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/50'
                             }`}
                         >
                             <span className="text-xl">{info.flag}</span>
                             <span className="font-black">{code}</span>
                             <span className="text-xs opacity-70">{info.symbol}</span>
                         </button>
                     ))}
                 </div>
             </div>

             {/* Account Info */}
             <div className="flex flex-col gap-4">
                 <div>
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.settings.user}</label>
                     <input type="text" value={profile?.username || ''} readOnly className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 outline-none text-slate-900 dark:text-slate-100 font-bold" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.settings.email}</label>
                     <input type="email" value={profile?.email || ''} readOnly className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 outline-none text-slate-900 dark:text-slate-100 font-bold" />
                 </div>
                 <button onClick={()=>router.push("/forgot-password")} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-xl w-fit transition-colors">
                     {t.settings.reset}
                 </button>
             </div>
          </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="text-center mt-20 font-bold text-slate-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
