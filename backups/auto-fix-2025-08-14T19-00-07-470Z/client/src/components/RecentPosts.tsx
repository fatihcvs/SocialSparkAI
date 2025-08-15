import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ExternalLink } from "lucide-react";
import type { PostAsset } from "@/types";

export default function RecentPosts() {
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading } = useQuery<PostAsset[]>({
    queryKey: ["/api/posts"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-700";
      case "scheduled": return "bg-blue-100 text-blue-700";
      case "posted": return "bg-green-100 text-green-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "Taslak";
      case "scheduled": return "Planlandı";
      case "posted": return "Yayınlandı";
      case "failed": return "Başarısız";
      default: return status;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram": return "text-pink-600";
      case "linkedin": return "text-blue-600";
      case "x": return "text-gray-600";
      case "tiktok": return "text-purple-600";
      default: return "text-slate-600";
    }
  };

  const recentPosts = posts.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900" data-testid="heading-recent-posts">
            Son Gönderiler
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/posts")}
            data-testid="button-view-all-posts"
          >
            <span className="text-sm text-blue-600 hover:text-blue-700">Tümünü Gör</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        {recentPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500" data-testid="text-no-posts">
              Henüz gönderi yok
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setLocation("/ai-content")}
              data-testid="button-create-first-post"
            >
              İlk Gönderinizi Oluşturun
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-start space-x-3" data-testid={`recent-post-${post.id}`}>
                {post.imageUrl ? (
                  <img 
                    src={post.imageUrl} 
                    alt="Post görseli" 
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate" data-testid={`post-caption-${post.id}`}>
                    {post.caption}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge className={getStatusColor(post.status)} data-testid={`post-status-${post.id}`}>
                      {getStatusText(post.status)}
                    </Badge>
                    <span className={`text-xs ${getPlatformColor(post.platform)}`} data-testid={`post-platform-${post.id}`}>
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                  </div>
                  {post.scheduledAt && (
                    <p className="text-xs text-slate-500 mt-1" data-testid={`post-scheduled-${post.id}`}>
                      {new Date(post.scheduledAt).toLocaleDateString("tr-TR")} {new Date(post.scheduledAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
