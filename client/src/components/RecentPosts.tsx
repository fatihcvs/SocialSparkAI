import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  createdAt: string;
  publishedAt?: string;
}

export default function RecentPosts() {
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/posts");
      return response.json();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published": return "Yayınlandı";
      case "scheduled": return "Zamanlandı";
      case "draft": return "Taslak";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Gönderiler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentPosts = posts.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Son Gönderiler</CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/posts"}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Tümünü Gör
        </Button>
      </CardHeader>
      <CardContent>
        {recentPosts.length === 0 ? (
          <p className="text-slate-500">Henüz gönderi bulunmuyor.</p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{post.title}</h4>
                  <Badge className={getStatusColor(post.status)} variant="secondary">
                    {getStatusText(post.status)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                  {post.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                  <span className="capitalize">{post.platform}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}