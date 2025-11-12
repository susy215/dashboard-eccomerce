import { useEffect, useState } from 'react';
import { getKpis, getSerie, getCategorias, getTopProductos, getTopClientes } from '../api/reports';
import KpiCards from '../components/KpiCards';
import SalesLine from '../components/SalesLine';
import CategoryBar from '../components/CategoryBar';
import TopList from '../components/TopList';
import DashboardHeader from '../components/admin/DashboardHeader';

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState();
  const [serie, setSerie] = useState([]);
  const [cats, setCats] = useState([]);
  const [topProd, setTopProd] = useState([]);
  const [topCli, setTopCli] = useState([]);
  const [dias, setDias] = useState(30);
  const [limit, setLimit] = useState(10);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    try {
      const [k, s, c, p, cl] = await Promise.all([
        getKpis(token),
        getSerie(token, dias),
        getCategorias(token, dias),
        getTopProductos(token, dias, limit),
        getTopClientes(token, dias, limit),
      ]);
      setKpis(k.kpis ?? k);
      setSerie(s.serie ?? s);
      setCats(c.categorias ?? c);
      setTopProd(p.productos ?? p);
      setTopCli(cl.clientes ?? cl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, dias, limit]);

  if (!token) {
    return <div className="p-6">Coloca tu token en localStorage como "token" y recarga la página.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header Unificado con Controles */}
      <DashboardHeader
        token={token}
        onNotificationsOpen={() => {
          // Esta función será manejada por el AdminLayout
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('openNotifications'));
          }
        }}
        dias={dias}
        setDias={setDias}
        limit={limit}
        setLimit={setLimit}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading && (
          <div className="mb-6 flex items-center gap-3 text-slate-400 fade-in">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm font-medium">Actualizando datos…</span>
          </div>
        )}

        {/* KPIs */}
        <div className="mb-8">
          <KpiCards kpis={kpis} />
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Serie de ventas */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-slate-100">Tendencia de Ventas</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                {dias} días
              </span>
            </div>
            <SalesLine data={serie} />
          </div>

          {/* Categorías */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-slate-100">Ventas por Categoría</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                {cats.length} categorías
              </span>
            </div>
            <CategoryBar data={cats} />
          </div>

          {/* Rankings */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Rankings de Rendimiento</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopList title={`Top Productos`} rows={topProd} nameKey="producto" />
              <TopList title={`Top Clientes`} rows={topCli} nameKey="cliente" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-slate-500 text-sm fade-in">
          <p>SmartSales365 · Dashboard Admin v1.0</p>
        </div>
      </main>
    </div>
  );
}


