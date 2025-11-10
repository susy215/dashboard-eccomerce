# 🚀 Despliegue en Vercel - SmartSales365 Dashboard

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub/GitLab/Bitbucket (recomendado) o CLI de Vercel

## 🔧 Configuración

### 1. Variables de Entorno

En Vercel Dashboard → Project Settings → Environment Variables, añade:

```
VITE_API_URL=https://smartsales365.duckdns.org
```

**Importante**: Esta variable debe estar configurada para **Production**, **Preview** y **Development**.

### 2. Build Settings

Vercel detectará automáticamente Vite, pero si necesitas configurarlo manualmente:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌐 Métodos de Despliegue

### Método 1: Desde Git (Recomendado)

1. **Push tu código a GitHub/GitLab/Bitbucket**

```bash
git init
git add .
git commit -m "Initial commit - SmartSales365 Dashboard"
git branch -M main
git remote add origin <tu-repositorio-url>
git push -u origin main
```

2. **Importar en Vercel**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Selecciona tu repositorio
   - Configura las variables de entorno
   - Click en **Deploy**

### Método 2: CLI de Vercel

1. **Instalar Vercel CLI**

```bash
npm i -g vercel
```

2. **Login**

```bash
vercel login
```

3. **Deploy**

```bash
vercel
```

Para producción:

```bash
vercel --prod
```

## ⚙️ Configuración del Backend (CORS)

Asegúrate que tu backend Django tenga configurado el dominio de Vercel en:

**`.env` del backend**:

```env
CORS_ALLOWED_ORIGINS=https://smartsales365.duckdns.org,https://tu-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://smartsales365.duckdns.org,https://tu-app.vercel.app
```

**Nota**: Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel.

## 🔐 Autenticación

El dashboard usa Token Authentication. Los usuarios deben:

1. Iniciar sesión en `/login`
2. El token se guarda automáticamente en `localStorage`
3. Todas las peticiones incluyen el header: `Authorization: Token <token>`

## 📝 Verificación Post-Deploy

Después del deploy, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ El login funciona
3. ✅ Los datos del dashboard se cargan
4. ✅ Los gráficos se renderizan
5. ✅ Las transiciones y animaciones funcionan

## 🐛 Troubleshooting

### Error: "Network Error" o CORS

- Verifica que `VITE_API_URL` esté configurado en Vercel
- Confirma que el dominio de Vercel esté en `CORS_ALLOWED_ORIGINS` del backend

### Error: "Página en blanco"

- Revisa los logs del build en Vercel Dashboard
- Verifica que el build local funcione: `npm run build && npm run preview`

### Error: "Failed to fetch"

- Confirma que el backend esté accesible desde internet
- Verifica el SSL del backend (debe ser HTTPS)
- Revisa la consola del navegador para más detalles

## 🔄 Actualizar Deploy

### Con Git (recomendado)

```bash
git add .
git commit -m "Update dashboard"
git push
```

Vercel redesplegará automáticamente.

### Con CLI

```bash
vercel --prod
```

## 🌍 Dominio Personalizado (Opcional)

1. Ve a Vercel Dashboard → Project → Settings → Domains
2. Añade tu dominio personalizado
3. Configura los DNS según las instrucciones
4. Actualiza `CORS_ALLOWED_ORIGINS` en el backend

## 📊 Monitoreo

Vercel provee automáticamente:

- ✅ Analytics
- ✅ Logs en tiempo real
- ✅ Performance monitoring
- ✅ Error tracking

Accede desde: Project → Analytics / Logs

## 🎉 ¡Listo!

Tu dashboard está desplegado y listo para usar en:
`https://tu-app.vercel.app`

---

**Desarrollado con ❤️ usando React + Vite + Tailwind CSS**

