import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              SmartSales365
            </span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                Potencia tu Ecommerce
              </span>
              <br />
              <span className="text-slate-100">
                con Inteligencia Artificial
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              SmartSales365 revoluciona la gestión de ventas online con análisis predictivo,
              automatización inteligente y dashboards en tiempo real para maximizar tus ingresos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold shadow-2xl shadow-slate-900/50 transition-all duration-300 hover:shadow-3xl hover:shadow-slate-900/70 hover:scale-105 border border-slate-700/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Comenzar Ahora
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Saber Más
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-slate-400 text-sm">Disponibilidad</div>
            </div>
            <div className="slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-slate-400 text-sm">Monitoreo IA</div>
            </div>
            <div className="slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-slate-400 text-sm">Métricas Avanzadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Tecnología que Transforma Ventas
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Descubre las poderosas características que hacen de SmartSales365 la solución definitiva para ecommerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">IA Predictiva</h3>
                <p className="text-slate-400 leading-relaxed">
                  Algoritmos de machine learning que predicen tendencias de ventas, comportamiento de clientes y optimizan inventarios automáticamente.
                </p>
              </div>
            </div>

            <div className="slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Analytics en Tiempo Real</h3>
                <p className="text-slate-400 leading-relaxed">
                  Dashboards interactivos con métricas actualizadas en tiempo real, alertas inteligentes y reportes automatizados.
                </p>
              </div>
            </div>

            <div className="slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Automatización Total</h3>
                <p className="text-slate-400 leading-relaxed">
                  Procesos automatizados de marketing, gestión de pedidos, seguimiento de clientes y optimización de precios.
                </p>
              </div>
            </div>

            <div className="slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">CRM Inteligente</h3>
                <p className="text-slate-400 leading-relaxed">
                  Gestión avanzada de clientes con segmentación automática, predicción de churn y estrategias de retención personalizadas.
                </p>
              </div>
            </div>

            <div className="slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Integración Total</h3>
                <p className="text-slate-400 leading-relaxed">
                  Conecta con todas las plataformas de ecommerce, pasarelas de pago y herramientas de marketing más populares.
                </p>
              </div>
            </div>

            <div className="slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">Seguridad Empresarial</h3>
                <p className="text-slate-400 leading-relaxed">
                  Encriptación de nivel bancario, compliance GDPR, backups automáticos y monitoreo 24/7 de seguridad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-6">
              ¿Listo para Revolucionar tus Ventas?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Únete a las empresas que ya confían en SmartSales365 para potenciar su ecommerce con inteligencia artificial.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-700 text-white font-semibold text-lg shadow-2xl shadow-slate-900/60 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-slate-900/80 border border-slate-700/60"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Comenzar Transformación Digital
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-slate-400 font-medium">SmartSales365</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 SmartSales365. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
