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
      <div className="lg:col-span-2 bg-card p-8 rounded-[2rem] border border-theme shadow-sm">
        <h3 className="text-xl font-black text-theme mb-6 flex items-center gap-2">
          <Activity className="text-primary" size={20}/> 30-Day Revenue Trend
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                }}
                itemStyle={{ color: 'var(--text)' }}
                labelStyle={{ fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-card p-8 rounded-[2rem] border border-theme shadow-sm">
        <h3 className="text-xl font-black text-theme mb-6 flex items-center gap-2">
          <FolderOpen className="text-primary" size={20}/> Revenue by Category
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
                stroke="var(--bg-card)"
              >
                {stats.categoryStats?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
