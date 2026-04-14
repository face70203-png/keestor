"use client";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, Plus, Database, Package, 
  LayoutDashboard, ShoppingBag, FolderOpen, 
  Settings, KeyRound, ArrowUpRight, Search,
  Users, Trash2, Edit, Ticket, Tag, Reply, XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from 'next/dynamic';

const AdminCharts = dynamic(() => import('../components/AdminCharts'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center font-bold text-slate-400">Initializing Core Analytics...</div>
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ dailyStats: [], categoryStats: [] });
  
  const [promoUses, setPromoUses] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push("/");
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
     try {
        const [pRes, oRes, uRes, cRes, sRes] = await Promise.all([
           axios.get(`${API_BASE_URL}/api/products`),
           axios.get(`${API_BASE_URL}/api/orders`),
           axios.get(`${API_BASE_URL}/api/users`),
           axios.get(`${API_BASE_URL}/api/coupons`),
           axios.get(`${API_BASE_URL}/api/analytics/stats`)
        ]);
        setProducts(pRes.data);
        setOrders(oRes.data);
        setUsers(uRes.data);
        setCoupons(cRes.data);
        setStats(sRes.data);
        setLoadingStats(false);
     } catch (e) {
        console.error("Fetch failed", e);
        setLoadingStats(false);
     }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchData = async () => {
      try {
        const [prodRes, ordRes, usersRes, tRes, cRes, statsRes] = await Promise.all([
           axios.get(`${API_BASE_URL}/api/products`),
           axios.get(`${API_BASE_URL}/api/orders/all`),
           axios.get(`${API_BASE_URL}/api/users`),
           axios.get(`${API_BASE_URL}/api/tickets/all`),
           axios.get(`${API_BASE_URL}/api/coupons`),
           axios.get(`${API_BASE_URL}/api/orders/stats`)
        ]);
        setProducts(prodRes.data);
        setOrders(ordRes.data);
        setUsers(usersRes.data);
        setTickets(tRes.data);
        setCoupons(cRes.data);
        setStats(statsRes.data);
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && user.role === 'admin') fetchData();
  }, [user]);

  const handleAddProduct = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('category', category);
          formData.append('price', price);
          if (originalPrice && parseFloat(originalPrice) > parseFloat(price)) {
            formData.append('originalPrice', originalPrice);
          }
          if (saleEndDate) {
            formData.append('saleEndDate', saleEndDate);
          }
          if (imageFile) formData.append('image', imageFile);
          else if (imageUrl) formData.append('imageUrl', imageUrl);

          await axios.post(`${API_BASE_URL}/api/products`, formData, { 
             headers: { 'Content-Type': 'multipart/form-data' }
          });
          alert("Product added successfully!");
          setTitle(""); setPrice(""); setDescription(""); setImageUrl(""); setImageFile(null); setCategory("General");
          fetchData();
      } catch(err) { alert("Failed: " + err.message); } finally { setSubmitting(false); }
  };

  const handleAddKeys = async (e) => {
      e.preventDefault();
      if(!selectedProductId || !newKeys) return alert("Select product and enter keys");
      try {
          const keysArray = newKeys.split(',').map(k => k.trim()).filter(k => k);
          await axios.post(`${API_BASE_URL}/api/products/${selectedProductId}/keys`, {
              keys: keysArray
          });
          alert(`Added ${keysArray.length} keys successfully!`);
          setNewKeys(""); fetchData();
      } catch(err) { alert("Failed to add keys"); }
  };

  const handleOverwriteKeys = async () => {
      if(!editingProductKeys) return;
      try {
          const keysArray = editKeysText.split('\n').map(k => k.trim()).filter(k => k);
          await axios.put(`${API_BASE_URL}/api/products/${editingProductKeys._id}/keys/overwrite`, {
              keys: keysArray
          });
          alert(`Keys updated! Total keys: ${keysArray.length}`);
          setEditingProductKeys(null); fetchData();
      } catch(err) { alert("Failed to update keys"); }
  };

  const handleCreatePromo = async (e) => {
      e.preventDefault();
      try {
          await axios.post(`${API_BASE_URL}/api/coupons`, { code: promoCode, discountPercent: Number(promoDiscount), maxUses: Number(promoUses) });
          alert("Promo Code Created!");
          setPromoCode(""); setPromoDiscount(""); setPromoUses(0); fetchData();
      } catch(err) { alert(err.response?.data?.error || err.message); }
  };

  const handleDeletePromo = async (id) => {
      try {
          await axios.delete(`${API_BASE_URL}/api/coupons/${id}`);
          fetchData();
      } catch(e) {}
  };

  const handleReplyTicket = async (id) => {
      const reply = prompt("Enter your reply to the user:");
      if (!reply) return;
      try {
          await axios.put(`${API_BASE_URL}/api/tickets/${id}/reply`, { reply });
          fetchData();
      } catch(e) {}
  };

  const handleCloseTicket = async (id) => {
      try {
          await axios.put(`${API_BASE_URL}/api/tickets/${id}/close`, {});
          fetchData();
      } catch(e) {}
  };

  const handleWipeHistory = async () => {
     if(!confirm("WARNING! Wipe ALL transaction history entirely?")) return;
     try {
         await axios.delete(`${API_BASE_URL}/api/orders/wipe/all`);
         alert("Complete Global History Wiped."); fetchData();
     } catch (err) { alert(err.message); }
  };

  const handleDeleteOrder = async (id) => {
      if(!confirm("Wipe this specific transaction from ledger?")) return;
      try {
          await axios.delete(`${API_BASE_URL}/api/orders/${id}`);
          fetchData();
      } catch (err) { alert(err.message); }
  };

  const handleChangeWallet = async (userId, currentBal) => {
    const val = prompt(`Set absolute wallet balance (Current: $${currentBal}):`, currentBal);
    if(val === null || isNaN(val)) return;
    try {
       await axios.put(`${API_BASE_URL}/api/users/${userId}/wallet`, { balance: Number(val) });
       alert("Wallet balance forcefully set."); fetchData();
    } catch(e) { alert(e.message); }
  };

  const handlePromoteAdmin = async (userId) => {
      if(!confirm("Promote this user to Admin Mode?")) return;
      try {
          await axios.put(`${API_BASE_URL}/api/users/${userId}/role`, { role: 'admin' });
          alert("User is now an Administrator."); fetchData();
      } catch(e) { alert(e.message); }
  };

  if (!mounted || loading || !user) return <div className="text-center mt-20">Loading Command Center...</div>;

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const totalKeysSold = orders.filter(o => o.status === 'success').reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
  const totalStock = products.reduce((sum, p) => sum + (p.keys?.length || 0), 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      {/* 📱 Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                   <ShieldCheck size={18}/>
               </div>
               <span className="font-black text-slate-900">Admin Panel</span>
           </div>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
               <Activity size={24} className={isSidebarOpen ? 'rotate-90 transition-all' : ''}/>
           </button>
      </div>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2 overflow-y-auto transform transition-transform duration-300 md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         
         <div className="flex md:hidden justify-end mb-4">
             <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400"><Plus className="rotate-45" size={24}/></button>
         </div>

         <div className="mb-8 px-4">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Command Center</h2>
             <p className="text-xl font-black text-slate-900 leading-tight">Master<br/><span className="text-primary text-3xl">Admin</span></p>
         </div>

         <div className="flex flex-col gap-1.5" onClick={() => setIsSidebarOpen(false)}>
             <button onClick={()=>setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='overview'?'bg-slate-900 text-white shadow-lg shadow-slate-200':'text-slate-600 hover:bg-slate-100'}`}>
                 <LayoutDashboard size={20}/> Global Overview
             </button>
             <button onClick={()=>setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='users'?'bg-emerald-500 text-white shadow-lg shadow-emerald-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <Users size={20}/> User CRM
             </button>
             <button onClick={()=>setActiveTab('audit')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='audit'?'bg-red-600 text-white shadow-lg shadow-red-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <ShieldCheck size={20}/> Security Audit
             </button>
             
             <div className="h-px bg-slate-100 my-4" />

             <button onClick={()=>setActiveTab('catalog')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='catalog'?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-100'}`}>
                 <FolderOpen size={20}/> Catalog Planner
             </button>
             <button onClick={()=>setActiveTab('vault')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='vault'?'bg-indigo-600 text-white shadow-lg shadow-indigo-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <KeyRound size={20}/> Digital Vault
             </button>
             <button onClick={()=>setActiveTab('promo')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='promo'?'bg-pink-600 text-white shadow-lg shadow-pink-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <Tag size={20}/> Promo Engine
             </button>
             <button onClick={()=>setActiveTab('support')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='support'?'bg-orange-500 text-white shadow-lg shadow-orange-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <Ticket size={20}/> Support Desk
             </button>
             <button onClick={()=>setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='settings'?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-100'}`}>
                 <Settings size={20}/> System Settings
             </button>
         </div>

         <div className="mt-auto pt-6 border-t border-slate-100">
             <button onClick={()=>router.push('/')} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 w-full mb-3 transition-colors border border-transparent hover:border-slate-200">
                 <ArrowUpRight size={20}/> Storefront
             </button>
             <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
                 <LogOut size={20}/> Terminate
             </button>
         </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full bg-slate-50/50">
          
          {/* Top Bar for Mobile/Quick Actions */}
          {!loadingStats && activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               {[
                 { label: 'Total Revenue', value: `$${stats.revenue?.toFixed(2)}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                 { label: 'Total Orders', value: stats.totalOrders, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Active Users', value: stats.totalUsers, color: 'text-purple-600', bg: 'bg-purple-50' },
                 { label: 'Cloud Inventory', value: stats.totalProducts, color: 'text-orange-600', bg: 'bg-orange-50' }
               ].map((s, i) => (
                 <div key={i} className={`${s.bg} p-6 rounded-3xl border border-transparent hover:border-slate-200 transition-all shadow-sm`}>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{s.label}</span>
                    <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'overview' && (
             <div className="flex flex-wrap gap-4 mb-8">
                 <button onClick={() => setTab('products')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='products'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>Inventory</button>
                 <button onClick={() => setTab('orders')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='orders'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>Orders</button>
                 <button onClick={() => setTab('tickets')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='tickets'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>Tickets</button>
                 <button onClick={() => setTab('coupons')} className={`px-6 py-3 rounded-xl font-bold transition-all ${tab==='coupons'?'bg-slate-900 text-white shadow-md':'bg-white border hover:bg-slate-50 text-slate-600 border-slate-200'}`}>Coupons</button>
                 <button onClick={() => window.print()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 ml-auto">
                    <Download size={16}/> Export Report (PDF)
                 </button>
             </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
               <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3"><ShieldCheck className="text-red-600"/> Security Audit Logs</h2>
               <div className="space-y-4">
                  {stats.recentLogs?.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">No recent activity recorded.</p>
                  ) : (
                    stats.recentLogs.map((log, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                         <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 shrink-0">
                           {log.adminName?.charAt(0) || '?'}
                         </div>
                         <div className="flex-grow">
                            <div className="flex justify-between">
                               <span className="text-sm font-black text-slate-900">{log.adminName || 'System'}</span>
                               <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-0.5"><span className="text-primary uppercase mr-2">{log.action}</span> {log.details}</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}
         
         {activeTab === 'overview' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center mb-8">
                     <div>
                         <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Snapshot</h1>
                         <p className="text-slate-500 font-medium">Real-time performance analytics and warehouse logistics.</p>
                     </div>
                 </div>

                 {/* Stats Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Activity size={24}/></div>
                         <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Lifetime Revenue</p>
                         <h3 className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(2)}</h3>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><ShoppingBag size={24}/></div>
                         <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Items Dispatched</p>
                         <h3 className="text-3xl font-black text-slate-900">{totalKeysSold}</h3>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><KeyRound size={24}/></div>
                         <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Vault Inventory</p>
                         <h3 className="text-3xl font-black text-slate-900">{totalStock}</h3>
                     </div>
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><Users size={24}/></div>
                         <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Accounts</p>
                         <h3 className="text-3xl font-black text-slate-900">{users.length}</h3>
                     </div>
                 </div>

                 {/* Optimized Charts Section via Dynamic Import */}
                 <AdminCharts stats={stats} />
             </div>
         )}

         {/* USERS CRM MANAGEMENT */}
         {activeTab === 'users' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User CRM</h1>
                        <p className="text-slate-500">Control global user accounts and wallet balances directly.</p>
                     </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="overflow-x-auto w-full">
                         <table className="w-full text-left whitespace-nowrap">
                             <thead>
                                 <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50">
                                     <th className="py-4 px-6 font-bold">Username</th>
                                     <th className="py-4 px-6 font-bold">Registration Date</th>
                                     <th className="py-4 px-6 font-bold">Role</th>
                                     <th className="py-4 px-6 font-bold">Wallet Balance</th>
                                     <th className="py-4 px-6 font-bold text-right">Master Controls</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {users.map(u => (
                                     <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50">
                                         <td className="py-4 px-6 font-bold text-slate-800">
                                            {u.username} <br/><span className="text-xs font-normal text-slate-400">{u.email}</span>
                                            {u.referralCode && <div className="text-[10px] text-emerald-500 font-mono mt-1">Ref: {u.referralCode}</div>}
                                         </td>
                                         <td className="py-4 px-6 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                         <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-md text-xs font-black ${u.role==='admin'?'bg-primary text-white':'bg-slate-200 text-slate-600'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                         </td>
                                         <td className="py-4 px-6 font-black text-emerald-600 text-lg">
                                             ${u.walletBalance?.toFixed(2) || '0.00'}
                                         </td>
                                         <td className="py-4 px-6 text-right">
                                             <div className="flex items-center justify-end gap-2">
                                                 <button onClick={() => handleChangeWallet(u._id, u.walletBalance)} className="p-2 bg-slate-100 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors" title="Force Edit Balance">
                                                     <Edit size={16}/>
                                                 </button>
                                                 {u.role !== 'admin' && (
                                                     <button onClick={() => handlePromoteAdmin(u._id)} className="p-2 bg-slate-100 hover:bg-primary text-blue-600 rounded-lg transition-colors text-xs font-bold" title="Promote to Admin">
                                                         Promote
                                                     </button>
                                                 )}
                                             </div>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         {users.length === 0 && <p className="text-center text-slate-400 py-6 font-bold">Loading CRM...</p>}
                     </div>
                 </div>
              </div>
         )}


         {/* ORDERS MANAGEMENT */}
         {activeTab === 'orders' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center mb-8">
                     <div>
                         <h1 className="text-3xl font-black text-slate-900 tracking-tight">History Ledger</h1>
                         <p className="text-slate-500">All transactional data recorded globally.</p>
                     </div>
                     <button onClick={handleWipeHistory} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2">
                         <Trash2 size={16}/> Redact All History
                     </button>
                 </div>
                 
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                         <Search className="text-slate-400 mr-3" size={20} />
                         <input type="text" placeholder="Search by Order ID, User, or Status..." className="bg-transparent border-none outline-none w-full text-slate-900" />
                     </div>
                     <div className="overflow-x-auto w-full">
                         <table className="w-full text-left whitespace-nowrap">
                             <thead>
                                 <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-white">
                                     <th className="py-4 px-6 font-bold">Date</th>
                                     <th className="py-4 px-6 font-bold">Order UID</th>
                                     <th className="py-4 px-6 font-bold">Buyer</th>
                                     <th className="py-4 px-6 font-bold">Amount</th>
                                     <th className="py-4 px-6 font-bold">Status</th>
                                     <th className="py-4 px-6 font-bold text-right">Delete</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {orders.map(o => (
                                     <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50">
                                         <td className="py-4 px-6 text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                         <td className="py-4 px-6 font-mono text-xs text-slate-400">{o._id.substring(0, 8)}...</td>
                                         <td className="py-4 px-6 font-bold text-slate-800">{o.user?.username || 'Redacted User'}</td>
                                         <td className="py-4 px-6 text-slate-600 font-bold">${(o.totalAmount || 0).toFixed(2)}</td>
                                         <td className="py-4 px-6">
                                            {o.status === 'success' ? (
                                                <div className="max-w-[150px] truncate font-mono text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">
                                                    {o.deliveredKey || 'View Dashboard'}
                                                </div>
                                            ) : (
                                                <div className="max-w-[150px] truncate font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                                    Pending / Abandoned
                                                </div>
                                            )}
                                         </td>
                                         <td className="py-4 px-6 text-right">
                                             <button onClick={() => handleDeleteOrder(o._id)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
                                                 <Trash2 size={16}/>
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         {orders.length === 0 && <p className="text-center text-slate-400 py-6">Ledger is clean.</p>}
                     </div>
                 </div>
             </div>
         )}

         {/* CATALOG HUB */}
         {activeTab === 'catalog' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Catalog Planner</h1>
                    <p className="text-slate-500 mt-1">Publish new digital assets to the live store immediately.</p>
                 </div>

                 <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
                     <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900"><Plus size={20} className="text-primary"/> Create Asset Form</h3>
                     <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         
                         <div className="md:col-span-2">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                             <input type="text" placeholder="Ex: Advanced Police System V2" value={title} onChange={(e)=>setTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                             <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900">
                                <option value="General">General</option>
                                <option value="Scripts">FiveM Scripts</option>
                                <option value="Vehicles">Vehicles</option>
                                <option value="Maps">Maps & MLOs</option>
                                <option value="Software">Other Software</option>
                             </select>
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Sale Price (USD) ✨</label>
                             <input type="number" step="0.01" placeholder="49.99" value={price} onChange={(e)=>setPrice(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                               Original Price (Before Discount) 
                               <span className="text-slate-400 normal-case font-normal ml-1">— Optional</span>
                             </label>
                             <input type="number" step="0.01" placeholder="69.99 (leave empty if no discount)" value={originalPrice} onChange={(e)=>setOriginalPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                             {originalPrice && price && parseFloat(originalPrice) > parseFloat(price) && (
                               <div className="mt-2 flex items-center gap-2">
                                 <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-black px-3 py-1 rounded-full">
                                   -{Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)}% OFF
                                 </span>
                                 <span className="text-xs text-slate-400">Preview: <s className="text-slate-400">${parseFloat(originalPrice).toFixed(2)}</s> → <strong className="text-emerald-600">${parseFloat(price).toFixed(2)}</strong></span>
                               </div>
                             )}
                         </div>

                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                               Sale Expiry Date (Countdown) ⏱️
                               <span className="text-slate-400 normal-case font-normal ml-1">— Optional</span>
                             </label>
                             <input type="datetime-local" value={saleEndDate} onChange={(e)=>setSaleEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                             <p className="text-[10px] text-slate-400 mt-1">Leave empty if this is a permanent discount.</p>
                         </div>

                         <div className="md:col-span-2">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Upload Thumbnail Image</label>
                             <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files[0])} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:border-primary text-slate-900" />
                             <p className="text-xs text-slate-400 mt-2">Or provide an external URL below if you don't want to upload:</p>
                             <input type="url" placeholder="https://imgur.com/... (Optional Fallback)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900" />
                         </div>

                         <div className="md:col-span-2">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                             <textarea placeholder="Write compelling features..." rows="4" value={description} onChange={(e)=>setDescription(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 resize-none"></textarea>
                         </div>

                         <div className="md:col-span-2 pt-4">
                             <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors shadow-md">
                                 {submitting ? "Pushing to Cloud..." : "Publish to Storefront"}
                             </button>
                         </div>
                     </form>
                 </div>

                 <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mt-4">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900"><FolderOpen size={20} className="text-primary"/> Live Products Management</h3>
                    <div className="overflow-x-auto w-full">
                         <table className="w-full text-left whitespace-nowrap">
                             <thead>
                                 <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-white">
                                     <th className="py-2 px-4 font-bold">Image</th>
                                     <th className="py-2 px-4 font-bold">Product</th>
                                     <th className="py-2 px-4 font-bold">Price</th>
                                     <th className="py-2 px-4 font-bold text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {products.map(p => (
                                     <tr key={p._id} className="border-b border-slate-100 items-center">
                                         <td className="py-2 px-4"><img src={p.imageUrl} alt="" className="w-10 h-10 object-cover rounded-md" /></td>
                                         <td className="py-2 px-4 font-bold text-slate-800 text-sm overflow-hidden truncate max-w-[200px]">{p.title}</td>
                                         <td className="py-2 px-4 text-emerald-600 font-bold">${p.price.toFixed(2)}</td>
                                         <td className="py-2 px-4 text-right">
                                             <button onClick={async () => {
                                                 const newPrice = prompt(`Enter new price for ${p.title} (Current: ${p.price}):`);
                                                 if (!newPrice || isNaN(newPrice)) return;
                                                 try {
                                                     await axios.put(`${API_BASE_URL}/api/products/${p._id}`, { price: parseFloat(newPrice) });
                                                     alert("Product Updated!"); fetchData();
                                                 } catch(e) { alert("Failed to update."); }
                                             }} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={16}/></button>
                                             
                                             <button onClick={async () => {
                                                 if(!confirm(`Delete ${p.title} entirely?`)) return;
                                                 try {
                                                     await axios.delete(`${API_BASE_URL}/api/products/${p._id}`);
                                                     alert("Product Deleted!"); fetchData();
                                                 } catch(e) { alert("Failed to delete."); }
                                             }} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    </div>
                 </div>
             </div>
         )}

         {/* DIGITAL VAULT (KEYS RESTOCK) */}
         {activeTab === 'vault' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Database className="text-indigo-600"/> Digital Vault Logistics
                    </h1>
                    <p className="text-slate-500 mt-2">Restock license keys and digital assets assigned to products.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-md relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                         <h3 className="text-xl font-bold mb-6 text-slate-900">Inject Batch Licenses</h3>
                         <form onSubmit={handleAddKeys} className="flex flex-col gap-5">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Select Target Product Engine</label>
                                 <select value={selectedProductId} onChange={(e)=>setSelectedProductId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-slate-900">
                                     <option value="" disabled>Select...</option>
                                     {products.map(p => <option key={p._id} value={p._id}>{p.title} (Stock: {p.keys.length})</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data Payload (Comma Separated)</label>
                                 <textarea placeholder="LICENSE-123, LICENSE-456, G2A-ABCD-EFGH" rows="6" value={newKeys} onChange={(e)=>setNewKeys(e.target.value)} required className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-indigo-500 text-emerald-400 font-mono text-sm resize-none"></textarea>
                                 <p className="text-xs text-slate-400 mt-2">Any format accepted. Extracted exactly to customer display upon purchase.</p>
                             </div>
                             <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white font-black py-4 rounded-xl transition-all">
                                 Deposit Vault Data
                             </button>
                         </form>
                     </div>

                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                         <div className="p-6 border-b border-slate-100">
                             <h3 className="text-lg font-bold text-slate-900">Current Stock Levels</h3>
                         </div>
                         <div className="p-2 overflow-y-auto max-h-[400px]">
                             {products.map(p => (
                                 <div key={p._id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg">
                                     <div>
                                         <p className="font-bold text-slate-800 text-sm">{p.title}</p>
                                         <p className="text-xs text-slate-400">{p.category}</p>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <div className={`px-3 py-1 rounded-md text-xs font-black ${p.keys.length > 5 ? 'bg-emerald-100 text-emerald-700' : p.keys.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                             {p.keys.length} QTY
                                         </div>
                                         <button onClick={() => {
                                             setEditingProductKeys(p);
                                             setEditKeysText(p.keys ? p.keys.join('\n') : "");
                                         }} className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md transition-colors border border-transparent hover:border-indigo-100">
                                             Manage
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>

                 {editingProductKeys && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                         <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden slide-in-from-bottom-4">
                             <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                 <div>
                                     <h3 className="text-xl font-black text-slate-900">Manage Keys: {editingProductKeys.title}</h3>
                                     <p className="text-xs text-slate-500 font-medium">Edit, remove, or organize existing licenses below (One per line).</p>
                                 </div>
                                 <button onClick={()=>setEditingProductKeys(null)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors"><XCircle size={24}/></button>
                             </div>
                             <div className="flex-grow p-6 overflow-y-auto bg-slate-50">
                                 <textarea 
                                     value={editKeysText} 
                                     onChange={(e)=>setEditKeysText(e.target.value)}
                                     spellCheck="false"
                                     className="w-full h-[400px] bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-indigo-500 text-emerald-400 font-mono text-sm resize-none whitespace-pre"
                                     placeholder="Enter keys here, one per line..."
                                 ></textarea>
                             </div>
                             <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
                                 <button onClick={()=>setEditingProductKeys(null)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                 <button onClick={handleOverwriteKeys} className="px-6 py-3 font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition-all">Save Changes</button>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
         )}
         
         {/* PROMO ENGINE */}
         {activeTab === 'promo' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Tag className="text-pink-600"/> Promo Code Engine
                    </h1>
                    <p className="text-slate-500 mt-2">Generate discount campaigns to drive sales and traffic.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-8 rounded-2xl border border-pink-100 shadow-md">
                         <h3 className="text-xl font-bold mb-6 text-slate-900">Issue New Code</h3>
                         <form onSubmit={handleCreatePromo} className="flex flex-col gap-5">
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Promo Code</label>
                                 <input type="text" placeholder="SUMMER50" value={promoCode} onChange={(e)=>setPromoCode(e.target.value.toUpperCase())} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-pink-500 font-mono font-bold text-slate-900" />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discount Percentage (%)</label>
                                 <input type="number" placeholder="20" min="1" max="100" value={promoDiscount} onChange={(e)=>setPromoDiscount(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-pink-500 text-slate-900 font-bold" />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Usage Limit (0 for Unlimited)</label>
                                 <input type="number" placeholder="10" min="0" value={promoUses} onChange={(e)=>setPromoUses(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-pink-500 text-slate-900" />
                             </div>
                             <button type="submit" className="bg-pink-600 hover:bg-pink-700 shadow-lg text-white font-black py-4 rounded-xl transition-all">
                                 Generate Global Code
                             </button>
                         </form>
                     </div>

                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="p-6 border-b border-slate-100">
                             <h3 className="text-lg font-bold text-slate-900">Active Campaigns</h3>
                         </div>
                         <div className="p-2 overflow-y-auto max-h-[400px]">
                             {coupons.map(c => (
                                 <div key={c._id} className="flex justify-between items-center p-4 border-b border-slate-50 hover:bg-slate-50 rounded-lg group">
                                     <div>
                                         <p className="font-bold text-pink-600 font-mono tracking-wider">{c.code}</p>
                                         <p className="text-xs text-slate-400 font-bold">-{c.discountPercent}% OFF</p>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <p className="text-xs text-slate-500">{c.maxUses === 0 ? 'Unlimited' : `${c.currentUses}/${c.maxUses} Used`}</p>
                                         <button onClick={() => handleDeletePromo(c._id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                     </div>
                                 </div>
                             ))}
                             {coupons.length === 0 && <p className="text-center text-slate-400 py-6">No active coupons.</p>}
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {/* SUPPORT DESK */}
         {activeTab === 'support' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Ticket className="text-orange-500"/> Support Desk
                    </h1>
                    <p className="text-slate-500 mt-2">Manage customer queries and helpdesk tickets.</p>
                 </div>

                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-5xl">
                     {tickets.map(t => (
                         <div key={t._id} className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-orange-200 transition-colors">
                             <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-3">
                                 <div>
                                     <h3 className="font-bold text-slate-900">{t.subject}</h3>
                                     <p className="text-xs text-slate-500">From: {t.user?.username || 'Unknown'} | {new Date(t.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <span className={`px-3 py-1 rounded-md text-xs font-black uppercase ${t.status==='open'?'bg-orange-100 text-orange-600':t.status==='answered'?'bg-blue-100 text-blue-600':'bg-slate-200 text-slate-600'}`}>{t.status}</span>
                             </div>
                             
                             <div className="flex flex-col gap-3 mb-4 max-h-[300px] overflow-y-auto px-2">
                               {t.messages && t.messages.map((m, i) => (
                                   <div key={i} className={`p-3 rounded-xl border ${m.sender === 'admin' ? 'bg-blue-50 border-blue-100 ml-6 text-blue-900' : 'bg-white border-slate-200 mr-6 text-slate-700 shadow-sm'}`}>
                                       <p className={`text-xs font-bold uppercase mb-1 ${m.sender === 'admin' ? 'text-blue-800' : 'text-slate-500'}`}>
                                           {m.sender === 'admin' ? 'Support Agent (You)' : 'Customer'}
                                       </p>
                                       <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                                   </div>
                               ))}
                             </div>

                             <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                                 {t.status !== 'closed' && (
                                     <>
                                         <button onClick={()=>handleReplyTicket(t._id)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"><Reply size={14}/> Reply to Customer</button>
                                         <button onClick={()=>handleCloseTicket(t._id)} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"><XCircle size={14}/> Close Ticket</button>
                                     </>
                                 )}
                             </div>
                         </div>
                     ))}
                     {tickets.length === 0 && <p className="text-center text-slate-500 font-bold py-10">No pending tickets. Good job!</p>}
                 </div>
             </div>
         )}
         
         {/* SYSTEM SETTINGS */}
         {activeTab === 'settings' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="text-slate-900"/> System Settings
                    </h1>
                    <p className="text-slate-500 mt-2">Manage global configurations for the storefront.</p>
                 </div>

                 <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
                     <h3 className="text-xl font-bold mb-6 text-slate-900">Upload Store Logo</h3>
                     <p className="text-slate-500 text-sm mb-4">Replaces the logo in the Navbar and Footer. Best dimensions: 150x50px.</p>
                     <form onSubmit={async (e)=>{
                         e.preventDefault();
                         const file = e.target.logo.files[0];
                         if(!file) return alert("Select an image!");
                         const formData = new FormData(); formData.append('logo', file);
                         try {
                             await axios.post(`${API_BASE_URL}/api/settings/logo`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                             alert("Logo updated! Refresh the storefront to see changes.");
                         } catch(err) { alert(err.response?.data?.error || err.message || "Failed to upload."); }
                     }}>
                         <input type="file" name="logo" accept="image/png, image/jpeg, image/svg+xml" required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-slate-400 mb-4 text-slate-900" />
                         <button type="submit" className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl transition-colors">Apply Global Logo</button>
                     </form>
                 </div>
             </div>
         )}
      </main>
    </div>
  );
}
