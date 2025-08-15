import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { MessageCircle, Image, Calendar, Crown } from "lucide-react";

export default function AITools() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const tools = [
    {
      id: "caption",
      title: "Caption Üret",
      description: "AI ile caption varyantları",
      icon: MessageCircle,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      route: "/ai-content",
      disabled: false,
    },
    {
      id: "image",
      title: "Görsel Oluştur", 
      description: "AI ile özel görseller",
      icon: Image,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      route: "/image-generation",
      disabled: false,
    },
    {
      id: "social-publishing",
      title: "Sosyal Medya Yayını",
      description: "Zapier/Make entegrasyonu",
      icon: Calendar,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      route: "/social-publishing",
      disabled: user?.plan !== "pro",
      isPro: true,
    },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.disabled) {
      return;
    }
    setLocation(tool.route);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4" data-testid="heading-ai-tools">
          AI İçerik Araçları
        </h3>
        
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="relative">
              <button
                onClick={() => handleToolClick(tool)}
                disabled={tool.disabled}
                className={`w-full flex items-center p-3 text-left border border-slate-200 rounded-lg transition-colors ${
                  tool.disabled 
                    ? "bg-slate-50 cursor-not-allowed opacity-60" 
                    : "hover:bg-slate-50"
                }`}
                data-testid={`button-ai-tool-${tool.id}`}
              >
                <div className={`w-8 h-8 ${tool.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                  <tool.icon className={`w-4 h-4 ${tool.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{tool.title}</div>
                  <div className="text-xs text-slate-500">{tool.description}</div>
                </div>
              </button>
              
              {tool.isPro && (
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {user?.plan !== "pro" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pro Özellikler</p>
                <p className="text-xs text-blue-700">
                  Zapier entegrasyonu için Pro plana yükseltin
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setLocation("/billing")}
              data-testid="button-upgrade-from-tools"
            >
              Pro'ya Yükselt
            </Button>
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
import { Brain, Sparkles, ImageIcon, TrendingUp, Clock, Users } from "lucide-react";

export default function AITools() {
  const tools = [
    {
      icon: Brain,
      title: "İçerik Fikirleri",
      description: "AI ile viral içerik fikirleri üret",
      href: "/ai-content?tab=ideas",
      badge: "GPT-4o",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Sparkles,
      title: "Caption Üret",
      description: "Platform özelinde caption'lar yaz",
      href: "/ai-content?tab=captions",
      badge: "Multi-platform",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: ImageIcon,
      title: "Görsel Oluştur",
      description: "DALL-E 3 ile professional görseller",
      href: "/ai-content?tab=images",
      badge: "DALL-E 3",
      color: "text-green-600 bg-green-100"
    }
  ];

  const insights = [
    {
      icon: TrendingUp,
      label: "En İyi Performans",
      value: "Instagram Reels",
      trend: "+15%"
    },
    {
      icon: Clock,
      label: "Optimal Zaman",
      value: "18:00-20:00",
      trend: "Hafta içi"
    },
    {
      icon: Users,
      label: "Hedef Kitle",
      value: "25-35 yaş",
      trend: "Aktif"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Araçları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Tools */}
        <div className="space-y-3">
          {tools.map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.color}`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{tool.title}</h4>
                  <p className="text-xs text-slate-500">{tool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{tool.badge}</Badge>
                <Button size="sm" variant="ghost" onClick={() => window.location.href = tool.href}>
                  Kullan
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-sm mb-3 text-slate-700">AI İçgörüleri</h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <insight.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">{insight.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">{insight.value}</div>
                  <div className="text-xs text-green-600">{insight.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trend Analizi
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Kitle Analizi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
