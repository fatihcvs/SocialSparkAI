import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Calendar, Share, Filter, Download, FileText } from "lucide-react";
import type { PostAsset } from "@/types";

export default function Posts() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPost, setEditingPost] = useState<PostAsset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: posts = [], isLoading } = useQuery<PostAsset[]>({
    queryKey: ["/api/posts", statusFilter === "all" ? undefined : statusFilter],
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PostAsset> }) => {
      const response = await apiRequest("PATCH", `/api/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gönderi güncellendi!",
      });
      setIsEditDialogOpen(false);
      setEditingPost(null);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gönderi silindi!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/posts/${postId}/publish`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gönderi Zapier'e iletildi!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportCSVMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/csv", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "posts.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Başarılı",
        description: "Gönderiler CSV olarak indirildi!",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Export başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter(post => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesSearch = post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.hashtags && post.hashtags.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
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
      case "instagram": return "bg-pink-100 text-pink-700";
      case "linkedin": return "bg-blue-100 text-blue-700";
      case "x": return "bg-gray-100 text-gray-700";
      case "tiktok": return "bg-purple-100 text-purple-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleEdit = (post: PostAsset) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    updatePostMutation.mutate({
      id: editingPost.id,
      data: {
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        scheduledAt: editingPost.scheduledAt,
      },
    });
  };

  const handleSendNow = (post: PostAsset) => {
    if (user?.plan !== "pro") {
      toast({
        title: "Pro Özelliği",
        description: "Zapier gönderimi için Pro planı gerekli",
        variant: "destructive",
      });
      return;
    }
    sendPostMutation.mutate(post.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-posts">Gönderiler</h1>
          <p className="text-slate-600">Tüm gönderilerinizi yönetin</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => exportCSVMutation.mutate()}
            disabled={exportCSVMutation.isPending}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Gönderilerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-posts"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="scheduled">Planlandı</SelectItem>
                <SelectItem value="posted">Yayınlandı</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz gönderi yok</h3>
              <p className="text-slate-600">İlk gönderinizi oluşturmaya başlayın</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={getPlatformColor(post.platform)}>
                        {post.platform.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusText(post.status)}
                      </Badge>
                      {post.scheduledAt && (
                        <span className="text-sm text-slate-500">
                          {new Date(post.scheduledAt).toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-900 mb-2 line-clamp-3" data-testid={`post-caption-${post.id}`}>
                      {post.caption}
                    </p>
                    
                    {post.hashtags && (
                      <p className="text-blue-600 text-sm mb-3" data-testid={`post-hashtags-${post.id}`}>
                        {post.hashtags}
                      </p>
                    )}

                    {post.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={post.imageUrl}
                          alt="Post görseli"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="text-xs text-slate-500">
                      Oluşturulma: {new Date(post.createdAt).toLocaleString("tr-TR")}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {post.status === "draft" && user?.plan === "pro" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNow(post)}
                        disabled={sendPostMutation.isPending}
                        data-testid={`button-send-${post.id}`}
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Zapier ile Gönder
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gönderi Düzenle</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                  id="edit-caption"
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  data-testid="textarea-edit-caption"
                />
              </div>
              <div>
                <Label htmlFor="edit-hashtags">Hashtag'ler</Label>
                <Input
                  id="edit-hashtags"
                  value={editingPost.hashtags || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, hashtags: e.target.value })}
                  data-testid="input-edit-hashtags"
                />
              </div>
              <div>
                <Label htmlFor="edit-scheduled">Planlanmış Tarih</Label>
                <Input
                  id="edit-scheduled"
                  type="datetime-local"
                  value={editingPost.scheduledAt ? new Date(editingPost.scheduledAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingPost({ 
                    ...editingPost, 
                    scheduledAt: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  data-testid="input-edit-scheduled"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={updatePostMutation.isPending}
                data-testid="button-save-edit"
              >
                {updatePostMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
