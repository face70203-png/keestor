"use client";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Activity, FolderOpen } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminCharts({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      {/* Revenue Trend Chart */}
      <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="text-[#3b82f6]" size={20}/> 30-Day Revenue Trend
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyStats}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
          <FolderOpen className="text-[#3b82f6]" size={20}/> Revenue by Category
        </h3>
        <div className="h-[350px] w-full items-center justify-center flex">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.categoryStats}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="revenue"
                nameKey="_id"
              >
                {stats.categoryStats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
