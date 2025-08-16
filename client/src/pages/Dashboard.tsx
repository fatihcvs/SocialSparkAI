import { useQuery } from "@tanstack/react-query";
import QuickStart from "@/components/QuickStart";
import ContentCalendar from "@/components/ContentCalendar";
import AITools from "@/components/AITools";
import RecentPosts from "@/components/RecentPosts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CalendarCheck, Brain, Zap, PenTool, ImageIcon, Send, Copy, TrendingUp } from "lucide-react";
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
      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Toplam Gönderiler</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.totalPosts || 0}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12%
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-200">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Planlanmış</p>
                <p className="text-3xl font-bold text-green-900">{stats?.scheduledPosts || 0}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8%
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-200">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">AI Kullanımı</p>
                <p className="text-3xl font-bold text-purple-900">{(stats as any)?.aiUsageToday || 0}</p>
                <div className="flex items-center text-sm text-red-600 mt-1">
                  <span className="mr-1">↘</span>
                  -5%
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-200">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Bu Ay</p>
                <p className="text-3xl font-bold text-orange-900">{(stats as any)?.aiUsageMonth || 0}</p>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +24%
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-200">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
      {/* Enhanced Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
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