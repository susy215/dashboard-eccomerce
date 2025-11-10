# 📊 SmartSales365 - Admin Dashboard

Dashboard administrativo moderno y profesional para SmartSales365, construido con React, Vite, Tailwind CSS 4 y Recharts.

## ✨ Características

- 🎨 **Diseño Futurista**: UI minimalista con glassmorphism y gradientes sutiles
- 📈 **Visualización de Datos**: Gráficos interactivos con Recharts
- 🔐 **Autenticación Segura**: Token-based authentication
- 📱 **Responsive**: Optimizado para todos los dispositivos
- ⚡ **Performance**: Built con Vite para carga ultrarrápida
- 🎭 **Animaciones**: Transiciones suaves y efectos visuales elegantes
- 🎯 **Iconos Profesionales**: Lucide React icons

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ y npm
- Backend API corriendo en `https://smartsales365.duckdns.org`

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd dashboard

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env en la raíz con:
# VITE_API_URL=https://smartsales365.duckdns.org

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔑 Autenticación

1. Navega a `/login`
2. Ingresa tus credenciales (usuario/email + contraseña)
3. El token se guarda automáticamente en `localStorage`
4. Serás redirigido al dashboard

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

## 🎨 Stack Tecnológico

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Fetch API nativo

## 📁 Estructura del Proyecto

```
dashboard/
├── src/
│   ├── api/
│   │   ├── auth.js          # Autenticación
│   │   ├── client.js        # Cliente HTTP
│   │   └── reports.js       # Endpoints de reportes
│   ├── components/
│   │   ├── CategoryBar.jsx  # Gráfico de categorías
│   │   ├── KpiCards.jsx     # Tarjetas de KPIs
│   │   ├── SalesLine.jsx    # Gráfico de línea de ventas
│   │   └── TopList.jsx      # Rankings
│   ├── pages/
│   │   ├── Dashboard.jsx    # Página principal
│   │   └── Login.jsx        # Página de login
│   ├── App.jsx              # Router principal
│   ├── index.css            # Estilos globales
│   └── main.jsx             # Entry point
├── public/
├── .gitignore
├── vercel.json              # Config Vercel
├── vite.config.js           # Config Vite
└── package.json
```

## 🌐 Endpoints API Usados

| Endpoint | Descripción |
|----------|-------------|
| `/api/usuarios/token/` | Login y obtención de token |
| `/api/usuarios/me/` | Info del usuario actual |
| `/api/reportes/kpis/` | KPIs del dashboard |
| `/api/reportes/series/ventas-por-dia/` | Serie temporal de ventas |
| `/api/reportes/ventas/por-categoria/` | Ventas por categoría |
| `/api/reportes/ventas/por-producto/` | Top productos |
| `/api/reportes/ventas/top-clientes/` | Top clientes |

## 🎯 Funcionalidades del Dashboard

### KPIs
- Total histórico de ventas
- Ventas últimos 30 días
- Número de órdenes
- Ticket promedio

### Visualizaciones
- **Tendencia de Ventas**: Gráfico de línea con área
- **Ventas por Categoría**: Gráfico de barras multicolor
- **Rankings**: Top productos y clientes con medallas

### Controles
- Filtro por días: 7, 30, 90
- Límite de resultados: Top 5, 10, 15

## 🚀 Despliegue

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas de despliegue en Vercel.

### Resumen rápido

```bash
# Con Vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

### Variables de Entorno en Vercel

```
VITE_API_URL=https://smartsales365.duckdns.org
```

## 🔧 Configuración del Backend

Asegúrate de añadir el dominio de Vercel al backend:

```env
CORS_ALLOWED_ORIGINS=https://smartsales365.duckdns.org,https://tu-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://smartsales365.duckdns.org,https://tu-app.vercel.app
```

## 🎨 Personalización

### Colores

Los colores principales se definen en `src/index.css`:

```css
--accent-blue: #3b82f6;
--accent-cyan: #06b6d4;
--accent-purple: #8b5cf6;
--accent-pink: #ec4899;
```

### Animaciones

Las animaciones están definidas globalmente en `src/index.css`:
- `fade-in`: Aparición suave
- `slide-up`: Deslizamiento hacia arriba
- `shimmer`: Efecto de brillo
- `pulse`: Pulsación

## 📝 Notas

- El dashboard es **solo lectura** (visualización)
- Requiere autenticación válida
- Los datos se actualizan en tiempo real según los filtros
- Compatible con roles: `admin` (recomendado)

## 🐛 Troubleshooting

### "Network Error" o CORS
- Verifica `VITE_API_URL` en el `.env`
- Confirma CORS en el backend

### Token inválido
- Limpia `localStorage` y vuelve a hacer login
- Verifica que el backend esté accesible

### Gráficos no cargan
- Verifica la consola del navegador
- Confirma que los endpoints respondan correctamente

## 📄 Licencia

Privado - SmartSales365

## 👥 Soporte

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Built with ⚡ by SmartSales365 Team**
