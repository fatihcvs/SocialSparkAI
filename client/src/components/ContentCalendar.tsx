import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostAsset } from "@/types";

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  const { data: posts = [], isLoading } = useQuery<PostAsset[]>({
    queryKey: ["/api/posts"],
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram": return "bg-pink-100 text-pink-700";
      case "linkedin": return "bg-blue-100 text-blue-700";
      case "x": return "bg-gray-100 text-gray-700";
      case "tiktok": return "bg-purple-100 text-purple-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getPlatformShortName = (platform: string) => {
    switch (platform) {
      case "instagram": return "IG";
      case "linkedin": return "LI";
      case "x": return "X";
      case "tiktok": return "TT";
      default: return platform.toUpperCase().slice(0, 2);
    }
  };

  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900" data-testid="heading-content-calendar">
            İçerik Takvimi
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
                data-testid="button-week-view"
              >
                Hafta
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
                data-testid="button-month-view"
              >
                Ay
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                data-testid="button-calendar-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-medium min-w-[180px] text-center" data-testid="text-calendar-month">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                data-testid="button-calendar-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
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
                return <div key={index} className="min-h-[80px]"></div>;
              }

              const dayPosts = getPostsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toDateString()}
                  className="min-h-[80px] p-1 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                  data-testid={`calendar-cell-${date.getDate()}`}
                >
                  <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-slate-600'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getPlatformColor(post.platform)}`}
                        title={post.caption}
                        data-testid={`calendar-post-${post.id}`}
                      >
                        {getPlatformShortName(post.platform)}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-slate-500">
                        +{dayPosts.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span className="text-slate-600">Instagram</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-600">LinkedIn</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-slate-600">Twitter/X</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-slate-600">TikTok</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, ArrowLeft, ArrowRight } from "lucide-react";

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const mockPosts = [
    { day: 15, platform: 'instagram', title: 'Kahve deneyimi', status: 'scheduled' },
    { day: 18, platform: 'linkedin', title: 'Startup öykü', status: 'posted' },
    { day: 22, platform: 'x', title: 'Teknoloji trend', status: 'draft' },
  ];

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
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-slate-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const postsForDay = mockPosts.filter(post => post.day === day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() && 
                     new Date().getFullYear() === currentDate.getFullYear();
      
      days.push(
        <div key={day} className={`h-20 border border-slate-200 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
              {day}
            </span>
            {postsForDay.length > 0 && (
              <span className="text-xs text-slate-500">{postsForDay.length}</span>
            )}
          </div>
          <div className="space-y-1">
            {postsForDay.slice(0, 2).map((post, index) => (
              <div key={index} className="text-xs">
                <Badge className={`${getPlatformColor(post.platform)} text-xs py-0 px-1`}>
                  {post.platform}
                </Badge>
                <div className="text-xs text-slate-600 truncate mt-1">
                  {post.title}
                </div>
              </div>
            ))}
            {postsForDay.length > 2 && (
              <div className="text-xs text-slate-500">+{postsForDay.length - 2} daha</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            İçerik Takvimi
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-sm min-w-[120px] text-center">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => window.location.href = '/ai-content'}>
              <Plus className="w-4 h-4 mr-1" />
              Yeni Post
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden">
          {/* Header with day names */}
          {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
            <div key={day} className="bg-slate-100 p-2 text-center text-sm font-medium text-slate-700 border-b border-slate-200">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Yayınlandı</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Planlandı</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 rounded"></div>
              <span>Taslak</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Zamanlama Önerileri
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
