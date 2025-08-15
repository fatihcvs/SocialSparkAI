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
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreHorizontal, ExternalLink, Edit3 } from "lucide-react";

export default function RecentPosts() {
  const recentPosts = [
    {
      id: 1,
      caption: "Kahve deneyimi ve müşteri memnuniyeti üzerine düşünceler ☕️ #quality #experience",
      platform: "instagram",
      status: "posted",
      scheduledAt: "2025-01-15T14:30:00Z",
      createdAt: "2025-01-15T10:00:00Z",
      engagement: { likes: 45, comments: 8, shares: 3 }
    },
    {
      id: 2,
      caption: "Startup dünyasında en önemli şey müşteri geri bildirimleri. İşte öğrendiklerimiz:",
      platform: "linkedin",
      status: "scheduled",
      scheduledAt: "2025-01-16T09:00:00Z",
      createdAt: "2025-01-15T16:20:00Z",
      engagement: null
    },
    {
      id: 3,
      caption: "2025'te AI teknolojisi sosyal medya pazarlamasını nasıl dönüştürüyor? 🤖",
      platform: "x",
      status: "draft",
      scheduledAt: null,
      createdAt: "2025-01-15T18:45:00Z",
      engagement: null
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return "📸";
      case "linkedin": return "💼";
      case "x": return "🐦";
      case "tiktok": return "🎵";
      default: return "📱";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700';
      case 'linkedin': return 'bg-blue-100 text-blue-700';
      case 'x': return 'bg-gray-100 text-gray-700';
      case 'tiktok': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-orange-100 text-orange-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'posted': return 'Yayında';
      case 'scheduled': return 'Planlandı';
      case 'draft': return 'Taslak';
      case 'failed': return 'Başarısız';
      default: return 'Bilinmiyor';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Son Gönderiler
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/posts'}>
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentPosts.map((post) => (
          <div key={post.id} className="border border-slate-200 rounded-lg p-3">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={getPlatformColor(post.platform)}>
                  {getPlatformIcon(post.platform)} {post.platform}
                </Badge>
                <Badge className={getStatusColor(post.status)} variant="outline">
                  {getStatusText(post.status)}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-700 mb-3 line-clamp-2">
              {post.caption}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div>
                {post.status === 'scheduled' && post.scheduledAt ? (
                  <span>Yayın: {formatDate(post.scheduledAt)}</span>
                ) : post.status === 'posted' ? (
                  <span>Yayında: {formatDate(post.scheduledAt || post.createdAt)}</span>
                ) : (
                  <span>Oluşturuldu: {formatDate(post.createdAt)}</span>
                )}
              </div>
              
              {post.engagement && (
                <div className="flex items-center gap-3">
                  <span>❤️ {post.engagement.likes}</span>
                  <span>💬 {post.engagement.comments}</span>
                  <span>🔄 {post.engagement.shares}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              {post.status === 'draft' && (
                <Button size="sm" variant="outline">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Düzenle
                </Button>
              )}
              {(post.status === 'posted' || post.status === 'scheduled') && (
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Görüntüle
                </Button>
              )}
            </div>
          </div>
        ))}

        {recentPosts.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Henüz gönderi yok</p>
            <Button onClick={() => window.location.href = '/ai-content'}>
              İlk Gönderini Oluştur
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
