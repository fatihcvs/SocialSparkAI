import { RealtimeConnectionStatus, RealtimeNotifications, RealtimeStatsWidget } from '@/components/ui/realtime-dashboard';

export default function RealtimeHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">SocialSparkAI</h1>
        <RealtimeStatsWidget />
      </div>
      
      <div className="flex items-center gap-3">
        <RealtimeConnectionStatus />
        <RealtimeNotifications />
      </div>
    </div>
  );
}