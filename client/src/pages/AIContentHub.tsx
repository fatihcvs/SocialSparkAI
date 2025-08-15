import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  MessageSquare, 
  Image, 
  Hash, 
  TrendingUp, 
  Target,
  Copy,
  RefreshCw,
  Wand2,
  Lightbulb,
  PenTool,
  BarChart3,
  Palette
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContentIdea {
  title: string;
  angle: string;
  keyPoints: string[];
  cta: string;
  optimalTiming: string;
  visualSuggestion: string;
}

interface CaptionVariant {
  variant: string;
  caption: string;
  hashtags: string[];
  engagement: "high" | "medium" | "low";
  hooks: string[];
}

interface HashtagSuggestions {
  trending: string[];
  niche: string[];
  branded: string[];
}

interface EngagementPrediction {
  score: number;
  suggestions: string[];
  optimizations: string[];
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", color: "bg-pink-500", icon: "📸" },
  { value: "linkedin", label: "LinkedIn", color: "bg-blue-600", icon: "💼" },
  { value: "tiktok", label: "TikTok", color: "bg-black", icon: "🎵" },
  { value: "x", label: "X (Twitter)", color: "bg-gray-900", icon: "🐦" },
  { value: "facebook", label: "Facebook", color: "bg-blue-700", icon: "👥" }
];

const TONES = [
  "Profesyonel", "Samimi", "Eğlenceli", "İlham verici", "Eğitici", 
  "Duygusal", "Otoriter", "Arkadaşça", "Yaratıcı", "Motive edici"
];

const INDUSTRIES = [
  { value: "tech", label: "Teknoloji" },
  { value: "business", label: "İş/Girişim" },
  { value: "lifestyle", label: "Yaşam Tarzı" },
  { value: "food", label: "Yemek/Gastronomi" }
];

export default function AIContentHub() {
  // State management
  const [activeTab, setActiveTab] = useState("ideas");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  
  // Ideas generation state
  const [ideasForm, setIdeasForm] = useState({
    topic: '',
    targetAudience: '',
    tone: '',
    quantity: 5
  });
  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea[]>([]);
  const [calendarHints, setCalendarHints] = useState<string[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);

  // Caption generation state
  const [captionForm, setCaptionForm] = useState({
    rawIdea: '',
    tone: '',
    keywords: [] as string[]
  });
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant[]>([]);

  // Hashtag generation state
  const [hashtagForm, setHashtagForm] = useState({
    content: '',
    niche: ''
  });
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestions | null>(null);

  // Engagement prediction state
  const [engagementForm, setEngagementForm] = useState({
    caption: '',
    postTime: '',
    hasImage: true
  });
  const [engagementPrediction, setEngagementPrediction] = useState<EngagementPrediction | null>(null);

  // Platform optimization state
  const [optimizationForm, setOptimizationForm] = useState({
    content: '',
    fromPlatform: 'instagram',
    toPlatforms: ['linkedin', 'x'] as string[]
  });
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  // Mutations
  const generateIdeasMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate/ideas", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedIdeas(data.ideas || []);
      setCalendarHints(data.calendarHints || []);
      setTrendingHashtags(data.trendingHashtags || []);
      toast({ title: "Başarılı", description: "İçerik fikirleri oluşturuldu!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const generateCaptionsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate/caption", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCaptions(data.variants || []);
      toast({ title: "Başarılı", description: "Caption varyantları oluşturuldu!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const generateHashtagsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/generate/hashtags", data);
      return response.json();
    },
    onSuccess: (data) => {
      setHashtagSuggestions(data);
      toast({ title: "Başarılı", description: "Hashtag önerileri oluşturuldu!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const predictEngagementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/predict/engagement", data);
      return response.json();
    },
    onSuccess: (data) => {
      setEngagementPrediction(data);
      toast({ title: "Başarılı", description: "Engagement tahmini tamamlandı!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const optimizePlatformMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai/optimize/platform", data);
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResults(data);
      toast({ title: "Başarılı", description: "Platform optimizasyonu tamamlandı!" });
    },
    onError: (error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  // Helper functions
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopyalandı", description: `${type} panoya kopyalandı` });
  };

  const getEngagementColor = (level: string) => {
    switch(level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI İçerik Hub'ı</h1>
          <p className="text-gray-600 mt-1">Yapay zeka destekli içerik üretim merkezi</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Powered
          </Badge>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-48">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Fikirler
          </TabsTrigger>
          <TabsTrigger value="captions" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Caption'lar
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtag'ler
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimizasyon
          </TabsTrigger>
        </TabsList>

        {/* Content Ideas Tab */}
        <TabsContent value="ideas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  İçerik Fikirler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Konu</Label>
                  <Input
                    placeholder="Örn: Verimlilik ipuçları"
                    value={ideasForm.topic}
                    onChange={(e) => setIdeasForm(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Hedef Kitle</Label>
                  <Input
                    placeholder="Örn: Genç profesyoneller"
                    value={ideasForm.targetAudience}
                    onChange={(e) => setIdeasForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Ton</Label>
                  <Select 
                    value={ideasForm.tone} 
                    onValueChange={(value) => setIdeasForm(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ton seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fikir Sayısı: {ideasForm.quantity}</Label>
                  <Input
                    type="range"
                    min="3"
                    max="10"
                    value={ideasForm.quantity}
                    onChange={(e) => setIdeasForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  />
                </div>
                <Button
                  onClick={() => generateIdeasMutation.mutate({
                    ...ideasForm,
                    platform: selectedPlatform
                  })}
                  disabled={generateIdeasMutation.isPending || !ideasForm.topic || !ideasForm.targetAudience}
                  className="w-full"
                >
                  {generateIdeasMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Üretiliyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Fikirler Üret
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {/* Calendar Hints */}
              {calendarHints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">⏰ Optimal Yayın Zamanları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {calendarHints.map((hint, index) => (
                        <Badge key={index} variant="outline">{hint}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm"># Trend Hashtag'ler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => copyToClipboard(tag, "Hashtag")}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Ideas */}
              <div className="space-y-4">
                {generatedIdeas.map((idea, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start justify-between">
                        {idea.title}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(
                            `${idea.title}\n\nAçı: ${idea.angle}\n\nAna Noktalar:\n${idea.keyPoints.map(p => `• ${p}`).join('\n')}\n\nCTA: ${idea.cta}`,
                            "İçerik fikri"
                          )}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium text-sm text-gray-600">Açı:</span>
                        <p className="text-sm">{idea.angle}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm text-gray-600">Ana Noktalar:</span>
                        <ul className="text-sm space-y-1 mt-1">
                          {idea.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>📅 {idea.optimalTiming}</span>
                          <span>🎨 {idea.visualSuggestion}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {idea.cta}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Captions Tab */}
        <TabsContent value="captions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Caption Üretimi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>İçerik Fikri</Label>
                  <Textarea
                    placeholder="Caption üretilecek içerik fikrini girin..."
                    value={captionForm.rawIdea}
                    onChange={(e) => setCaptionForm(prev => ({ ...prev, rawIdea: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Ton</Label>
                  <Select 
                    value={captionForm.tone} 
                    onValueChange={(value) => setCaptionForm(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ton seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => generateCaptionsMutation.mutate({
                    ...captionForm,
                    platform: selectedPlatform
                  })}
                  disabled={generateCaptionsMutation.isPending || !captionForm.rawIdea}
                  className="w-full"
                >
                  {generateCaptionsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Üretiliyor...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Caption'lar Üret
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <div className="space-y-4">
                {generatedCaptions.map((caption, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{caption.variant}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${getEngagementColor(caption.engagement)} text-white`}
                          >
                            {caption.engagement.toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(caption.caption, "Caption")}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm leading-relaxed">{caption.caption}</p>
                      
                      {caption.hooks.length > 0 && (
                        <div>
                          <span className="font-medium text-sm text-gray-600">Dikkat Çeken Açılışlar:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {caption.hooks.map((hook, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {hook}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium text-sm text-gray-600">Hashtag'ler:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {caption.hashtags.map((tag, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className="text-xs cursor-pointer"
                              onClick={() => copyToClipboard(tag, "Hashtag")}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Hashtag Önerileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>İçerik</Label>
                  <Textarea
                    placeholder="Hashtag üretilecek içeriği girin..."
                    value={hashtagForm.content}
                    onChange={(e) => setHashtagForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Niche (İsteğe Bağlı)</Label>
                  <Input
                    placeholder="Örn: Teknoloji, Fitness, Food"
                    value={hashtagForm.niche}
                    onChange={(e) => setHashtagForm(prev => ({ ...prev, niche: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={() => generateHashtagsMutation.mutate({
                    ...hashtagForm,
                    platform: selectedPlatform
                  })}
                  disabled={generateHashtagsMutation.isPending || !hashtagForm.content}
                  className="w-full"
                >
                  {generateHashtagsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Üretiliyor...
                    </>
                  ) : (
                    <>
                      <Hash className="w-4 h-4 mr-2" />
                      Hashtag'ler Üret
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {hashtagSuggestions && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🔥 Trend Hashtag'ler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {hashtagSuggestions.trending.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => copyToClipboard(tag, "Hashtag")}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎯 Niche Hashtag'ler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {hashtagSuggestions.niche.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-blue-100"
                            onClick={() => copyToClipboard(tag, "Hashtag")}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🏷️ Marka Hashtag'leri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {hashtagSuggestions.branded.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="default" 
                            className="cursor-pointer hover:bg-green-100"
                            onClick={() => copyToClipboard(tag, "Hashtag")}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Engagement Prediction Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Engagement Tahmini
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Caption</Label>
                  <Textarea
                    placeholder="Tahmin edilecek caption'ı girin..."
                    value={engagementForm.caption}
                    onChange={(e) => setEngagementForm(prev => ({ ...prev, caption: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Gönderi Zamanı</Label>
                  <Input
                    placeholder="Örn: Pazartesi sabah 9"
                    value={engagementForm.postTime}
                    onChange={(e) => setEngagementForm(prev => ({ ...prev, postTime: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasImage"
                    checked={engagementForm.hasImage}
                    onChange={(e) => setEngagementForm(prev => ({ ...prev, hasImage: e.target.checked }))}
                  />
                  <Label htmlFor="hasImage">Görsel var</Label>
                </div>
                <Button
                  onClick={() => predictEngagementMutation.mutate({
                    ...engagementForm,
                    platform: selectedPlatform
                  })}
                  disabled={predictEngagementMutation.isPending || !engagementForm.caption}
                  className="w-full"
                >
                  {predictEngagementMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Tahmin Ediliyor...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Engagement Tahmin Et
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {engagementPrediction && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Engagement Skoru
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {engagementPrediction.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={engagementPrediction.score} className="h-4" />
                      <p className="text-sm text-gray-600 mt-2">
                        {engagementPrediction.score >= 80 ? "Yüksek engagement bekleniyor!" :
                         engagementPrediction.score >= 60 ? "Orta seviye engagement bekleniyor." :
                         "Düşük engagement riski var."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">💡 İyileştirme Önerileri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {engagementPrediction.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎯 Optimizasyon Tavsiyeleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {engagementPrediction.optimizations.map((optimization, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {optimization}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Platform Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Platform Optimizasyonu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>İçerik</Label>
                  <Textarea
                    placeholder="Optimize edilecek içeriği girin..."
                    value={optimizationForm.content}
                    onChange={(e) => setOptimizationForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Kaynak Platform</Label>
                  <Select 
                    value={optimizationForm.fromPlatform} 
                    onValueChange={(value) => setOptimizationForm(prev => ({ ...prev, fromPlatform: value }))}
                  >
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
                  <Label>Hedef Platformlar</Label>
                  <div className="space-y-2">
                    {PLATFORMS.filter(p => p.value !== optimizationForm.fromPlatform).map(platform => (
                      <div key={platform.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={platform.value}
                          checked={optimizationForm.toPlatforms.includes(platform.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setOptimizationForm(prev => ({
                                ...prev,
                                toPlatforms: [...prev.toPlatforms, platform.value]
                              }));
                            } else {
                              setOptimizationForm(prev => ({
                                ...prev,
                                toPlatforms: prev.toPlatforms.filter(p => p !== platform.value)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={platform.value} className="flex items-center gap-2">
                          <span>{platform.icon}</span>
                          {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => optimizePlatformMutation.mutate(optimizationForm)}
                  disabled={optimizePlatformMutation.isPending || !optimizationForm.content || optimizationForm.toPlatforms.length === 0}
                  className="w-full"
                >
                  {optimizePlatformMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Optimize Ediliyor...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Optimize Et
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              {optimizationResults && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">📝 Orijinal İçerik</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm bg-gray-50 p-3 rounded">{optimizationResults.originalContent}</p>
                      <Badge variant="outline" className="mt-2">
                        {PLATFORMS.find(p => p.value === optimizationResults.fromPlatform)?.label}
                      </Badge>
                    </CardContent>
                  </Card>

                  {optimizationResults.optimizations?.map((opt: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{PLATFORMS.find(p => p.value === opt.platform)?.icon}</span>
                          {PLATFORMS.find(p => p.value === opt.platform)?.label} Optimizasyonu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {opt.suggestions?.map((suggestion: any, i: number) => (
                          <div key={i} className="border rounded p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs mb-2">
                                  {suggestion.variant}
                                </Badge>
                                <p className="text-sm">{suggestion.caption}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {suggestion.hashtags?.map((tag: string, j: number) => (
                                    <Badge key={j} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(suggestion.caption, "Optimized caption")}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
