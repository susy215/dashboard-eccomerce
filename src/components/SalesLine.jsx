import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function formatNumber(n) {
  if (n == null) return '-';
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDateLabel(value) {
  try {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  } catch {
    return value;
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload || {};
  return (
    <div className="rounded-xl border border-blue-500/30 bg-slate-900/95 backdrop-blur-xl px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-blue-500/20">
      <div className="text-xs font-medium text-blue-400 mb-1">{formatDateLabel(label)}</div>
      <div className="text-2xl font-bold text-white">${formatNumber(item.total)}</div>
      {item.cantidad != null && (
        <div className="text-xs text-slate-400 mt-1">{formatNumber(item.cantidad)} pedidos</div>
      )}
    </div>
  );
};

export default function SalesLine({ data }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl p-6 hover:border-blue-500/30 transition-all duration-500 slide-up">
      {/* Animated glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 blur-2xl -z-10" />
      
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="fillSales" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="strokeSales" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 4" vertical={false} />
          <XAxis 
            dataKey="fecha" 
            tickFormatter={formatDateLabel} 
            stroke="#64748b" 
            tickLine={false} 
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="none" 
            fill="url(#fillSales)"
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="url(#strokeSales)" 
            strokeWidth={3} 
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


