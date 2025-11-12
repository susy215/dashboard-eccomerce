import { useState, useEffect, useRef, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

// URL del WebSocket (autenticación por cookies de sesión)
const getWebSocketUrl = () => {
  // El backend usa cookies para autenticación, no tokens JWT en URL
  return 'wss://smartsales365.duckdns.org/ws/admin/notifications';
};

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const ws = useRef(null);

  // Conectar WebSocket
  const connect = useCallback(() => {
    const wsUrl = getWebSocketUrl();

    if (ws.current) {
      ws.current.close();
    }

    ws.current = new ReconnectingWebSocket(wsUrl, [], {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxRetries: Infinity,
      debug: false,
    });

    ws.current.onopen = () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      setConnectionStatus('Conectado');
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
      setConnectionStatus('Desconectado');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error de conexión');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, []);

  // Manejar mensajes del WebSocket
  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'connection_established':
        console.log('Conexión establecida:', data.message);
        setConnectionStatus('Conectado');
        break;

      case 'notification':
        // Nueva notificación recibida
        const newNotification = {
          id: data.id,
          tipo: data.tipo,
          titulo: data.titulo,
          mensaje: data.mensaje,
          url: data.url,
          datos: data.datos,
          creada: data.creada,
          leida: false, // Las nuevas notificaciones no están leídas
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Mostrar notificación del navegador si es soportado
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.titulo, {
            body: data.mensaje,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: data.datos,
          });
        }
        break;

      case 'unread_count':
        setUnreadCount(data.count);
        break;

      case 'pong':
        // Respuesta a ping - conexión viva
        break;

      case 'error':
        console.error('WebSocket error:', data.message);
        break;

      default:
        console.log('Mensaje WebSocket desconocido:', data);
    }
  }, []);

  // Enviar ping para mantener conexión viva
  const sendPing = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  // Marcar notificación como leída
  const markAsRead = useCallback((notificationId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'mark_read',
        notification_id: notificationId,
      }));

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, leida: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Obtener conteo de no leídas
  const getUnreadCount = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'get_unread_count' }));
    }
  }, []);

  // Limpiar conexión
  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('Desconectado');
  }, []);

  // Ping cada 30 segundos para mantener conexión viva (solo si está conectado)
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, sendPing]);

  // Conectar WebSocket solo si hay autenticación válida
  useEffect(() => {
    const initWebSocket = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

      console.log('🔍 Verificando autenticación para WebSocket...')
      console.log('- Token JWT:', token ? '✅ Presente' : '❌ No encontrado')
      console.log('- Cookies:', document.cookie)

      if (!token) {
        console.log('⚠️ No hay token JWT - WebSocket no se conectará')
        return
      }

      // Verificar que el usuario esté autenticado haciendo una petición de prueba
      try {
        console.log('📡 Verificando autenticación con API...')
        const authCheck = await fetch('https://smartsales365.duckdns.org/api/usuarios/me/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        })

        console.log('📡 Respuesta verificación:', authCheck.status, authCheck.statusText)

        if (!authCheck.ok) {
          console.log('⚠️ Usuario no autenticado - WebSocket no se conectará')
          return
        }

        const userData = await authCheck.json()
        console.log('✅ Usuario autenticado:', userData.username)
        console.log('🚀 Conectando WebSocket...')

        connect()
      } catch (err) {
        console.warn('❌ Error verificando autenticación:', err)
      }
    }

    // Pequeño delay para asegurar que el login termine
    const timer = setTimeout(initWebSocket, 2000)

    return () => {
      clearTimeout(timer)
    };
  }, [connect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Función de debug completa para diagnosticar problemas
  const debugWebSocket = useCallback(async () => {
    const wsUrl = getWebSocketUrl();
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const hasSessionCookie = document.cookie.includes('sessionid') || document.cookie.includes('csrftoken');

    console.log('🔍 === DIAGNÓSTICO COMPLETO WEBSOCKET ===');
    console.log('📡 URL WebSocket:', wsUrl);
    console.log('🔑 Token JWT:', token ? `${token.substring(0, 20)}...` : '❌ No encontrado');
    console.log('🍪 Cookies de sesión:', hasSessionCookie ? '✅ Encontradas' : '❌ No encontradas');
    console.log('📋 Todas las cookies:', document.cookie || 'Ninguna');
    console.log('🔌 Estado conexión:', isConnected ? '✅ Conectado' : '❌ Desconectado');
    console.log('📊 Estado detallado:', connectionStatus);
    console.log('🔔 Notificaciones:', notifications.length);
    console.log('📨 No leídas:', unreadCount);

    // Probar conexión API
    try {
      console.log('🔍 Probando conexión API...');
      const apiTest = await fetch('https://smartsales365.duckdns.org/api/usuarios/me/', {
        method: 'GET',
        headers: token ? { 'Authorization': `Token ${token}` } : {},
        credentials: 'include'
      });
      console.log('📡 API Response:', apiTest.status, apiTest.statusText);

      if (apiTest.ok) {
        const userData = await apiTest.json();
        console.log('👤 Usuario API:', userData);
      }
    } catch (apiErr) {
      console.error('❌ Error API:', apiErr);
    }

    // Probar WebSocket manual
    try {
      console.log('🔌 Probando WebSocket manual...');
      const testWs = new WebSocket(wsUrl);
      testWs.onopen = () => {
        console.log('✅ WebSocket manual: CONECTADO');
        testWs.close();
      };
      testWs.onerror = (err) => console.error('❌ WebSocket manual: ERROR', err);
      testWs.onclose = (ev) => console.log('🔌 WebSocket manual: CERRADO', ev.code, ev.reason);
    } catch (wsErr) {
      console.error('❌ Error creando WebSocket:', wsErr);
    }

    console.log('🏁 === FIN DIAGNÓSTICO ===');

    return {
      wsUrl,
      hasToken: !!token,
      hasSessionCookie,
      isConnected,
      connectionStatus,
      notificationCount: notifications.length,
      unreadCount,
      allCookies: document.cookie
    };
  }, [isConnected, connectionStatus, notifications.length, unreadCount]);

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    getUnreadCount,
    sendPing,
    reconnect: connect,
    debugWebSocket,
  };
};
