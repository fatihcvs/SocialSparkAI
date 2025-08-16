import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Wifi, WifiOff, Activity, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRealtimeStats, useNotifications, useWebSocket } from '@/hooks/useWebSocket';
import { useQuery } from '@tanstack/react-query';

interface LiveMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export function RealtimeConnectionStatus() {
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const { isConnected } = useWebSocket((user as any)?.token);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={false}
        animate={{ 
          scale: isConnected ? 1 : 0.8,
          opacity: isConnected ? 1 : 0.6 
        }}
        transition={{ duration: 0.2 }}
      >
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
      </motion.div>
      <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Canlı' : 'Bağlantı Kesildi'}
      </span>
    </div>
  );
}

export function LiveMetricsCard() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { label: 'Aktif Kullanıcılar', value: 0, trend: 'stable', color: 'blue' },
    { label: 'Anlık API Calls', value: 0, trend: 'stable', color: 'green' },
    { label: 'Cache Hit Rate', value: 0, trend: 'stable', color: 'purple' },
    { label: 'Ortalama Response', value: 0, trend: 'stable', color: 'orange' }
  ]);

  const { isConnected } = useRealtimeStats();

  // Simulate real-time updates for demo
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10) - 5,
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-blue-500" />
          Canlı Metrikler
          <RealtimeConnectionStatus />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </span>
                <motion.div
                  animate={{
                    scale: metric.trend !== 'stable' ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {metric.trend === 'up' && <span className="text-green-500 text-xs">↗</span>}
                  {metric.trend === 'down' && <span className="text-red-500 text-xs">↘</span>}
                  {metric.trend === 'stable' && <span className="text-gray-400 text-xs">—</span>}
                </motion.div>
              </div>
              
              <motion.div
                key={metric.value}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-2xl font-bold text-${metric.color}-600`}
              >
                {metric.value}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RealtimeNotifications() {
  const { notifications, clearNotifications, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border z-50"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Bildirimler</h3>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="text-sm"
                  >
                    Tümünü Temizle
                  </Button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Yeni bildirim yok
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.title || 'Yeni Aktivite'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message || 'Detay bulunamadı'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const { data: user } = useQuery({ queryKey: ["/api/auth/me"] });
  const { subscribe, isConnected } = useWebSocket((user as any)?.token);

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('activity_notification', (data) => {
      setActivities(prev => [
        {
          id: Date.now(),
          type: data.type || 'info',
          message: data.message || 'Yeni aktivite',
          timestamp: Date.now(),
          user: data.user || 'Sistem'
        },
        ...prev.slice(0, 19) // Keep last 20 activities
      ]);
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Canlı Aktivite Akışı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {activities.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Henüz aktivite yok
              </div>
            ) : (
              activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

export function RealtimeStatsWidget() {
  const { isConnected } = useRealtimeStats();
  const [pulseColor, setPulseColor] = useState('bg-green-500');

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseColor(isConnected ? 'bg-green-500' : 'bg-red-500');
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${pulseColor}`} />
        <div className={`absolute inset-0 w-2 h-2 rounded-full ${pulseColor} animate-ping opacity-75`} />
      </div>
      <span className="text-gray-600 dark:text-gray-400">
        {isConnected ? 'Canlı Veriler' : 'Bağlantı Bekleniyor'}
      </span>
    </div>
  );
}