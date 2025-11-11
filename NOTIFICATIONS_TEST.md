# 🧪 Probar Notificaciones Push

## 📋 Variables de Entorno Configuradas

Ya tienes configurado en Vercel:
```
VITE_VAPID_PUBLIC_KEY=BKtRSTkQbtX80JB49LK_I085sscCoHkOIIj0Kk_tjLxpOU8UZhGdyiNcn6w8yt_NnfrUQ8YNZBjaNFaisFqbpQM
```

## 🧪 Pasos para Probar

### **Paso 1: Verificar Dashboard**
1. Abre el dashboard en tu navegador
2. Deberías ver el badge de notificaciones (🔔) en la esquina superior derecha
3. También deberías ver el botón de configuración (⚙️) junto al badge

### **Paso 2: Configurar Notificaciones**
1. **Haz clic en ⚙️** (botón de configuración)
2. Se abrirá el panel de "Notificaciones Push"
3. **Haz clic en "Permitir"** para permisos del navegador
4. **Haz clic en "Suscribir"** para push notifications

### **Paso 3: Verificar en Consola**
Abre las herramientas de desarrollador (F12) y busca estos logs:
```
✅ Service Worker registrado exitosamente
✅ Usando VAPID key del frontend
✅ Suscripción push creada
✅ Suscripción enviada al backend
```

### **Paso 4: Simular Notificación**
Para probar que funciona, puedes crear una notificación manualmente desde el backend:

```python
# En Django shell
from apps.notificaciones.tasks import enviar_notificacion_admin

# Simular nueva compra
enviar_notificacion_admin(
    tipo='nueva_compra',
    titulo='🛒 Nueva Compra Realizada',
    mensaje='Cliente René Vélasquez realizó una compra #1614 por $899.99',
    datos_extra={'compra_id': 1614}
)

# Simular nuevo pago
enviar_notificacion_admin(
    tipo='nuevo_pago',
    titulo='💰 Nuevo Pago Confirmado',
    mensaje='Cliente René Vélasquez confirmó el pago de la compra #1614 por $899.99',
    datos_extra={'compra_id': 1614}
)
```

## 🔍 Verificar Estados

### **En el Panel de Configuración:**
- ✅ **Soporte Completo**: Tu navegador soporta push
- ✅ **Permisos Concedidos**: Aparecerá verde
- ✅ **Suscrito**: Aparecerá verde cuando esté activo

### **En las Herramientas de Desarrollo:**

#### **Service Worker:**
1. Ve a **Application** → **Service Workers**
2. Deberías ver `sw.js` registrado y **Activated**

#### **Push Subscription:**
1. Ve a **Application** → **Notifications**
2. Deberías ver el estado de permisos

#### **Consola:**
Busca logs como:
```
📦 Service Worker instalado
🚀 Service Worker activado
📱 Suscripción push creada
✅ Suscripción enviada al backend
```

## 📱 Probar en Diferentes Estados

### **1. Navegador Abierto:**
- La notificación debería aparecer como pop-up
- También debería aparecer en el centro de notificaciones del navegador

### **2. Navegador Minimizado:**
- La notificación debería aparecer en el panel del sistema operativo
- Debería hacer sonido/vibración

### **3. Navegador Cerrado:**
- La notificación debería aparecer igual en el panel del SO
- Al hacer clic, debería abrir el navegador en el dashboard

## 🚨 Posibles Problemas y Soluciones

### **"Service Worker no registrado"**
```javascript
// En consola del navegador
navigator.serviceWorker.getRegistrations().then(console.log)
```
**Solución:** Verifica que `sw.js` esté en `/public/sw.js`

### **"Permisos denegados"**
1. Ve a configuración del navegador
2. Busca "Notificaciones" o "Notifications"
3. Habilita para tu dominio
4. Recarga la página

### **"Error obteniendo clave VAPID"**
- Verifica que `VITE_VAPID_PUBLIC_KEY` esté en Vercel
- O que el endpoint `/api/notificaciones/vapid-public-key/` funcione

### **"Push subscription failed"**
```javascript
// Verificar soporte
console.log('Push supported:', 'PushManager' in window)
console.log('SW supported:', 'serviceWorker' in navigator)
console.log('Notifications supported:', 'Notification' in window)
```

## 📊 Estados Esperados

| Estado | Indicador | ¿Qué Ver? |
|--------|-----------|-----------|
| ✅ OK | Logs verdes en consola | `✅ Service Worker registrado` |
| ✅ OK | Badge en configuración | **Soporte Completo** |
| ✅ OK | Permisos concedidos | **Permisos Concedidos** |
| ✅ OK | Push suscrito | **Suscrito** |
| ✅ OK | Notificación llega | Pop-up + sonido del SO |

## 🎯 Checklist de Prueba

- [ ] Dashboard carga correctamente
- [ ] Badge de notificaciones visible (🔔)
- [ ] Botón configuración visible (⚙️)
- [ ] Panel configuración abre al hacer clic
- [ ] Permisos del navegador concedidos
- [ ] Service Worker registrado
- [ ] Push subscription creada
- [ ] Notificación de prueba llega
- [ ] Notificación aparece en panel del SO
- [ ] Clic en notificación abre dashboard

## 🚀 ¡Todo Listo!

Si sigues estos pasos, **tus notificaciones push deberían funcionar perfectamente** en:

- ✅ **Panel de notificaciones** del sistema operativo
- ✅ **Centro de notificaciones** móvil/desktop
- ✅ **Navegador web** cuando está abierto
- ✅ **Aplicación instalada** como PWA

¡Las notificaciones están completamente configuradas! 🎊🔔📱💻
