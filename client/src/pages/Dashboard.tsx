import { useQuery } from "@tanstack/react-query";
import QuickStart from "@/components/QuickStart";
import ContentCalendar from "@/components/ContentCalendar";
import AITools from "@/components/AITools";
import RecentPosts from "@/components/RecentPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CalendarCheck, Brain, Zap, PenTool, ImageIcon, Send, Copy } from "lucide-react";
import type { UserStats } from "@/types";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-slate-500">Toplam Gönderi</div>
                <div className="text-2xl font-semibold text-slate-900" data-testid="stat-total-posts">
                  {stats?.totalPosts || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-slate-500">Planlanmış</div>
                <div className="text-2xl font-semibold text-slate-900" data-testid="stat-scheduled-posts">
                  {stats?.scheduledPosts || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-slate-500">AI Fikir</div>
                <div className="text-2xl font-semibold text-slate-900" data-testid="stat-ai-ideas">
                  {stats?.aiIdeas || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-slate-500">Günlük Limit</div>
                <div className="text-2xl font-semibold text-slate-900" data-testid="stat-daily-limit">
                  {stats?.dailyUsage || 0}/{stats?.dailyLimit || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Wizard */}
      <QuickStart />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => window.location.href = '/ai-content?tab=ideas'}
            >
              <Brain className="w-5 h-5" />
              <span className="text-sm">AI Fikir Üret</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => window.location.href = '/ai-content?tab=captions'}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-sm">Caption Yaz</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => window.location.href = '/image-generation'}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm">Görsel Oluştur</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={() => window.location.href = '/social-publishing'}
            >
              <Send className="w-5 h-5" />
              <span className="text-sm">Hemen Yayınla</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Calendar */}
        <div className="lg:col-span-2">
          <ContentCalendar />
        </div>

        {/* Recent Posts & AI Tools */}
        <div className="space-y-6">
          <AITools />
          <RecentPosts />
        </div>
      </div>
    </div>
  );
}