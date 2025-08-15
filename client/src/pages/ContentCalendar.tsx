import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  Image as ImageIcon,
  Hash,
  TrendingUp,
  Copy,
  Edit,
  Trash2,
  Send,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PostAsset {
  id: string;
  caption: string;
  hashtags?: string;
  imageUrl?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  posts: PostAsset[];
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", color: "bg-pink-500", icon: "📸" },
  { value: "linkedin", label: "LinkedIn", color: "bg-blue-600", icon: "💼" },
  { value: "tiktok", label: "TikTok", color: "bg-black", icon: "🎵" },
  { value: "x", label: "X", color: "bg-gray-900", icon: "🐦" },
  { value: "facebook", label: "Facebook", color: "bg-blue-700", icon: "👥" }
];

const STATUS_COLORS = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  posted: "bg-green-500",
  failed: "bg-red-500"
};

const STATUS_LABELS = {
  draft: "Taslak",
  scheduled: "Planlandı",
  posted: "Yayınlandı",
  failed: "Başarısız"
};

const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostAsset | null>(null);
  
  const queryClient = useQueryClient();

  // New post form state
  const [newPost, setNewPost] = useState({
    caption: '',
    hashtags: '',
    imageUrl: '',
    platform: 'instagram',
    scheduledAt: ''
  });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    bestPerformingPlatform: '',
    optimalPostingTimes: [] as string[]
  });

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/posts');
      return response.json();
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setIsCreateDialogOpen(false);
      setNewPost({
        caption: '',
        hashtags: '',
        imageUrl: '',
        platform: 'instagram',
        scheduledAt: ''
      });
      toast({ title: "Başarılı", description: "Gönderi oluşturuldu!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PATCH', `/api/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: "Başarılı", description: "Gönderi güncellendi!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: "Başarılı", description: "Gönderi silindi!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  });

  // Schedule post via Zapier
  const schedulePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('POST', `/api/integrations/zapier/publish`, {
        postId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: "Başarılı", description: "Gönderi Zapier'a gönderildi!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  });

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        posts: posts.filter(post => 
          post.scheduledAt && 
          new Date(post.scheduledAt).toDateString() === date.toDateString()
        )
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        posts: posts.filter(post => 
          post.scheduledAt && 
          new Date(post.scheduledAt).toDateString() === date.toDateString()
        )
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        posts: posts.filter(post => 
          post.scheduledAt && 
          new Date(post.scheduledAt).toDateString() === date.toDateString()
        )
      });
    }
    
    return days;
  };

  // Calculate analytics
  useEffect(() => {
    if (posts.length > 0) {
      const scheduled = posts.filter(p => p.status === 'scheduled').length;
      const published = posts.filter(p => p.status === 'posted').length;
      
      // Find best performing platform (most posts)
      const platformCounts = posts.reduce((acc: any, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {});
      
      const bestPlatform = Object.entries(platformCounts).reduce((a: any, b: any) => 
        a[1] > b[1] ? a : b
      )?.[0] || '';

      // Calculate optimal posting times (simplified)
      const timeSlots = posts
        .filter(p => p.scheduledAt)
        .map(p => {
          const hour = new Date(p.scheduledAt!).getHours();
          if (hour >= 6 && hour < 12) return 'Sabah (6-12)';
          if (hour >= 12 && hour < 18) return 'Öğleden Sonra (12-18)';
          if (hour >= 18 && hour < 22) return 'Akşam (18-22)';
          return 'Gece (22-6)';
        });

      const timeSlotCounts = timeSlots.reduce((acc: any, slot) => {
        acc[slot] = (acc[slot] || 0) + 1;
        return acc;
      }, {});

      const optimalTimes = Object.entries(timeSlotCounts)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 3)
        .map(([slot]) => slot);

      setAnalyticsData({
        totalPosts: posts.length,
        scheduledPosts: scheduled,
        publishedPosts: published,
        bestPerformingPlatform: bestPlatform,
        optimalPostingTimes: optimalTimes
      });
    }
  }, [posts]);

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewPost(prev => ({
      ...prev,
      scheduledAt: date.toISOString().slice(0, 16)
    }));
    setIsCreateDialogOpen(true);
  };

  const handleCreatePost = () => {
    if (!newPost.caption.trim()) {
      toast({ title: "Hata", description: "Caption gerekli", variant: "destructive" });
      return;
    }

    createPostMutation.mutate({
      ...newPost,
      scheduledAt: newPost.scheduledAt || undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform) || PLATFORMS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 İçerik Takvimi</h1>
          <p className="text-gray-600 mt-1">Sosyal medya içeriklerinizi planlayın ve yönetin</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={calendarView} onValueChange={(value: any) => setCalendarView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Aylık</SelectItem>
              <SelectItem value="week">Haftalık</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Gönderi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Gönderi Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Platform</Label>
                    <Select value={newPost.platform} onValueChange={(value) => setNewPost(prev => ({ ...prev, platform: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center gap-2">
                              <span>{platform.icon}</span>
                              {platform.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Yayın Tarihi (İsteğe Bağlı)</Label>
                    <Input
                      type="datetime-local"
                      value={newPost.scheduledAt}
                      onChange={(e) => setNewPost(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Caption</Label>
                  <Textarea
                    placeholder="Gönderi metninizi yazın..."
                    value={newPost.caption}
                    onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Hashtag'ler</Label>
                  <Input
                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                    value={newPost.hashtags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, hashtags: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Görsel URL (İsteğe Bağlı)</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Gönderi</p>
                <p className="text-2xl font-bold">{analyticsData.totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Planlanmış</p>
                <p className="text-2xl font-bold">{analyticsData.scheduledPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Yayınlanmış</p>
                <p className="text-2xl font-bold">{analyticsData.publishedPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En İyi Platform</p>
                <p className="text-lg font-bold">
                  {analyticsData.bestPerformingPlatform ? 
                    getPlatformInfo(analyticsData.bestPerformingPlatform).label : 
                    'Veri yok'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimal Posting Times */}
      {analyticsData.optimalPostingTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Önerisi: Optimal Yayın Zamanları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analyticsData.optimalPostingTimes.map((time, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {time}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                  ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => handleDateClick(day.date)}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                
                {/* Posts for this day */}
                <div className="space-y-1">
                  {day.posts.slice(0, 3).map((post, postIndex) => {
                    const platformInfo = getPlatformInfo(post.platform);
                    return (
                      <div
                        key={postIndex}
                        className="text-xs p-1 rounded border-l-2 bg-gray-50"
                        style={{ borderLeftColor: platformInfo.color.replace('bg-', '#') }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>{platformInfo.icon}</span>
                          <Badge 
                            variant="secondary" 
                            className={`${STATUS_COLORS[post.status]} text-white text-xs px-1 py-0`}
                          >
                            {STATUS_LABELS[post.status]}
                          </Badge>
                        </div>
                        <div className="truncate mt-1">
                          {post.caption.slice(0, 30)}...
                        </div>
                        {post.scheduledAt && (
                          <div className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(post.scheduledAt)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {day.posts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.posts.length - 3} daha
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{getPlatformInfo(selectedPost.platform).icon}</span>
                {getPlatformInfo(selectedPost.platform).label} Gönderisi
                <Badge 
                  variant="secondary" 
                  className={`${STATUS_COLORS[selectedPost.status]} text-white`}
                >
                  {STATUS_LABELS[selectedPost.status]}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPost.imageUrl && (
                <div>
                  <img 
                    src={selectedPost.imageUrl} 
                    alt="Post image" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Caption</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedPost.caption}</p>
              </div>

              {selectedPost.hashtags && (
                <div>
                  <Label className="text-sm font-medium">Hashtag'ler</Label>
                  <p className="text-sm mt-1 text-blue-600">{selectedPost.hashtags}</p>
                </div>
              )}

              {selectedPost.scheduledAt && (
                <div>
                  <Label className="text-sm font-medium">Yayın Zamanı</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedPost.scheduledAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(selectedPost.caption)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Kopyala
                </Button>
                
                {selectedPost.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      schedulePostMutation.mutate(selectedPost.id);
                      setSelectedPost(null);
                    }}
                    disabled={schedulePostMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Zapier'a Gönder
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deletePostMutation.mutate(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Sil
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
