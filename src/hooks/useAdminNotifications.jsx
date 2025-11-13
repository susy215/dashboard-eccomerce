import { useState, useEffect, useCallback } from 'react';

/**
 * Hook simple para notificaciones de admin usando polling HTTP.
 * Similar a las push notifications PWA pero para web admin.
 *
 * Ventajas:
 * - ✅ Muy simple de implementar
 * - ✅ Usa tu backend actual
 * - ✅ No requiere configuración compleja
 * - ✅ Funciona igual que las push notifications
 */
export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  // Obtener headers de autenticación
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    console.log('Token being sent:', token); // Debug
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  // Verificar nuevas notificaciones
  const checkNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

      if (!token) {
        console.log('⚠️ No hay token JWT - omitiendo verificación');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Verificando notificaciones con token:', token.substring(0, 20) + '...');

      const response = await fetch('https://smartsales365.duckdns.org/api/notificaciones/admin/polling/', {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();

        // Si hay nuevas notificaciones (comparar con las existentes)
        const currentIds = new Set(notifications.map(n => n.id));
        const newNotifications = data.notifications.filter(n => !currentIds.has(n.id));

        // Mostrar notificaciones push para las nuevas (igual que PWA)
        if (newNotifications.length > 0 && 'Notification' in window) {
          // Pedir permiso si no está concedido
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }

          // Mostrar notificaciones si está permitido
          if (Notification.permission === 'granted') {
            newNotifications.forEach(notification => {
              new Notification(notification.titulo, {
                body: notification.mensaje,
                icon: '/assets/icons/admin-icon.svg',
                badge: '/badge-72x72.png',
                tag: `admin-${notification.id}`, // Evita duplicados
                data: notification.datos,
              });
            });

            // Reproducir sonido opcional
            playNotificationSound();
          }
        }

        // Actualizar estado
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        setLastChecked(new Date());

      } else if (response.status === 401) {
        setError('No autorizado - verifica tu sesión');
      } else if (response.status === 403) {
        setError('No tienes permisos de administrador');
      } else {
        setError(`Error del servidor: ${response.status}`);
      }

    } catch (error) {
      console.error('Error checking notifications:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [notifications]); // Removido getAuthHeaders - el token se obtiene dentro de la función

  // Función para reproducir sonido
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3; // Más bajo que las push notifications
      audio.play().catch(e => {
        console.log('Sonido no disponible:', e.message);
      });
    } catch (e) {
      console.log('Sonido no soportado');
    }
  }, []);

  // Polling DESHABILITADO - Solo verificación inicial
  useEffect(() => {
    // Verificar solo una vez al cargar
    checkNotifications();

    // Polling deshabilitado - no se ejecuta cada 30 segundos
    console.log('🔇 Polling de notificaciones deshabilitado');

    // No hay cleanup necesario ya que no hay interval
  }, []); // Sin dependencias para evitar recreación

  // Limpiar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`https://smartsales365.duckdns.org/api/notificaciones/admin/${notificationId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, leida: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log(`✅ Notificación ${notificationId} marcada como leída`);
      } else {
        console.warn('⚠️ Error marcando como leída:', response.status);
      }
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
    }
  }, []);

  // Función de debug para verificar estado
  const debugNotifications = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

    console.log('🔍 === ESTADO NOTIFICACIONES ===');
    console.log('🔑 Token JWT:', token ? `${token.substring(0, 20)}...` : '❌ No encontrado');
    console.log('📊 Estado:', isLoading ? '🔄 Cargando...' : '✅ Listo');
    console.log('🔔 Notificaciones:', notifications.length);
    console.log('📨 No leídas:', unreadCount);
    console.log('⏰ Última verificación:', lastChecked ? lastChecked.toLocaleTimeString() : 'Nunca');
    console.log('❌ Error:', error || 'Ninguno');

    // Verificar expiración del token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        console.log('📅 Token expira:', exp);
        console.log('⏰ Token expirado:', exp < new Date());
      } catch (e) {
        console.log('❌ Formato de token inválido');
      }
    }

    return {
      hasToken: !!token,
      isLoading,
      notificationCount: notifications.length,
      unreadCount,
      lastChecked,
      error
    };
  }, [isLoading, notifications.length, unreadCount, lastChecked, error]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    lastChecked,
    isLoading,
    error,
    markAsRead,
    refresh: checkNotifications,
    debugNotifications,
  };
};
