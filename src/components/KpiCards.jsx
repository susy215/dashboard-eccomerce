import { Wallet, TrendingUp, ShoppingCart, Receipt } from 'lucide-react';

export default function KpiCards({ kpis }) {
  const {
    total_ventas_historico,
    total_ventas_30d,
    ordenes_30d,
    ticket_promedio_30d,
  } = kpis || {};
  const fmt = (n) => (n != null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0');

  const items = [
    {
      label: 'Total histórico',
      value: `$${fmt(total_ventas_historico)}`,
      gradient: 'from-slate-800/60 to-slate-900/60',
      iconBg: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      Icon: Wallet,
    },
    {
      label: 'Ventas 30d',
      value: `$${fmt(total_ventas_30d)}`,
      gradient: 'from-slate-800/60 to-slate-900/60',
      iconBg: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      Icon: TrendingUp,
    },
    {
      label: 'Órdenes 30d',
      value: fmt(ordenes_30d),
      gradient: 'from-slate-800/60 to-slate-900/60',
      iconBg: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
      Icon: ShoppingCart,
    },
    {
      label: 'Ticket promedio',
      value: `$${fmt(ticket_promedio_30d)}`,
      gradient: 'from-slate-800/60 to-slate-900/60',
      iconBg: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      Icon: Receipt,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
      {items.map((it, idx) => (
        <div
          key={idx}
          className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${it.gradient} backdrop-blur-xl border ${it.borderColor} hover:border-opacity-40 transition-all duration-500 hover:scale-[1.02]`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${it.iconBg} p-2.5 sm:p-3 group-hover:scale-110 transition-transform duration-300`}>
                <it.Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${it.iconColor}`} strokeWidth={2} />
              </div>
            </div>
            <div className="text-slate-400 text-xs font-medium tracking-wide mb-1 sm:mb-2">{it.label}</div>
            <div className="text-xl sm:text-2xl font-light text-white tracking-tight break-all sm:break-normal">
              {it.value}
            </div>
          </div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer pointer-events-none" />
        </div>
      ))}
    </div>
  );
}


