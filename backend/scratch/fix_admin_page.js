const fs = require('fs');
const path = 'c:/Users/DELL/Downloads/fivem/digital_store/frontend/app/admin/page.js';
let c = fs.readFileSync(path, 'utf8');

// 1. Update fetchData Promise.all
c = c.replace(
    /const \[prodRes, ordRes, usersRes, tRes, cRes, statsRes, diagRes\] = await Promise\.all\(\[/,
    'const [prodRes, ordRes, usersRes, tRes, cRes, statsRes, diagRes, auditRes] = await Promise.all(['
);

// 2. Add audit URL to Promise.all items
c = c.replace(
    /axios\.get\(`\${API_BASE_URL}\/api\/diagnostics\/logs`, { headers: { Authorization: `Bearer \${localStorage\.getItem\('token'\)}` } }\)/,
    'axios.get(`${API_BASE_URL}/api/diagnostics/logs`, { headers: { Authorization: `Bearer ${localStorage.getItem(\'token\')}` } }),\n           axios.get(`${API_BASE_URL}/api/users/admin/audit-logs`, { headers: { Authorization: `Bearer ${localStorage.getItem(\'token\')}` } })'
);

// 3. Update setStates
c = c.replace(
    /setDiagLogs\(diagRes\.data\);/,
    'setDiagLogs(diagRes.data);\n        setAuditLogs(auditRes.data);'
);

// 4. Add User History Button in CRM
c = c.replace(
    /<Mail size={16}\/>\n\s+<\/button>/g,
    '<Mail size={16}/>\n                                                   </button>\n                                                   <button onClick={() => fetchUserHistory(u)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors" title="Activity & History">\n                                                       <Activity size={16}/>\n                                                   </button>'
);

// 5. Add History Tab and Modal logic before SYSTEM SETTINGS
const historyTabJSX = `
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
                                              <span className={\`px-2 py-0.5 rounded text-[10px] font-black uppercase \${
                                                  log.type.includes('ERROR') || log.type.includes('FAILURE') ? 'bg-red-100 text-red-600' :
                                                  log.type.includes('SUCCESS') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                              }\`}>
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
                                                        <span className={\`text-[10px] font-black px-2 py-0.5 rounded-full \${ord.status==='success'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}\`}>{ord.status.toUpperCase()}</span>
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
`;

c = c.replace(/{\/\* SYSTEM SETTINGS \*\/}/, historyTabJSX + '\n           {/* SYSTEM SETTINGS */}');

fs.writeFileSync(path, c);
console.log("Admin page updated successfully.");
