"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Package, Wallet, CheckCircle, Clock, Settings, Ticket, Link as LinkIcon, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
  const { lang } = useLanguage();
  const t = translations[lang].dashboard;

  // Support Ticket Form
  const [ticketSub, setTicketSub] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  const fetchData = async (token) => {
      try {
          const [wRes, pRes, oRes, tRes] = await Promise.all([
             axios.get(`${API_BASE_URL}/api/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } }),
             axios.get(`${API_BASE_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
             axios.get(`${API_BASE_URL}/api/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } }),
             axios.get(`${API_BASE_URL}/api/tickets/my-tickets`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setWalletBalance(wRes.data.walletBalance || 0);
          setProfile(pRes.data);
          setOrders(oRes.data);
          setTickets(tRes.data);
      } catch(e) { console.error("Fetch error", e); }
  };

  const topUpWallet = async () => router.push("/topup");

  useEffect(() => {
    const initData = async () => {
       const token = localStorage.getItem("token");
       if (!token) return;

       fetchData(token);

       // Handle Wallet Top-ups
       const topup_session_id = searchParams.get('topup_session_id');
       const amount = searchParams.get('amount');
       if (topup_session_id && amount) {
           try {
              await axios.post(`${API_BASE_URL}/api/wallet/verify-topup`, { session_id: topup_session_id, amount }, {
                 headers: { Authorization: `Bearer ${token}` }
              });
              alert("Funds successfully added to KeeWallet!");
              router.replace('/dashboard');
              fetchData(token);
           } catch (e) {}
       }

       // Handle Product Purchases via Stripe Checkout
       const session_id = searchParams.get('session_id');
       const order_id = searchParams.get('order_id');
       if (session_id && order_id) {
           try {
              await axios.post(`${API_BASE_URL}/api/orders/verify-session`, { session_id, order_id }, {
                 headers: { Authorization: `Bearer ${token}` }
              });
              alert("Payment successful! Your assets are now available in your Vault.");
              router.replace('/dashboard');
              fetchData(token);
           } catch (e) {
              console.error("Order verification failed:", e);
           }
       }
    };
    if (user) initData();
  }, [user, searchParams, router]);

  const submitTicket = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      try {
          await axios.post(`${API_BASE_URL}/api/tickets`, { subject: ticketSub, message: ticketMsg }, { headers: { Authorization: `Bearer ${token}` } });
          alert("Ticket Submitted successfully!");
          setTicketSub(""); setTicketMsg("");
          fetchData(token);
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
                 <span className="text-xl font-black text-emerald-500">${walletBalance.toFixed(2)}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl">
                 <Package className="mx-auto text-slate-400 mb-4" size={48} />
                 <h3 className="text-xl font-bold text-slate-900 mb-2">{t.assets.emptyTitle}</h3>
                 <p className="text-slate-500 font-medium">{t.assets.emptyDesc}</p>
              </div>
            ) : (
                orders.flatMap(o => o.items.map(item => ({ ...item, orderId: o._id, date: o.createdAt }))).map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col hover:border-primary transition-colors group">
                  <div className="flex items-start gap-4 mb-6">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    )}
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.title}</h3>
                        <p className="text-slate-500 font-medium text-xs">{t.assets.purchased}: {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {item.keys && item.keys.length > 0 ? (
                        item.keys.map((key, kIdx) => (
                            <div key={kIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                     <KeyRound size={16} className="text-primary flex-shrink-0" />
                                     <span className="text-slate-900 font-mono text-xs tracking-widest truncate font-black">
                                         {key}
                                     </span>
                                </div>
                                <button className="text-[10px] text-slate-500 hover:text-primary font-bold uppercase transition block" onClick={() => {navigator.clipboard.writeText(key); alert("Copied!");}}>{t.assets.copy}</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 italic">{t.assets.processing}</p>
                    )}
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
                                     <td className="py-4 text-right font-black text-slate-900">${(o.totalAmount || 0).toFixed(2)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>
      )}

      {tab === 'affiliate' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in">
             <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2"><LinkIcon className="text-emerald-500"/> {t.affiliate.title}</h2>
             <p className="text-slate-500 mb-8 max-w-2xl">{t.affiliate.desc1} <span className="font-bold text-emerald-600">$5.00</span> {t.affiliate.desc2}</p>
             
             <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
                 <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">{t.affiliate.label}</label>
                 <div className="flex gap-2">
                    <input type="text" readOnly value={refLink} className="flex-grow bg-white border border-emerald-200 rounded-xl px-4 py-3 font-mono font-bold text-sm text-emerald-900 outline-none" />
                    <button onClick={()=>{navigator.clipboard.writeText(refLink); alert("Invite link copied!");}} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg whitespace-nowrap">{t.affiliate.btn}</button>
                 </div>
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
                                </div>
                             )}
                         </div>
                     ))
                 )}
             </div>
          </div>
      )}

      {tab === 'settings' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in fade-in max-w-2xl">
             <h2 className="text-xl font-black text-slate-900 mb-6">{t.settings.title}</h2>
             
             <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
                 <div className="flex justify-between items-center">
                     <div className="pr-4">
                         <label className="text-sm font-bold text-slate-900 mb-1 block">{t.settings.tfa}</label>
                         <p className="text-xs text-slate-500">{t.settings.tfaDesc}</p>
                     </div>
                     <button onClick={async () => {
                         try {
                             await axios.put(`${API_BASE_URL}/api/auth/toggle-2fa`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                             alert("2FA setting updated successfully! (Refresh to see status)");
                             const token = localStorage.getItem("token");
                             if(token) fetchData(token);
                         } catch(e) { alert("Failed to toggle 2FA"); }
                     }} className={`${profile?.twoFactorEnabled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-slate-900 hover:bg-black text-white'} px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm whitespace-nowrap min-w-[120px]`}>
                         {profile?.twoFactorEnabled ? t.settings.disable : t.settings.enable}
                     </button>
                 </div>
             </div>

             <div className="flex flex-col gap-6">
                 <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.settings.user}</label>
                     <input type="text" value={profile?.username || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-900 font-bold" />
                 </div>
                 <div>
                     <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{t.settings.email}</label>
                     <input type="email" value={profile?.email || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-900 font-bold" />
                 </div>
                 <button onClick={()=>router.push("/forgot-password")} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl w-fit transition-colors">
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
