import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { PostAsset } from "@/types";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newPost, setNewPost] = useState({
    caption: "",
    hashtags: "",
    platform: "",
    scheduledAt: "",
  });

  const { data: posts = [], isLoading } = useQuery<PostAsset[]>({
    queryKey: ["/api/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: typeof newPost) => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gönderi oluşturuldu!",
      });
      setIsDialogOpen(false);
      setNewPost({ caption: "", hashtags: "", platform: "", scheduledAt: "" });
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.caption || !newPost.platform || !newPost.scheduledAt) {
      toast({
        title: "Hata",
        description: "Lütfen gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const isoString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNewPost({ ...newPost, scheduledAt: isoString });
    setIsDialogOpen(true);
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

  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900" data-testid="heading-calendar">
              İçerik Takvimi
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium min-w-[200px] text-center" data-testid="text-current-month">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-post">
                    <Plus className="w-4 h-4 mr-2" />
                    Gönderi Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Yeni Gönderi Planla</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select onValueChange={(value) => setNewPost({ ...newPost, platform: value })}>
                        <SelectTrigger data-testid="select-post-platform">
                          <SelectValue placeholder="Platform seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="x">Twitter/X</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="caption">Caption</Label>
                      <Textarea
                        id="caption"
                        placeholder="Gönderi metninizi yazın..."
                        value={newPost.caption}
                        onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                        data-testid="textarea-post-caption"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hashtags">Hashtag'ler</Label>
                      <Input
                        id="hashtags"
                        placeholder="#örnek #hashtag"
                        value={newPost.hashtags}
                        onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                        data-testid="input-post-hashtags"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledAt">Tarih ve Saat</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={newPost.scheduledAt}
                        onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                        data-testid="input-scheduled-at"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createPostMutation.isPending}
                      data-testid="button-create-post"
                    >
                      {createPostMutation.isPending ? "Oluşturuluyor..." : "Gönderi Oluştur"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="min-h-[100px]"></div>;
                }

                const dayPosts = getPostsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={date.toDateString()}
                    className="min-h-[100px] p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleDateClick(date)}
                    data-testid={`calendar-day-${date.getDate()}`}
                  >
                    <div className={`text-sm mb-2 ${isToday ? 'font-bold text-blue-600' : 'text-slate-600'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map((post) => (
                        <div
                          key={post.id}
                          className={`text-xs px-2 py-1 rounded truncate ${getPlatformColor(post.platform)}`}
                          title={post.caption}
                        >
                          {post.platform.toUpperCase()}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-slate-500">
                          +{dayPosts.length - 2} daha
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Platform Renkleri</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span className="text-sm text-slate-600">Instagram</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-slate-600">LinkedIn</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-sm text-slate-600">Twitter/X</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-sm text-slate-600">TikTok</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
