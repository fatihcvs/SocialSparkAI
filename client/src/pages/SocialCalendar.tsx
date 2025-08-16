import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarClock, Clock, Send, TrendingUp, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt: Date;
  status: string;
}

interface OptimalTime {
  date: Date;
  platform: string;
  engagementScore: number;
  reason: string;
}

export default function SocialCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [isScheduling, setIsScheduling] = useState(false);

  const queryClient = useQueryClient();

  // Get scheduled posts
  const { data: scheduledPostsResponse, isLoading } = useQuery({
    queryKey: ["/api/social/scheduled"],
    retry: false
  });

  const scheduledPosts = scheduledPostsResponse?.posts || [];

  // Get optimal times for selected platform
  const { data: optimalTimesResponse } = useQuery({
    queryKey: ["/api/social/optimal-times/linkedin"],
    enabled: selectedPlatforms.length > 0,
    retry: false
  });

  const optimalTimes = optimalTimesResponse?.suggestions || [];

  // Schedule post mutation
  const schedulePostMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      platforms: string[];
      scheduledAt: string;
    }) => {
      const response = await fetch("/api/social/schedule", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to schedule post");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Post başarıyla zamanlandı!");
      setNewPostContent("");
      setSelectedPlatforms([]);
      queryClient.invalidateQueries({ queryKey: ["/api/social/scheduled"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Post zamanlanırken hata oluştu");
    }
  });

  const handleSchedulePost = () => {
    if (!newPostContent.trim() || selectedPlatforms.length === 0) {
      toast.error("İçerik ve en az bir platform seçin");
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    schedulePostMutation.mutate({
      content: newPostContent,
      platforms: selectedPlatforms,
      scheduledAt: scheduledDateTime.toISOString()
    });
  };

  const platformColors = {
    linkedin: "bg-blue-500",
    twitter: "bg-sky-400", 
    instagram: "bg-pink-500",
    facebook: "bg-blue-600",
    tiktok: "bg-black"
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      const dayPosts = Array.isArray(scheduledPosts) ? scheduledPosts.filter(post => {
        const postDate = new Date(post.scheduledAt);
        return postDate.toDateString() === date.toDateString();
      }) : [];

      days.push({
        date: new Date(date),
        posts: dayPosts,
        isToday: date.toDateString() === now.toDateString(),
        isPast: date < now
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İçerik Takvimi</h1>
          <p className="text-gray-600 mt-2">
            Sosyal medya içeriklerinizi planlayın ve zamanlayın
          </p>
        </div>
        <Button 
          onClick={() => setIsScheduling(!isScheduling)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Post</span>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Zamanlanmış Gönderiler</span>
              </CardTitle>
              <CardDescription>
                Bu ayki planlanmış içerikleriniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {calendarDays.map((day, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`
                        p-2 border rounded-lg cursor-pointer min-h-[80px] relative
                        ${day.isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                        ${day.isPast ? 'opacity-60' : ''}
                      `}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className="text-sm font-medium">
                        {day.date.getDate()}
                      </div>
                      
                      {day.posts.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {day.posts.slice(0, 2).map((post, postIndex) => (
                            <div
                              key={postIndex}
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: `${platformColors[post.platforms[0] as keyof typeof platformColors]}20` }}
                            >
                              {post.platforms.join(', ')}
                            </div>
                          ))}
                          {day.posts.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{day.posts.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Schedule Panel */}
        <div className="space-y-6">
          {/* New Post Scheduler */}
          {isScheduling && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarClock className="h-5 w-5" />
                    <span>Yeni Post Zamanla</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Post içeriğinizi yazın..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Platformlar</label>
                    <div className="flex flex-wrap gap-2">
                      {['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok'].map(platform => (
                        <Badge
                          key={platform}
                          variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedPlatforms(prev => 
                              prev.includes(platform)
                                ? prev.filter(p => p !== platform)
                                : [...prev, platform]
                            );
                          }}
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tarih</label>
                      <Input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Saat</label>
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSchedulePost}
                    disabled={schedulePostMutation.isPending}
                    className="w-full"
                  >
                    {schedulePostMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Zamanlanıyor...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Zamanla
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Optimal Times */}
          {Array.isArray(optimalTimes) && optimalTimes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Optimal Zamanlar</span>
                </CardTitle>
                <CardDescription>
                  En yüksek engagement için öneriler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimalTimes.slice(0, 5).map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {formatDate(new Date(time.date))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {time.reason}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {(time.engagementScore * 100).toFixed(0)}% score
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Son Zamanlanmış</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(scheduledPosts) && scheduledPosts.length > 0 ? (
                  scheduledPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex space-x-1">
                          {Array.isArray(post.platforms) && post.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        <Badge 
                          variant={post.status === 'sent' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {post.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(new Date(post.scheduledAt))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Henüz zamanlanmış post yok
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}