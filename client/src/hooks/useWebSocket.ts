import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketConfig {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useWebSocket(
  token: string | null,
  config: WebSocketConfig = {}
) {
  const {
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = config;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  const connect = useCallback(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    setConnectionState('connecting');
    setError(null);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, heartbeatInterval);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Call specific handler if exists
          const handler = messageHandlersRef.current.get(message.type);
          if (handler) {
            handler(message.data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Auto-reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = () => {
        setConnectionState('error');
        setError('WebSocket connection failed');
      };

    } catch (err) {
      setConnectionState('error');
      setError('Failed to create WebSocket connection');
    }
  }, [token, autoReconnect, reconnectInterval, maxReconnectAttempts, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  }, []);

  const sendMessage = useCallback((type: string, data: any = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
    messageHandlersRef.current.set(messageType, handler);
    
    return () => {
      messageHandlersRef.current.delete(messageType);
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    return sendMessage('join_room', { room });
  }, [sendMessage]);

  const leaveRoom = useCallback((room: string) => {
    return sendMessage('leave_room', { room });
  }, [sendMessage]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    error,
    sendMessage,
    subscribe,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
    isConnected: connectionState === 'connected'
  };
}

export function useRealTimeQuery<T>(
  queryKey: string[],
  wsMessageType: string,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery<{ token?: string }>({ queryKey: ["/api/auth/me"] });
  const token = user?.token;

  const { subscribe, isConnected } = useWebSocket(token || null);

  useEffect(() => {
    if (!isConnected || !enabled) return;

    const unsubscribe = subscribe(wsMessageType, (data) => {
      // Update the query cache with real-time data
      queryClient.setQueryData(queryKey, data);
    });

    return unsubscribe;
  }, [isConnected, enabled, subscribe, wsMessageType, queryKey, queryClient]);

  return useQuery<T>({
    queryKey,
    enabled: enabled && isConnected
  });
}

export function useRealtimeStats() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const token = (user as any)?.token;

  const { subscribe, joinRoom, isConnected } = useWebSocket(token);

  useEffect(() => {
    if (!isConnected) return;

    // Join stats room
    joinRoom('stats_updates');

    // Subscribe to stats updates
    const unsubscribe = subscribe('stats_updated', (data) => {
      queryClient.setQueryData(["/api/dashboard/stats"], data);
    });

    return unsubscribe;
  }, [isConnected, subscribe, joinRoom, queryClient]);

  return { isConnected };
}

export function useRealtimePosts() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const token = (user as any)?.token;

  const { subscribe, joinRoom, isConnected } = useWebSocket(token);

  useEffect(() => {
    if (!isConnected) return;

    // Join posts room
    joinRoom('posts_updates');

    // Subscribe to post updates
    const unsubscribe = subscribe('post_updated', (data) => {
      const { post, action } = data;
      
      // Update posts cache based on action
      queryClient.setQueryData(["/api/posts"], (oldData: any[] = []) => {
        switch (action) {
          case 'created':
            return [post, ...oldData];
          case 'updated':
            return oldData.map(p => p.id === post.id ? post : p);
          case 'deleted':
            return oldData.filter(p => p.id !== post.id);
          default:
            return oldData;
        }
      });
    });

    return unsubscribe;
  }, [isConnected, subscribe, joinRoom, queryClient]);

  return { isConnected };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const token = (user as any)?.token;

  const { subscribe, isConnected } = useWebSocket(token);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeActivity = subscribe('activity_notification', (data) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]); // Keep last 50
    });

    const unsubscribeSystem = subscribe('system_notification', (data) => {
      setNotifications(prev => [{ ...data, isSystem: true }, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubscribeActivity();
      unsubscribeSystem();
    };
  }, [isConnected, subscribe]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    clearNotifications,
    removeNotification,
    isConnected
  };
}

export function useAIProgress() {
  const [progress, setProgress] = useState<{ step: string; percentage: number; message?: string } | null>(null);
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const token = (user as any)?.token;

  const { subscribe, isConnected } = useWebSocket(token);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('ai_progress', (data) => {
      setProgress(data);
      
      // Auto-clear progress when complete
      if (data.percentage >= 100) {
        setTimeout(() => setProgress(null), 2000);
      }
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  return { progress, isConnected };
}