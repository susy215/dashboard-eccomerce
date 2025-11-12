import { useState, useEffect, useRef, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/admin/notifications/`;

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const ws = useRef(null);

  // Conectar WebSocket
  const connect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new ReconnectingWebSocket(WS_URL, [], {
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

  // Efectos
  useEffect(() => {
    connect();

    // Ping cada 30 segundos para mantener conexión viva
    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, sendPing, disconnect]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    markAsRead,
    getUnreadCount,
    sendPing,
    reconnect: connect,
  };
};
