import { useQuery } from "@tanstack/react-query";
import QuickStart from "@/components/QuickStart";
import ContentCalendar from "@/components/ContentCalendar";
import AITools from "@/components/AITools";
import RecentPosts from "@/components/RecentPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileCard, TouchButton, ResponsiveGrid, PullToRefresh } from "@/components/ui/mobile-optimized";
import { useIsMobile, useBreakpoint } from "@/hooks/useMediaQuery";
import { FileText, CalendarCheck, Brain, Zap, PenTool, ImageIcon, Send, Copy, TrendingUp } from "lucide-react";
import type { UserStats } from "@/types";

export default function Dashboard() {
  const { data: stats, isLoading, refetch } = useQuery<UserStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  
  const isMobile = useIsMobile();
  const { current: breakpoint } = useBreakpoint();

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <ResponsiveGrid 
          columns={{ xs: 1, sm: 2, lg: 4 }}
          gap={isMobile ? 3 : 6}
        >
          {[...Array(4)].map((_, i) => (
            <MobileCard key={i} className="animate-pulse">
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </MobileCard>
          ))}
        </ResponsiveGrid>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className={isMobile ? "space-y-4 p-4" : "space-y-8 p-6"}>
        {/* Mobile-Optimized Stats Dashboard */}
        <ResponsiveGrid 
          columns={{ xs: 1, sm: 2, lg: 4 }}
          gap={isMobile ? 3 : 6}
        >
        <MobileCard className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Toplam Gönderiler
              </p>
              <p className={isMobile ? "text-2xl font-bold text-blue-900 dark:text-blue-100" : "text-3xl font-bold text-blue-900 dark:text-blue-100"}>
                {stats?.totalPosts || 0}
              </p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </div>
            </div>
            <div className={isMobile ? "p-2 rounded-full bg-blue-200 dark:bg-blue-800" : "p-3 rounded-full bg-blue-200 dark:bg-blue-800"}>
              <FileText className={isMobile ? "h-5 w-5 text-blue-600 dark:text-blue-400" : "h-6 w-6 text-blue-600 dark:text-blue-400"} />
            </div>
          </div>
        </MobileCard>

        <MobileCard className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Planlanmış
              </p>
              <p className={isMobile ? "text-2xl font-bold text-green-900 dark:text-green-100" : "text-3xl font-bold text-green-900 dark:text-green-100"}>
                {stats?.scheduledPosts || 0}
              </p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8%
              </div>
            </div>
            <div className={isMobile ? "p-2 rounded-full bg-green-200 dark:bg-green-800" : "p-3 rounded-full bg-green-200 dark:bg-green-800"}>
              <CalendarCheck className={isMobile ? "h-5 w-5 text-green-600 dark:text-green-400" : "h-6 w-6 text-green-600 dark:text-green-400"} />
            </div>
          </div>
        </MobileCard>

        <MobileCard className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                AI Kullanımı
              </p>
              <p className={isMobile ? "text-2xl font-bold text-purple-900 dark:text-purple-100" : "text-3xl font-bold text-purple-900 dark:text-purple-100"}>
                {(stats as any)?.aiUsageToday || 0}
              </p>
              <div className="flex items-center text-sm text-red-600 dark:text-red-400 mt-1">
                <span className="mr-1">↘</span>
                -5%
              </div>
            </div>
            <div className={isMobile ? "p-2 rounded-full bg-purple-200 dark:bg-purple-800" : "p-3 rounded-full bg-purple-200 dark:bg-purple-800"}>
              <Brain className={isMobile ? "h-5 w-5 text-purple-600 dark:text-purple-400" : "h-6 w-6 text-purple-600 dark:text-purple-400"} />
            </div>
          </div>
        </MobileCard>

        <MobileCard className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                Bu Ay
              </p>
              <p className={isMobile ? "text-2xl font-bold text-orange-900 dark:text-orange-100" : "text-3xl font-bold text-orange-900 dark:text-orange-100"}>
                {(stats as any)?.aiUsageMonth || 0}
              </p>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +24%
              </div>
            </div>
            <div className={isMobile ? "p-2 rounded-full bg-orange-200 dark:bg-orange-800" : "p-3 rounded-full bg-orange-200 dark:bg-orange-800"}>
              <Zap className={isMobile ? "h-5 w-5 text-orange-600 dark:text-orange-400" : "h-6 w-6 text-orange-600 dark:text-orange-400"} />
            </div>
          </div>
        </MobileCard>
        </ResponsiveGrid>

      
      {/* Mobile-Optimized Quick Actions */}
      <MobileCard className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="w-5 h-5" />
            Hızlı İşlemler
          </h3>
        </div>
        
        <ResponsiveGrid 
          columns={{ xs: 2, sm: 4 }}
          gap={isMobile ? 3 : 4}
        >
          <TouchButton
            variant="ghost"
            size={isMobile ? "md" : "lg"}
            onClick={() => window.location.href = '/ai-content?tab=ideas'}
            className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 h-auto py-4"
          >
            <Brain className={isMobile ? "w-5 h-5 mb-2" : "w-6 h-6 mb-2"} />
            <span className={isMobile ? "text-xs" : "text-sm"}>AI Fikir Üret</span>
          </TouchButton>
          
          <TouchButton
            variant="ghost"
            size={isMobile ? "md" : "lg"}
            onClick={() => window.location.href = '/ai-content?tab=captions'}
            className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 h-auto py-4"
          >
            <PenTool className={isMobile ? "w-5 h-5 mb-2" : "w-6 h-6 mb-2"} />
            <span className={isMobile ? "text-xs" : "text-sm"}>Caption Yaz</span>
          </TouchButton>
          
          <TouchButton
            variant="ghost"
            size={isMobile ? "md" : "lg"}
            onClick={() => window.location.href = '/image-generation'}
            className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 h-auto py-4"
          >
            <ImageIcon className={isMobile ? "w-5 h-5 mb-2" : "w-6 h-6 mb-2"} />
            <span className={isMobile ? "text-xs" : "text-sm"}>Görsel Oluştur</span>
          </TouchButton>
          
          <TouchButton
            variant="ghost"
            size={isMobile ? "md" : "lg"}
            onClick={() => window.location.href = '/social-publishing'}
            className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 h-auto py-4"
          >
            <Send className={isMobile ? "w-5 h-5 mb-2" : "w-6 h-6 mb-2"} />
            <span className={isMobile ? "text-xs" : "text-sm"}>Hemen Yayınla</span>
          </TouchButton>
        </ResponsiveGrid>
      </MobileCard>

      {/* Mobile-Optimized Main Content */}
      <ResponsiveGrid 
        columns={{ xs: 1, lg: 3 }}
        gap={isMobile ? 4 : 8}
      >
        {/* Content Calendar */}
        <div className="lg:col-span-2">
          <ContentCalendar />
        </div>

        {/* Recent Posts & AI Tools */}
        <div className={isMobile ? "space-y-4" : "space-y-6"}>
          <AITools />
          <RecentPosts />
        </div>
      </ResponsiveGrid>
      </div>
    </PullToRefresh>
  );
}