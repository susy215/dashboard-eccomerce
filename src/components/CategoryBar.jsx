import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function formatNumber(n) {
  if (n == null) return '-';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload || {};
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-emerald-500/20">
      <div className="text-xs font-medium text-emerald-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">${formatNumber(item.total)}</div>
    </div>
  );
};

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'];

export default function CategoryBar({ data }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl p-6 hover:border-emerald-500/30 transition-all duration-500 slide-up">
      {/* Animated glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-2xl -z-10" />
      
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
          <defs>
            {COLORS.map((color, idx) => (
              <linearGradient key={idx} id={`fillCat${idx}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 4" vertical={false} />
          <XAxis 
            dataKey="categoria" 
            stroke="#64748b" 
            tickLine={false} 
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} 
            interval={0} 
            angle={-15}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            tickFormatter={formatNumber} 
            stroke="#64748b" 
            tickLine={false} 
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} 
            width={65}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar 
            dataKey="total" 
            radius={[8, 8, 0, 0]}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#fillCat${index % COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


