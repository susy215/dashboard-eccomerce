import { Award } from 'lucide-react';

function fmt(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function TopList({ title, rows, nameKey = 'nombre' }) {
  const data = rows || [];
  const medalColors = [
    'text-yellow-500',  // Gold
    'text-slate-400',   // Silver
    'text-amber-700',   // Bronze
  ];
  
  return (
    <div className="mt-2 slide-up">
      <h3 className="mt-6 mb-3 text-slate-100 font-semibold text-lg flex items-center gap-2">
        {title}
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
          {data.length}
        </span>
      </h3>
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-500">
        {/* Animated glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 blur-2xl -z-10" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-slate-900/60 border-b border-white/5">
              <tr>
                <th className="text-left px-3 sm:px-4 py-3 font-medium text-slate-400 uppercase tracking-wider text-xs">Ranking</th>
                <th className="text-left px-3 sm:px-4 py-3 font-medium text-slate-400 uppercase tracking-wider text-xs">Nombre</th>
                <th className="text-right px-3 sm:px-4 py-3 font-medium text-slate-400 uppercase tracking-wider text-xs">Cantidad</th>
                <th className="text-right px-3 sm:px-4 py-3 font-medium text-slate-400 uppercase tracking-wider text-xs">Total</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((r, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors duration-200 group/row">
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-center">
                    {idx < 3 ? (
                      <Award className={`w-5 h-5 ${medalColors[idx]}`} strokeWidth={2} fill="currentColor" />
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 text-slate-200 font-medium truncate max-w-[150px] sm:max-w-[200px] group-hover/row:text-white transition-colors">
                  {r[nameKey] || r.producto || r.cliente || r.categoria}
                </td>
                <td className="px-3 sm:px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-blue-500/10 text-blue-400 font-semibold text-xs">
                    {(() => {
                      const amount = r.cantidad ?? r.ordenes ?? r.num_ordenes ?? r.cantidad_vendida ?? r.cant;
                      return amount != null ? (amount?.toLocaleString?.() ?? amount) : '-';
                    })()}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 text-right">
                  <span className="text-slate-100 font-bold group-hover/row:text-emerald-400 transition-colors">
                    {r.total != null ? `$${fmt(r.total)}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="px-3 sm:px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="text-sm">Sin datos disponibles</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


