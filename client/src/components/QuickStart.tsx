import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles } from "lucide-react";
import type { ContentIdea } from "@/types";

export default function QuickStart() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    topic: "",
    targetAudience: "",
    platform: "",
    tone: "",
  });

  const generateIdeasMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/ai/generate/ideas", {
        ...data,
        quantity: 5,
      });
      return response.json();
    },
    onSuccess: (data: ContentIdea) => {
      toast({
        title: "Başarılı",
        description: "İçerik fikirleri oluşturuldu!",
      });
      // You could redirect to content ideas page or show the results
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic || !formData.targetAudience || !formData.platform || !formData.tone) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    generateIdeasMutation.mutate(formData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4" data-testid="heading-quick-start">
          Hızlı Başlangıç
        </h2>
        <p className="text-slate-600 mb-6">
          AI ile içerik fikirleri oluşturun ve takvimde planlayın
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="topic">Konu</Label>
              <Input
                id="topic"
                placeholder="Kahve markası, teknoloji..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                data-testid="input-topic"
              />
            </div>
            
            <div>
              <Label htmlFor="audience">Hedef Kitle</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
              >
                <SelectTrigger data-testid="select-audience">
                  <SelectValue placeholder="Hedef kitle seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-25 Genç Yetişkinler">18-25 Genç Yetişkinler</SelectItem>
                  <SelectItem value="25-35 Profesyoneller">25-35 Profesyoneller</SelectItem>
                  <SelectItem value="35+ Deneyimli Kitle">35+ Deneyimli Kitle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger data-testid="select-platform">
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
              <Label htmlFor="tone">Ton</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger data-testid="select-tone">
                  <SelectValue placeholder="Ton seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Samimi">Samimi</SelectItem>
                  <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                  <SelectItem value="Eğlenceli">Eğlenceli</SelectItem>
                  <SelectItem value="Bilgilendirici">Bilgilendirici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit"
            disabled={generateIdeasMutation.isPending}
            data-testid="button-generate-ideas"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateIdeasMutation.isPending ? "Oluşturuluyor..." : "İçerik Fikirleri Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, ImageIcon, Send, CheckCircle } from "lucide-react";

export default function QuickStart() {
  const steps = [
    {
      id: 1,
      title: "AI İçerik Fikri Üret",
      description: "Konunuz için yaratıcı içerik fikirlerini keşfedin",
      icon: Brain,
      href: "/ai-content?tab=ideas",
      completed: false
    },
    {
      id: 2,
      title: "Caption Varyantları Oluştur",
      description: "Platform özelinde optimize edilmiş caption'lar yazın",
      icon: PenTool,
      href: "/ai-content?tab=captions",
      completed: false
    },
    {
      id: 3,
      title: "AI Görsel Oluştur",
      description: "DALL-E 3 ile profesyonel görseller üretin",
      icon: ImageIcon,
      href: "/ai-content?tab=images",
      completed: false
    },
    {
      id: 4,
      title: "Sosyal Medyaya Yayınla",
      description: "Zapier entegrasyonu ile otomatik paylaşım",
      icon: Send,
      href: "/social-publishing",
      completed: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Hızlı Başlangıç Rehberi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => window.location.href = step.href}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {step.id}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
