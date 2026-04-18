"use client";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useSettings } from "../context/SettingsContext"; // [NEW]
import { 
  Activity, Plus, Database, Package, 
  LayoutDashboard, ShoppingBag, FolderOpen, 
  Settings, KeyRound, ArrowUpRight, Search,
  Users, Trash2, Edit, Ticket, Tag, Reply, XCircle,
  Download, LogOut, ShieldCheck, Mail, UserX,
  ShieldX, Ban, Lock, AlertTriangle, Check, Info, RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from 'next/dynamic';

const AdminCharts = dynamic(() => import('../components/AdminCharts'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center font-bold text-slate-400">Initializing Core Analytics...</div>
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const { refreshSettings } = useSettings(); // [NEW]
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
  const [activeTab, setActiveTab] = useState('overview');
  const [tab, setTab] = useState('products');
  const [submitting, setSubmitting] = useState(false);
  const [diagLogs, setDiagLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // User History State
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("General");
  const [saleEndDate, setSaleEndDate] = useState("");

  const [newKeys, setNewKeys] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [editingProductKeys, setEditingProductKeys] = useState(null);
  const [editKeysText, setEditKeysText] = useState("");
  
  const defaultActivationSteps = `1. Authenticate your account on the target platform.
2. Navigate to the 'Redemptions' or 'Licenses' tab.
3. Paste the cryptographic License Key exactly as shown above.
4. If this is a visual asset (QR/eSIM), scan it using your device camera.
5. Once applied, restart your application to finalize synchronization.`;
  
  const [activationSteps, setActivationSteps] = useState(defaultActivationSteps);
  
  // Advanced Product Editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editSaleEndDate, setEditSaleEndDate] = useState("");
  const [editActivationSteps, setEditActivationSteps] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");

  // User Management State
  const [messagingUser, setMessagingUser] = useState(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // System Configuration State
  const [sysSettings, setSysSettings] = useState({
      platformName: '',
      platformTagline: '',
      supportEmail: '',
      supportPhone: '',
      currencySymbol: '$',
      maintenanceMode: false,
      primaryColor: '#3b82f6',
      footerText: '',
      announcement: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoadingStats(true);
    try {
       const [prodRes, ordRes, usersRes, tRes, cRes, statsRes, diagRes, auditRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products/admin`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/orders/all`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/tickets/all`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/coupons`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/analytics/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get(`${API_BASE_URL}/api/diagnostics/logs`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
           axios.get(`${API_BASE_URL}/api/users/admin/audit-logs`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
       ]);
       setProducts(prodRes.data);
       setOrders(ordRes.data);
       setUsers(usersRes.data);
       setTickets(tRes.data);
       setCoupons(cRes.data);
       setStats(statsRes.data);
       setDiagLogs(diagRes.data);
        setAuditLogs(auditRes.data);
    } catch (error) {
      console.error("Fetch Data Error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSettings = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/api/settings`);
        setSysSettings(res.data);
    } catch (err) { console.error("Settings Fetch Error:", err); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
        await axios.put(`${API_BASE_URL}/api/settings`, sysSettings, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await refreshSettings(); // [NEW]
        alert("System configurations updated successfully!");
    } catch (err) {
        alert(err.response?.data?.error || "Update failed");
    } finally { setSavingSettings(false); }
  };

  useEffect(() => {
    setMounted(true);
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push("/");
      } else {
        fetchData();
        fetchSettings();
      }
    }
  }, [user, loading, router]);

  const fetchUserHistory = async (u) => {
    setSelectedUserHistory(u);
    setFetchingHistory(true);
    try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${u._id}/history`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHistoryLogs(res.data.logs);
        setHistoryOrders(res.data.orders);
    } catch (err) {
        alert("Failed to fetch user history");
    } finally {
        setFetchingHistory(false);
    }
  };

  const handleAddProduct = async (e) => {
      e.preventDefault();
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
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
          if (activationSteps) {
            formData.append('activationSteps', activationSteps);
          }
          if (imageFile) formData.append('image', imageFile);
          else if (imageUrl) formData.append('imageUrl', imageUrl);

          await axios.post(`${API_BASE_URL}/api/products`, formData, { 
             headers: { 'Content-Type': 'multipart/form-data' }
          });
          alert("Product added successfully!");
          setTitle(""); setPrice(""); setDescription(""); setImageUrl(""); setImageFile(null); setCategory("General"); setActivationSteps(defaultActivationSteps);
          fetchData();
      } catch(err) { alert("Failed: " + err.message); } finally { setSubmitting(false); }
  };

  const [keyType, setKeyType] = useState("text"); // 'text' or 'image'

  const handleAddKeys = async (e) => {
      e.preventDefault();
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      if(!selectedProductId) return alert("Select product");
      try {
          const formData = new FormData();
          
          if (keyType === 'text') {
              if(!newKeys) return alert("Enter keys");
              // Split by newlines, commas, or spaces to handle any paste format
              const keysArray = newKeys.split(/[\n, ]+/).map(k => ({
                  value: k.trim(),
                  keyType: 'text'
              })).filter(k => k.value);
              formData.append('keys', JSON.stringify(keysArray));
          } else {
              const fileInput = document.getElementById('qrFiles');
              if(!fileInput || !fileInput.files.length) return alert("Select images to upload");
              for(let i=0; i < fileInput.files.length; i++) {
                 formData.append('images', fileInput.files[i]);
              }
          }

          setSubmitting(true);
          await axios.post(`${API_BASE_URL}/api/products/${selectedProductId}/keys`, formData, {
              headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          alert(`Added keys successfully!`);
          setNewKeys("");
          if(document.getElementById('qrFiles')) document.getElementById('qrFiles').value = '';
          fetchData();
      } catch(err) { alert(err.response?.data?.error || "Failed to add keys"); } finally { setSubmitting(false); }
  };

  const handleUpdateProduct = async (e) => {
      e.preventDefault();
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      setSubmitting(true);
      try {
          await axios.put(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
              title: editTitle,
              price: Number(editPrice),
              originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
              description: editDescription,
              category: editCategory,
              imageUrl: editImageUrl,
              saleEndDate: editSaleEndDate,
              activationSteps: editActivationSteps
          });
          alert("Inventory Record Updated Successfully!");
          setEditingProduct(null);
          fetchData();
      } catch(err) { alert("Update Failed: " + err.message); } finally { setSubmitting(false); }
  };

  const openEditModal = (p) => {
      setEditingProduct(p);
      setEditTitle(p.title || "");
      setEditPrice(p.price || "");
      setEditOriginalPrice(p.originalPrice || "");
      setEditDescription(p.description || "");
      setEditCategory(p.category || "General");
      setEditImageUrl(p.imageUrl || "");
      setEditSaleEndDate(p.saleEndDate ? new Date(p.saleEndDate).toISOString().slice(0, 16) : "");
      setEditActivationSteps(p.activationSteps || "");
  };

  const handleOverwriteKeys = async () => {
      if(!editingProductKeys) return;
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      try {
          const keysArray = editKeysText.split(/[\n, ]+/).map(k => k.trim()).filter(k => k);
          await axios.put(`${API_BASE_URL}/api/products/${editingProductKeys._id}/keys/overwrite`, {
              keys: keysArray
          });
          alert(`Keys updated! Total keys: ${keysArray.length}`);
          setEditingProductKeys(null); fetchData();
      } catch(err) { alert("Failed to update keys"); }
  };

  const handleCreatePromo = async (e) => {
      e.preventDefault();
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      try {
          await axios.post(`${API_BASE_URL}/api/coupons`, { code: promoCode, discountPercent: Number(promoDiscount), maxUses: Number(promoUses) });
          alert("Promo Code Created!");
          setPromoCode(""); setPromoDiscount(""); setPromoUses(0); fetchData();
      } catch(err) { alert(err.response?.data?.error || err.message); }
  };

  const handleDeletePromo = async (id) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      try {
          await axios.delete(`${API_BASE_URL}/api/coupons/${id}`);
          fetchData();
      } catch(e) {}
  };

  const handleReplyTicket = async (id) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      const reply = prompt("Enter your reply to the user:");
      if (!reply) return;
      try {
          await axios.put(`${API_BASE_URL}/api/tickets/${id}/reply`, { reply });
          fetchData();
      } catch(e) {}
  };

  const handleCloseTicket = async (id) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      try {
          await axios.put(`${API_BASE_URL}/api/tickets/${id}/close`, {});
          fetchData();
      } catch(e) {}
  };

  const handleWipeHistory = async () => {
     if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
     if(!confirm("WARNING! Wipe ALL transaction history entirely?")) return;
     try {
         await axios.delete(`${API_BASE_URL}/api/orders/wipe/all`);
         alert("Complete Global History Wiped."); fetchData();
     } catch (err) { alert(err.message); }
  };

  const handleDeleteOrder = async (id) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      if(!confirm("Wipe this specific transaction from ledger?")) return;
      try {
          await axios.delete(`${API_BASE_URL}/api/orders/${id}`);
          fetchData();
      } catch (err) { alert(err.message); }
  };

  const handleChangeWallet = async (userId, currentBal) => {
    if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
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

  const handleBlockUser = async (userId, currentlyBlocked) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      const action = currentlyBlocked ? 'unblock' : 'block';
      if(!confirm(`Are you sure you want to ${action} this user?`)) return;
      try {
          await axios.put(`${API_BASE_URL}/api/users/${userId}/${action}`);
          alert(`User ${action}ed successfully.`); fetchData();
      } catch(e) { alert(e.message); }
  };

  const handleDeleteUser = async (userId) => {
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Modifications are disabled.");
      if(!confirm("PERMANENTLY DELETE this user account? This cannot be undone.")) return;
      try {
          await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
          alert("Account erased from database."); fetchData();
      } catch(e) { alert(e.message); }
  };

  const handleSendMessage = async (e) => {
      if(e) e.preventDefault();
      if (user?.email === 'demo@keestore.app') return alert("You are in Demo Mode. Notifications are disabled.");
      if(!messagingUser) return;
      
      let subject = messageSubject;
      let body = messageBody;
      
      if (!subject || !body) {
          subject = prompt(`Enter message subject for ${messagingUser.username}:`, "Important Store Update");
          if (!subject) return setMessagingUser(null);
          body = prompt(`Enter message content (HTML supported):`);
          if (!body) return setMessagingUser(null);
      }

      setSubmitting(true);
      try {
          await axios.post(`${API_BASE_URL}/api/users/${messagingUser._id}/message`, {
              subject,
              message: body
          });
          alert("Professional notification sent to user.");
          setMessagingUser(null);
          setMessageSubject("");
          setMessageBody("");
      } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (!mounted || loading || !user) return <div className="text-center mt-20">Loading Command Center...</div>;

  const totalRevenue = (orders || []).reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const totalKeysSold = (orders || []).filter(o => o.status === 'success').reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
  const totalStock = (products || []).reduce((sum, p) => sum + (p.keys?.length || 0), 0);

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
             <button onClick={()=>setActiveTab('history')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='history'?'bg-blue-600 text-white shadow-lg shadow-blue-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <Activity size={20}/> Audit Log
             </button>
             <button onClick={()=>setActiveTab('diagnostics')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab==='diagnostics'?'bg-indigo-500 text-white shadow-lg shadow-indigo-100':'text-slate-600 hover:bg-slate-100'}`}>
                 <Activity size={20}/> System Health
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
          
          {user?.email === 'demo@keestore.app' && (
             <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 text-amber-800">
                   <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-900 shrink-0">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Read-Only Demo Mode</h3>
                      <p className="text-sm font-bold opacity-75">You are currently viewing the system as a specialized auditor. Any modification attempts will be blocked.</p>
                   </div>
                </div>
                <div className="bg-amber-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em]">Live Demonstration</div>
             </div>
          )}
          
          {/* Top Bar for Mobile/Quick Actions */}
          {!loadingStats && activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               {[
                 { label: 'Total Revenue', value: formatPrice(stats.revenue || 0), color: 'text-emerald-600', bg: 'bg-emerald-50' },
                 { label: 'Total Orders', value: stats.totalOrders || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Active Users', value: stats.totalUsers || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                 { label: 'Cloud Inventory', value: stats.totalProducts || 0, color: 'text-orange-600', bg: 'bg-orange-50' }
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
                         <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Global Snapshot</h1>
                         <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time performance analytics and warehouse logistics.</p>
                     </div>
                 </div>

                 {/* Stats Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4"><Activity size={24}/></div>
                         <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Lifetime Revenue</p>
                         <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(totalRevenue)}</h3>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4"><ShoppingBag size={24}/></div>
                         <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Items Dispatched</p>
                         <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalKeysSold}</h3>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4"><KeyRound size={24}/></div>
                         <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Vault Inventory</p>
                         <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalStock}</h3>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                         <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4"><Users size={24}/></div>
                         <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Active Accounts</p>
                         <h3 className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</h3>
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
                         <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User CRM</h1>
                         <p className="text-slate-500 dark:text-slate-400">Control global user accounts and wallet balances directly.</p>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                       <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                           <Search className="text-slate-400 mr-3" size={20} />
                           <input 
                             type="text" 
                             placeholder="Search users by name or email..." 
                             value={userSearch}
                             onChange={(e)=>setUserSearch(e.target.value)}
                             className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white" 
                           />
                       </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto w-full">
                          <table className="w-full text-left whitespace-nowrap">
                              <thead>
                                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase bg-slate-50 dark:bg-slate-800/50">
                                      <th className="py-4 px-6 font-bold">Username</th>
                                      <th className="py-4 px-6 font-bold">Registration Date</th>
                                      <th className="py-4 px-6 font-bold">Role</th>
                                      <th className="py-4 px-6 font-bold">Wallet Balance</th>
                                      <th className="py-4 px-6 font-bold text-right">Master Controls</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {users.filter(u => 
                                       u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                                       u.email.toLowerCase().includes(userSearch.toLowerCase())
                                   ).map(u => (
                                      <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">
                                             {u.username} <br/><span className="text-xs font-normal text-slate-400">{u.email}</span>
                                             {u.referralCode && <div className="text-[10px] text-emerald-500 font-mono mt-1">Ref: {u.referralCode}</div>}
                                             {u.isBlocked && <div className="mt-1 inline-block bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Blocked / Banned</div>}
                                          </td>
                                          <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                          <td className="py-4 px-6">
                                             <span className={`px-3 py-1 rounded-md text-xs font-black ${u.role==='admin'?'bg-primary text-white':'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                 {u.role.toUpperCase()}
                                             </span>
                                          </td>
                                          <td className="py-4 px-6 font-black text-emerald-600 dark:text-emerald-400 text-lg">
                                              {formatPrice(u.walletBalance || 0)}
                                          </td>
                                          <td className="py-4 px-6 text-right">
                                              <div className="flex items-center justify-end gap-2">
                                                  <button onClick={() => setMessagingUser(u)} className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="Send Notification">
                                                      <Mail size={16}/>
                                                  </button>
                                                  <button onClick={() => fetchUserHistory(u)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="Activity Portfolio">
                                                      <Activity size={16}/>
                                                  </button>
                                                  <button onClick={() => handleChangeWallet(u._id, u.walletBalance)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors" title="Edit Balance">
                                                      <Edit size={16}/>
                                                  </button>
                                                  {u.role !== 'admin' && (
                                                      <>
                                                         <button onClick={() => handleBlockUser(u._id, u.isBlocked)} className={`p-2 rounded-lg transition-colors ${u.isBlocked ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'}`} title={u.isBlocked ? 'Unblock User' : 'Block User'}>
                                                             <Ban size={16}/>
                                                         </button>
                                                         <button onClick={() => handleDeleteUser(u._id)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 rounded-lg transition-colors" title="Delete Account">
                                                             <UserX size={16}/>
                                                         </button>
                                                      </>
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
                           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">History Ledger</h1>
                           <p className="text-slate-500 dark:text-slate-400">All transactional data recorded globally.</p>
                       </div>
                       <button onClick={handleWipeHistory} className="bg-red-50 dark:bg-red-900/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2">
                           <Trash2 size={16}/> Redact All History
                       </button>
                   </div>
                   
                   <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                            <Search className="text-slate-400 mr-3" size={20} />
                            <input 
                              type="text" 
                              placeholder="Search by Order ID, User, or Status..." 
                              value={orderSearch}
                              onChange={(e)=>setOrderSearch(e.target.value)}
                              className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white" 
                            />
                        </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto w-full">
                           <table className="w-full text-left whitespace-nowrap">
                               <thead>
                                   <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase bg-white dark:bg-slate-900">
                                       <th className="py-4 px-6 font-bold">Date</th>
                                       <th className="py-4 px-6 font-bold">Order UID</th>
                                       <th className="py-4 px-6 font-bold">Buyer</th>
                                       <th className="py-4 px-6 font-bold">Amount</th>
                                       <th className="py-4 px-6 font-bold">Status</th>
                                       <th className="py-4 px-6 font-bold text-right">Delete</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {orders.filter(o => 
                                        o._id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                                        (o.user?.username || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
                                        o.status.toLowerCase().includes(orderSearch.toLowerCase())
                                    ).map(o => (
                                       <tr key={o._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                           <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                                           <td className="py-4 px-6 font-mono text-xs text-slate-400">{o._id.substring(0, 8)}...</td>
                                           <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{o.user?.username || 'Redacted User'}</td>
                                           <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-bold">{formatPrice(o.totalAmount || 0)}</td>
                                           <td className="py-4 px-6">
                                              {o.status === 'success' ? (
                                                  <div className="max-w-[150px] truncate font-mono text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800">
                                                      {o.deliveredKey || 'View Dashboard'}
                                                  </div>
                                              ) : (
                                                  <div className="max-w-[150px] truncate font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
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
                      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Product Catalog Planner</h1>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Publish new digital assets to the live store immediately.</p>
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl">
                       <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white"><Plus size={20} className="text-primary"/> Create Asset Form</h3>
                       <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           
                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Title</label>
                               <input type="text" placeholder="Ex: Advanced Police System V2" value={title} onChange={(e)=>setTitle(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                           </div>

                           <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Category</label>
                               <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white">
                                  <option value="General">General</option>
                                  <option value="Scripts">FiveM Scripts</option>
                                  <option value="Vehicles">Vehicles</option>
                                  <option value="Maps">Maps & MLOs</option>
                                  <option value="Software">Other Software</option>
                               </select>
                           </div>

                           <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Sale Price (USD) ✨</label>
                               <input type="number" step="0.01" placeholder="49.99" value={price} onChange={(e)=>setPrice(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                           </div>

                           <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">
                                 Original Price (Before Discount) 
                                 <span className="text-slate-400 normal-case font-normal ml-1">— Optional</span>
                               </label>
                               <input type="number" step="0.01" placeholder="69.99 (leave empty if no discount)" value={originalPrice} onChange={(e)=>setOriginalPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                               {originalPrice && price && parseFloat(originalPrice) > parseFloat(price) && (
                                 <div className="mt-2 flex items-center gap-2">
                                   <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-black px-3 py-1 rounded-full">
                                     -{Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)}% OFF
                                   </span>
                                   <span className="text-xs text-slate-400">Preview: <s className="text-slate-400">${parseFloat(originalPrice).toFixed(2)}</s> → <strong className="text-emerald-600 dark:text-emerald-400">${parseFloat(price).toFixed(2)}</strong></span>
                                 </div>
                               )}
                           </div>

                           <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">
                                 Sale Expiry Date (Countdown) ⏱️
                                 <span className="text-slate-400 normal-case font-normal ml-1">— Optional</span>
                               </label>
                               <input type="datetime-local" value={saleEndDate} onChange={(e)=>setSaleEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                               <p className="text-[10px] text-slate-400 mt-1">Leave empty if this is a permanent discount.</p>
                           </div>

                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Upload Thumbnail Image</label>
                               <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files[0])} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                               <p className="text-xs text-slate-400 mt-2">Or provide an external URL below if you don't want to upload:</p>
                               <input type="url" placeholder="https://imgur.com/... (Optional Fallback)" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white" />
                           </div>

                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Description</label>
                               <textarea placeholder="Write compelling features..." rows="4" value={description} onChange={(e)=>setDescription(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white resize-none"></textarea>
                           </div>

                           <div className="md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Activation Protocol (Steps) 📖</label>
                               <textarea placeholder="Example: 1. Go to keymaster.fivem.net 2. Enter code..." rows="3" value={activationSteps} onChange={(e)=>setActivationSteps(e.target.value)} required className="w-full bg-blue-50/50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-primary text-slate-900 dark:text-white resize-none"></textarea>
                           </div>

                           <div className="md:col-span-2 pt-4">
                               <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors shadow-md">
                                   {submitting ? "Pushing to Cloud..." : "Publish to Storefront"}
                               </button>
                           </div>
                       </form>
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mt-4">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><FolderOpen size={20} className="text-primary"/> Live Products Management</h3>
                          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2 flex items-center w-64">
                              <Search size={16} className="text-slate-400 mr-2"/>
                              <input 
                                  type="text" 
                                  placeholder="Filter products..." 
                                  value={productSearch}
                                  onChange={(e)=>setProductSearch(e.target.value)}
                                  className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-white"
                              />
                          </div>
                      </div>
                      <div className="overflow-x-auto w-full">
                           <table className="w-full text-left whitespace-nowrap">
                               <thead>
                                   <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase bg-white dark:bg-slate-900">
                                       <th className="py-2 px-4 font-bold">Image</th>
                                       <th className="py-2 px-4 font-bold">Product</th>
                                       <th className="py-2 px-4 font-bold">Price</th>
                                       <th className="py-2 px-4 font-bold text-right">Actions</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {products.filter(p => 
                                       p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                                       p.category.toLowerCase().includes(productSearch.toLowerCase())
                                   ).map(p => (
                                       <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 items-center">
                                           <td className="py-2 px-4"><img src={p.imageUrl} alt="" className="w-10 h-10 object-cover rounded-md" /></td>
                                           <td className="py-2 px-4 font-bold text-slate-800 dark:text-slate-100 text-sm overflow-hidden truncate max-w-[200px]">{p.title}</td>
                                           <td className="py-2 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(p.price)}</td>
                                           <td className="py-2 px-4 text-right">
                                               <button onClick={() => openEditModal(p)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={16}/></button>
                                               
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
                      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                          <Database className="text-indigo-600"/> Digital Vault Logistics
                      </h1>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">Restock license keys and digital assets assigned to products.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-md relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                           <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Inject Batch Licenses</h3>
                           <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                              <button onClick={()=>setKeyType('text')} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${keyType==='text'?'bg-white dark:bg-slate-700 shadow-sm text-primary':'text-slate-500 dark:text-slate-400'}`}>TEXT KEYS</button>
                              <button onClick={()=>setKeyType('image')} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${keyType==='image'?'bg-white dark:bg-slate-700 shadow-sm text-primary':'text-slate-500 dark:text-slate-400'}`}>IMAGE/QR KEYS</button>
                           </div>
                           <form onSubmit={handleAddKeys} className="flex flex-col gap-5">
                               <div>
                                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Select Target Product Engine</label>
                                   <select value={selectedProductId} onChange={(e)=>setSelectedProductId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                                       <option value="" disabled>Select...</option>
                                       {products.map(p => <option key={p._id} value={p._id}>{p.title} (In Stock: {p.keys.length})</option>)}
                                   </select>
                               </div>
                               <div>
                                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">
                                      {keyType === 'text' ? 'Data Payload (Comma Separated)' : 'Upload QR Codes / eSIM Images'}
                                   </label>
                                   {keyType === 'text' ? (
                                       <textarea 
                                          placeholder="LICENSE-123, LICENSE-456" 
                                          rows="6" 
                                          value={newKeys} 
                                          onChange={(e)=>setNewKeys(e.target.value)} 
                                          required={keyType === 'text'}
                                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-indigo-500 text-emerald-400 font-mono text-sm resize-none"
                                       ></textarea>
                                   ) : (
                                       <div className="w-full h-[152px] bg-slate-900/50 border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 rounded-xl flex items-center justify-center transition-all group relative">
                                           <input 
                                              type="file" 
                                              id="qrFiles" 
                                              multiple 
                                              accept="image/*" 
                                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                              required={keyType === 'image'}
                                           />
                                           <div className="text-center group-hover:scale-105 transition-transform">
                                               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-400">
                                                   <span className="text-2xl">+</span>
                                               </div>
                                               <p className="text-sm font-bold text-slate-300">Click to upload multiple images</p>
                                               <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Supports PNG, JPG, JPEG</p>
                                           </div>
                                       </div>
                                   )}
                                   <p className="text-xs text-slate-400 mt-2">
                                      {keyType === 'text' ? 'Standard license strings.' : 'Upload image files directly from your device. They will be securely hosted.'}
                                   </p>
                               </div>
                               <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50">
                                   {submitting ? "Uploading & Encrypting..." : `Deposit ${keyType.toUpperCase()} Data`}
                               </button>
                           </form>
                       </div>

                       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                           <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Stock Levels</h3>
                           </div>
                           <div className="p-2 overflow-y-auto max-h-[400px]">
                               {products.map(p => (
                                   <div key={p._id} className="flex justify-between items-center p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                                       <div>
                                           <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.title}</p>
                                           <p className="text-xs text-slate-400">{p.category}</p>
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <div className={`px-3 py-1 rounded-md text-xs font-black ${p.keys.length > 5 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : p.keys.length > 0 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                               {p.keys.length} QTY
                                           </div>
                                           <button onClick={() => {
                                               setEditingProductKeys(p);
                                               setEditKeysText(p.keys ? p.keys.map(k=>k.value).join('\n') : "");
                                           }} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-md transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800">
                                               Manage
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>
               </div>
          )}
          
          {/* PROMO ENGINE */}
          {activeTab === 'promo' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
                  <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                         <Tag className="text-pink-600"/> Promo Code Engine
                     </h1>
                     <p className="text-slate-500 dark:text-slate-400 mt-2">Generate discount campaigns to drive sales and traffic.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-pink-100 dark:border-pink-900 shadow-md">
                          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Issue New Code</h3>
                          <form onSubmit={handleCreatePromo} className="flex flex-col gap-5">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Promo Code</label>
                                  <input type="text" placeholder="SUMMER50" value={promoCode} onChange={(e)=>setPromoCode(e.target.value.toUpperCase())} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-pink-500 font-mono font-bold text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Discount Percentage (%)</label>
                                  <input type="number" placeholder="20" min="1" max="100" value={promoDiscount} onChange={(e)=>setPromoDiscount(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-pink-500 text-slate-900 dark:text-white font-bold" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Usage Limit (0 for Unlimited)</label>
                                  <input type="number" placeholder="10" min="0" value={promoUses} onChange={(e)=>setPromoUses(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 outline-none focus:border-pink-500 text-slate-900 dark:text-white" />
                              </div>
                              <button type="submit" className="bg-pink-600 hover:bg-pink-700 shadow-lg text-white font-black py-4 rounded-xl transition-all">
                                  Generate Global Code
                              </button>
                          </form>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Campaigns</h3>
                          </div>
                          <div className="p-2 overflow-y-auto max-h-[400px]">
                              {coupons.map(c => (
                                  <div key={c._id} className="flex justify-between items-center p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group">
                                      <div>
                                          <p className="font-bold text-pink-600 dark:text-pink-400 font-mono tracking-wider">{c.code}</p>
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
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex justify-between items-center mb-8">
                        <div>
                           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support Desk</h1>
                           <p className="text-slate-500 dark:text-slate-400">Manage user inquiries and technical assistance requests.</p>
                        </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                       <div className="overflow-x-auto w-full">
                           <table className="w-full text-left whitespace-nowrap">
                               <thead>
                                   <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase bg-slate-50 dark:bg-slate-800/50">
                                       <th className="py-4 px-6 font-bold">User</th>
                                       <th className="py-4 px-6 font-bold">Inquiry</th>
                                       <th className="py-4 px-6 font-bold">Status</th>
                                       <th className="py-4 px-6 font-bold text-right">Actions</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {tickets.map(t => (
                                       <tr key={t._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                           <td className="py-4 px-6">
                                               <p className="font-bold text-slate-800 dark:text-slate-100">{t.userName}</p>
                                               <p className="text-xs text-slate-500 dark:text-slate-400">{t.userEmail}</p>
                                           </td>
                                           <td className="py-4 px-6 max-w-[300px] truncate scrollbar-hide">
                                               <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.subject}</p>
                                               <p className="text-xs text-slate-500 dark:text-slate-400">{t.message}</p>
                                           </td>
                                           <td className="py-4 px-6">
                                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                   {t.status}
                                               </span>
                                           </td>
                                           <td className="py-4 px-6 text-right space-x-2">
                                               <button onClick={() => handleReplyTicket(t._id)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"><Reply size={16}/></button>
                                               <button onClick={() => handleCloseTicket(t._id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"><XCircle size={16}/></button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   </div>
               </div>
           )}
          
          
           {/* GLOBAL AUDIT LOG TAB */}
           {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Main Audit Ledger</h1>
                        <p className="text-slate-500 dark:text-slate-400">Chronological history of all significant system events.</p>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto w-full">
                          <table className="w-full text-left whitespace-nowrap">
                              <thead>
                                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase bg-slate-50 dark:bg-slate-800/50">
                                      <th className="py-4 px-6 font-bold">Timestamp</th>
                                      <th className="py-4 px-6 font-bold">Event Type</th>
                                      <th className="py-4 px-6 font-bold">Message</th>
                                      <th className="py-4 px-6 font-bold">Subject</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {auditLogs && auditLogs.map((log, i) => (
                                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                          <td className="py-4 px-6 text-xs text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                                          <td className="py-4 px-6">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                  log.type.includes('ERROR') || log.type.includes('FAILURE') ? 'bg-red-100 text-red-600' :
                                                  log.type.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                              }`}>
                                                  {log.type.replace('_', ' ')}
                                              </span>
                                          </td>
                                          <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300 font-bold">{log.message}</td>
                                          <td className="py-4 px-6 text-xs text-slate-400">
                                              {log.metadata?.userId?.username || log.metadata?.recipient || 'System'}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          {(!auditLogs || auditLogs.length === 0) && <p className="text-center text-slate-400 py-10">No events recorded.</p>}
                      </div>
                  </div>
              </div>
           )}

           {/* USER HISTORY MODAL */}
           {selectedUserHistory && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden slide-in-from-bottom-8">
                      <div className="flex justify-between items-center p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Activity Portfolio</h3>
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{selectedUserHistory.username} — {selectedUserHistory.email}</p>
                          </div>
                          <button onClick={()=>setSelectedUserHistory(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><XCircle size={24}/></button>
                      </div>

                      <div className="flex-grow overflow-y-auto p-8 flex flex-col gap-8">
                          {fetchingHistory ? (
                              <div className="text-center py-20 font-black text-slate-400 animate-pulse">Retrieving Historical Data...</div>
                          ) : (
                              <>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity size={14}/> Recent Activities
                                        </h4>
                                        <div className="space-y-3">
                                            {historyLogs.length === 0 ? <p className="text-slate-400 text-center text-xs py-4 italic">No logged activities for this user.</p> : 
                                            historyLogs.map((log, i) => (
                                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-black uppercase text-blue-500">{log.type.replace('_', ' ')}</span>
                                                        <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{log.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ShoppingBag size={14}/> Order History
                                        </h4>
                                        <div className="space-y-3">
                                            {historyOrders.length === 0 ? <p className="text-slate-400 text-center text-xs py-4 italic">No orders found.</p> : 
                                            historyOrders.map((ord, i) => (
                                                <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-mono text-[10px] text-slate-400">ID: {ord._id.toString().slice(-8).toUpperCase()}</span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ord.status==='success'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}`}>{ord.status.toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatPrice(ord.totalAmount)}</span>
                                                        <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                 </div>
                              </>
                          )}
                      </div>
                  </div>
              </div>
           )}

           {/* SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex justify-between items-center mb-8">
                        <div>
                           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
                           <p className="text-slate-500 dark:text-slate-400">Global configuration and platform aesthetics.</p>
                        </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                <Settings className="text-primary" size={24}/> Identity & Branding
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Platform Name</label>
                                    <input type="text" value={sysSettings.platformName} onChange={(e)=>setSysSettings({...sysSettings, platformName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Branding Tagline</label>
                                    <input type="text" value={sysSettings.platformTagline} onChange={(e)=>setSysSettings({...sysSettings, platformTagline: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Brand Color</label>
                                    <div className="flex gap-3">
                                        <input type="color" value={sysSettings.primaryColor} onChange={(e)=>setSysSettings({...sysSettings, primaryColor: e.target.value})} className="h-12 w-12 rounded-xl overflow-hidden cursor-pointer border-none bg-transparent" />
                                        <input type="text" value={sysSettings.primaryColor} onChange={(e)=>setSysSettings({...sysSettings, primaryColor: e.target.value})} className="flex-grow bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-mono text-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Maintenance Mode</label>
                                    <button 
                                      type="button"
                                      onClick={() => setSysSettings({...sysSettings, maintenanceMode: !sysSettings.maintenanceMode})}
                                      className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all ${sysSettings.maintenanceMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                                    >
                                        {sysSettings.maintenanceMode ? "🚨 ACTIVE: PUBLIC ACCESS DISABLED" : "🟢 ONLINE: SITE IS LIVE"}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Support/Contact Email</label>
                                    <input type="email" value={sysSettings.supportEmail} onChange={(e)=>setSysSettings({...sysSettings, supportEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Footer Attribution Text</label>
                                    <textarea value={sysSettings.footerText} onChange={(e)=>setSysSettings({...sysSettings, footerText: e.target.value})} rows="3" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary text-slate-700 dark:text-slate-300 text-sm resize-none"></textarea>
                                </div>
                            </div>

                            <button onClick={handleUpdateSettings} disabled={savingSettings} className="mt-8 w-full bg-primary hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50">
                                {savingSettings ? "Applying Engine Changes..." : "Save Global Configurations"}
                            </button>
                        </div>

                        <div className="mt-8 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-3xl">
                            <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Assets - Site Logo</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 font-medium">Replaces the logo in the Navbar and Footer. Best dimensions: 150x50px.</p>
                            <form onSubmit={async (e)=>{
                                e.preventDefault();
                                const file = e.target.logo.files[0];
                                if(!file) return alert("Select an image!");
                                const formData = new FormData(); formData.append('logo', file);
                                try {
                                    await axios.post(`${API_BASE_URL}/api/settings/logo`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                                    await refreshSettings(); // [NEW]
                                    alert("Logo updated! Changes reflected globally.");
                                    window.location.reload();
                                } catch(err) { alert(err.response?.data?.error || err.message || "Failed to upload."); }
                            }}>
                                <input type="file" name="logo" accept="image/png, image/jpeg, image/svg+xml" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-primary mb-4 text-slate-900 dark:text-white text-sm" />
                                <button type="submit" className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg">Upload Branding Asset</button>
                            </form>
                        </div>
                  </div>
          )}

          {/* PRODUCT EDIT MODAL */}
          {editingProduct && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden slide-in-from-bottom-8">
                      <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Modify Inventory Asset</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{editingProduct.title}</p>
                          </div>
                          <button onClick={()=>setEditingProduct(null)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-2xl shadow-sm transition-all border border-slate-100 dark:border-slate-700"><XCircle size={24}/></button>
                      </div>
                      <form onSubmit={handleUpdateProduct} className="flex-grow p-8 overflow-y-auto space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asset Label</label>
                                  <input type="text" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Collection/Category</label>
                                  <select value={editCategory} onChange={(e)=>setEditCategory(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white">
                                      <option value="General">General</option>
                                      <option value="Software">Software</option>
                                      <option value="Game Keys">Game Keys</option>
                                      <option value="Subscriptions">Subscriptions</option>
                                      <option value="eSIM">eSIM / QR Assets</option>
                                  </select>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-emerald-600">Current Selling Price</label>
                                  <input type="number" value={editPrice} onChange={(e)=>setEditPrice(e.target.value)} required className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl py-3 px-4 outline-none focus:border-emerald-500 font-black text-emerald-700 dark:text-emerald-400" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Original Price (For Discount Display)</label>
                                  <input type="number" value={editOriginalPrice} onChange={(e)=>setEditOriginalPrice(e.target.value)} placeholder="e.g. 100" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-400" />
                              </div>
                          </div>

                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Technical specifications / Description</label>
                              <textarea value={editDescription} onChange={(e)=>setEditDescription(e.target.value)} rows="4" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-4 outline-none focus:border-primary text-slate-700 dark:text-slate-300 text-sm font-medium resize-none"></textarea>
                          </div>

                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Visual Asset URL</label>
                              <input type="text" value={editImageUrl} onChange={(e)=>setEditImageUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-mono text-xs text-slate-500" />
                          </div>
                          
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Activation Protocol (Steps) 📖</label>
                              <textarea value={editActivationSteps} onChange={(e)=>setEditActivationSteps(e.target.value)} rows="3" className="w-full bg-blue-50/50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-2xl py-4 px-4 outline-none focus:border-primary text-slate-900 dark:text-white text-sm resize-none"></textarea>
                          </div>
                          
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-red-500">Sale Expiration (Optional)</label>
                              <input type="datetime-local" value={editSaleEndDate} onChange={(e)=>setEditSaleEndDate(e.target.value)} className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl py-3 px-4 outline-none focus:border-red-500 font-bold text-red-600 dark:text-red-400" />
                          </div>
                      </form>
                      <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                          <button onClick={()=>setEditingProduct(null)} className="px-8 py-4 font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">Discard Changes</button>
                          <button onClick={handleUpdateProduct} disabled={submitting} className="px-10 py-4 font-black text-white bg-primary hover:bg-blue-700 shadow-xl shadow-primary/20 rounded-2xl transition-all disabled:opacity-50">
                              {submitting ? "Applying Changes..." : "Commit Update"}
                          </button>
                      </div>
                  </div>
              </div>
          )}
          
          {activeTab === 'diagnostics' && (
               <div className="space-y-6">
                   <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
                       <div>
                           <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                               <Activity className="text-indigo-500" /> System Diagnostics
                           </h2>
                           <p className="text-sm text-slate-500 font-medium">Monitoring real-time email delivery and background services</p>
                       </div>
                       <div className="flex gap-2">
                           <button onClick={fetchData} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition shadow-sm border border-slate-200 dark:border-slate-700">
                                <RefreshCw size={16} /> Force Sync
                           </button>
                           <button 
                               onClick={async () => {
                                   if(!confirm("Wipe all diagnostic history?")) return;
                                   await axios.delete(`${API_BASE_URL}/api/diagnostics/logs/clear`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                                   fetchData();
                               }}
                               className="bg-red-50 dark:bg-red-900/10 text-red-600 px-6 py-3 rounded-xl font-bold text-sm tracking-tight border border-red-100 dark:border-red-900/20 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                           >
                               <Trash2 size={16} /> Clear Audit
                           </button>
                       </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden overflow-x-auto">
                       <table className="w-full text-left min-w-[800px]">
                           <thead>
                               <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                   <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Timestamp</th>
                                   <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Module</th>
                                   <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Type</th>
                                   <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Message / Outcome</th>
                                   <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Diagnostic Data</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                               {diagLogs.length === 0 ? (
                                   <tr className="bg-white dark:bg-slate-900">
                                       <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold">No diagnostic logs recorded yet.</td>
                                   </tr>
                               ) : diagLogs.map((log, idx) => (
                                   <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group bg-white dark:bg-slate-900">
                                       <td className="px-6 py-5 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                       <td className="px-6 py-5">
                                           <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg uppercase">{log.module}</span>
                                       </td>
                                       <td className="px-6 py-5">
                                           <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                               log.type.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-600' : 
                                               log.type.includes('FAILURE') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                           }`}>
                                               {log.type.includes('SUCCESS') ? <Check size={10} /> : <AlertTriangle size={10} />}
                                               {log.type.replace('_', ' ')}
                                           </div>
                                       </td>
                                       <td className="px-6 py-5 max-w-xs">
                                           <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{log.message}</p>
                                           <p className="text-[10px] text-slate-400 mt-1 truncate">Recipient: {log.metadata?.recipient || 'N/A'} • Provider: {log.metadata?.provider || 'N/A'}</p>
                                       </td>
                                       <td className="px-6 py-5">
                                           {log.details ? (
                                               <button 
                                                   onClick={() => alert(`Error Stack / Details:\n\n${JSON.stringify(log.details, null, 2)}`)}
                                                   className="text-xs font-black text-indigo-500 hover:text-indigo-600 underline flex items-center gap-1"
                                               >
                                                   <Info size={12} /> View Error Trace
                                               </button>
                                           ) : (
                                               <span className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Normal Ops</span>
                                           )}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
          )}
          
          {editingProductKeys && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                 <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden slide-in-from-bottom-4">
                     <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                         <div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white">Manage Keys: {editingProductKeys.title}</h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Edit, remove, or organize existing licenses below (One per line).</p>
                         </div>
                         <button onClick={()=>setEditingProductKeys(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"><XCircle size={24}/></button>
                     </div>
                     <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                         <textarea 
                             value={editKeysText} 
                             onChange={(e)=>setEditKeysText(e.target.value)}
                             spellCheck="false"
                             className="w-full h-[400px] bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 outline-none focus:border-indigo-500 text-emerald-400 font-mono text-sm resize-none whitespace-pre"
                             placeholder="Enter keys here, one per line..."
                         ></textarea>
                     </div>
                     <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                         <button onClick={()=>setEditingProductKeys(null)} className="px-6 py-3 font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                         <button onClick={handleOverwriteKeys} className="px-6 py-3 font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition-all">Save Changes</button>
                     </div>
                 </div>
             </div>
          )}

          {/* MESSAGING MODAL */}
          {messagingUser && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden slide-in-from-bottom-8">
                      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                          <div>
                              <h3 className="text-xl font-black text-slate-900 dark:text-white">Direct Notification</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Recieving: {messagingUser.username}</p>
                          </div>
                          <button onClick={() => setMessagingUser(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><XCircle size={24}/></button>
                      </div>
                      <form onSubmit={handleSendMessage} className="p-8 space-y-6">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Subject</label>
                              <input 
                                type="text" 
                                value={messageSubject} 
                                onChange={(e)=>setMessageSubject(e.target.value)} 
                                placeholder="Updates about your order..." 
                                required 
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 outline-none focus:border-primary font-bold text-slate-900 dark:text-white" 
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Message Content (HTML Supported)</label>
                              <textarea 
                                value={messageBody} 
                                onChange={(e)=>setMessageBody(e.target.value)} 
                                required 
                                rows="5"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-4 outline-none focus:border-primary text-slate-700 dark:text-slate-300 text-sm font-medium resize-none shadow-inner"
                                placeholder="Write your message here..."
                              ></textarea>
                          </div>
                          <button type="submit" disabled={submitting} className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                             {submitting ? "Transmitting..." : <><Mail size={18}/> Send Vault Notification</>}
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
}
