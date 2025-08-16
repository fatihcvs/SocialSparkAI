import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, TrendingUp, Target, Zap, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ContentScoring {
  engagementScore: number;
  qualityScore: number;
  platformOptimization: number;
  brandAlignment: number;
  overallScore: number;
  suggestions: string[];
}

interface PersonalizedSuggestions {
  recommendedTones: string[];
  recommendedPlatforms: string[];
  industryContext: string;
  brandVoiceKeywords: string[];
  contentStyle: string;
  historicalPerformance: {
    avgEngagement: number;
    totalContent: number;
  };
}

export default function AdvancedAI() {
  const [activeTab, setActiveTab] = useState("personalized");
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [contentType, setContentType] = useState("post");
  const [contentToScore, setContentToScore] = useState("");
  const [multiModalTopic, setMultiModalTopic] = useState("");
  const [multiModalType, setMultiModalType] = useState("video_script");

  const queryClient = useQueryClient();

  // Get personalized suggestions
  const { data: suggestions } = useQuery<PersonalizedSuggestions>({
    queryKey: ["/api/ai/personalized-suggestions", contentType],
    enabled: true
  });

  // Get performance analysis
  const { data: performanceAnalysis } = useQuery({
    queryKey: ["/api/ai/performance-analysis"],
    enabled: true
  });

  // Personalized content generation
  const personalizedContentMutation = useMutation({
    mutationFn: async (data: { prompt: string; platform: string; contentType: string }) => {
      const response = await fetch("/api/ai/personalized-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to generate personalized content");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Kişiselleştirilmiş içerik oluşturuldu!");
    },
    onError: () => {
      toast.error("İçerik oluşturulurken hata oluştu");
    }
  });

  // Content scoring
  const contentScoringMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await fetch("/api/ai/score-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to score content");
      return response.json();
    },
    onSuccess: () => {
      toast.success("İçerik skorlandı!");
    }
  });

  // Multi-modal content generation
  const multiModalMutation = useMutation({
    mutationFn: async (data: { contentType: string; topic: string; platform: string; duration?: number }) => {
      const response = await fetch("/api/ai/multi-modal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to generate multi-modal content");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Multi-modal içerik oluşturuldu!");
    }
  });

  // A/B test recommendations
  const abTestMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await fetch("/api/ai/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to generate A/B test recommendations");
      return response.json();
    },
    onSuccess: () => {
      toast.success("A/B test önerileri oluşturuldu!");
    }
  });

  const handleGeneratePersonalized = () => {
    if (!prompt.trim()) {
      toast.error("Lütfen bir prompt girin");
      return;
    }
    personalizedContentMutation.mutate({ prompt, platform, contentType });
  };

  const handleScoreContent = () => {
    if (!contentToScore.trim()) {
      toast.error("Lütfen skorlanacak içeriği girin");
      return;
    }
    contentScoringMutation.mutate({ content: contentToScore, platform });
  };

  const handleGenerateMultiModal = () => {
    if (!multiModalTopic.trim()) {
      toast.error("Lütfen bir konu girin");
      return;
    }
    multiModalMutation.mutate({ 
      contentType: multiModalType, 
      topic: multiModalTopic, 
      platform,
      duration: multiModalType.includes('video') ? 60 : undefined 
    });
  };

  const handleGenerateABTest = () => {
    if (!contentToScore.trim()) {
      toast.error("Lütfen test edilecek içeriği girin");
      return;
    }
    abTestMutation.mutate({ content: contentToScore, platform });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Advanced AI Features
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gelişmiş AI ile kişiselleştirilmiş, optimize edilmiş içerikler üretin
          </p>
        </motion.div>

        {/* Personalization Overview */}
        {suggestions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-gradient">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Kişiselleştirilmiş Öneriler</span>
                </CardTitle>
                <CardDescription>
                  Davranış analizinize dayalı AI önerileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Önerilen Tonlar</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.recommendedTones.map((tone, index) => (
                        <Badge key={index} variant="secondary">{tone}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Tercih Edilen Platformlar</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.recommendedPlatforms.map((platform, index) => (
                        <Badge key={index} variant="outline">{platform}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Performans</h4>
                    <p className="text-sm text-gray-600">
                      Ortalama Engagement: {(suggestions.historicalPerformance.avgEngagement * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Toplam İçerik: {suggestions.historicalPerformance.totalContent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personalized" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Kişiselleştirilmiş</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>İçerik Skorlama</span>
            </TabsTrigger>
            <TabsTrigger value="multimodal" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Multi-Modal</span>
            </TabsTrigger>
            <TabsTrigger value="abtest" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>A/B Test</span>
            </TabsTrigger>
          </TabsList>

          {/* Personalized Content Generation */}
          <TabsContent value="personalized" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kişiselleştirilmiş İçerik Üretimi</CardTitle>
                <CardDescription>
                  Davranış analiziniz ve marka sesinize dayalı optimize edilmiş içerik
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">İçerik Türü</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video_script">Video Script</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">İçerik Prompt'u</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ne hakkında içerik üretmek istiyorsunuz?"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleGeneratePersonalized}
                  disabled={personalizedContentMutation.isPending}
                  className="w-full"
                >
                  {personalizedContentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Kişiselleştirilmiş İçerik Üret
                    </>
                  )}
                </Button>

                {personalizedContentMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Üretilen İçerik:</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{personalizedContentMutation.data.content}</p>
                      </div>
                    </div>
                    
                    {personalizedContentMutation.data.scoring && (
                      <div>
                        <h4 className="font-medium mb-2">Kalite Skoru:</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Genel Skor</span>
                            <span>{(personalizedContentMutation.data.scoring.overallScore * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={personalizedContentMutation.data.scoring.overallScore * 100} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Scoring */}
          <TabsContent value="scoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI İçerik Skorlama</CardTitle>
                <CardDescription>
                  İçeriğinizin engagement potansiyelini ve kalitesini analiz edin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Skorlanacak İçerik</label>
                  <Textarea
                    value={contentToScore}
                    onChange={(e) => setContentToScore(e.target.value)}
                    placeholder="Skorlamak istediğiniz içeriği buraya yapıştırın..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleScoreContent}
                  disabled={contentScoringMutation.isPending}
                  className="w-full"
                >
                  {contentScoringMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Skorlanıyor...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      İçeriği Skorla
                    </>
                  )}
                </Button>

                {contentScoringMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-4">
                      <ScoreCard 
                        title="Engagement Skoru" 
                        score={contentScoringMutation.data.engagementScore}
                        color="blue" 
                      />
                      <ScoreCard 
                        title="Kalite Skoru" 
                        score={contentScoringMutation.data.qualityScore}
                        color="green" 
                      />
                      <ScoreCard 
                        title="Platform Optimizasyonu" 
                        score={contentScoringMutation.data.platformOptimization}
                        color="purple" 
                      />
                      <ScoreCard 
                        title="Marka Uyumu" 
                        score={contentScoringMutation.data.brandAlignment}
                        color="orange" 
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Öneriler:</h4>
                      <ul className="space-y-1">
                        {contentScoringMutation.data.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Modal Content */}
          <TabsContent value="multimodal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Modal İçerik Üretimi</CardTitle>
                <CardDescription>
                  Video script, audio content, carousel ve interactive içerik üretin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">İçerik Türü</label>
                    <Select value={multiModalType} onValueChange={setMultiModalType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video_script">Video Script</SelectItem>
                        <SelectItem value="audio_script">Audio Script</SelectItem>
                        <SelectItem value="carousel_content">Carousel Content</SelectItem>
                        <SelectItem value="poll_content">Poll Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Konu</label>
                  <Input
                    value={multiModalTopic}
                    onChange={(e) => setMultiModalTopic(e.target.value)}
                    placeholder="İçerik konusunu girin..."
                  />
                </div>

                <Button 
                  onClick={handleGenerateMultiModal}
                  disabled={multiModalMutation.isPending}
                  className="w-full"
                >
                  {multiModalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Multi-Modal İçerik Üret
                    </>
                  )}
                </Button>

                {multiModalMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Üretilen İçerik:</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(multiModalMutation.data.content, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* A/B Testing */}
          <TabsContent value="abtest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>A/B Test Önerileri</CardTitle>
                <CardDescription>
                  İçeriğinizin farklı varyasyonlarını test edin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Test Edilecek İçerik</label>
                  <Textarea
                    value={contentToScore}
                    onChange={(e) => setContentToScore(e.target.value)}
                    placeholder="A/B test için orijinal içeriğinizi girin..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleGenerateABTest}
                  disabled={abTestMutation.isPending}
                  className="w-full"
                >
                  {abTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      A/B Test Varyasyonları Üret
                    </>
                  )}
                </Button>

                {abTestMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Orijinal İçerik:</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{abTestMutation.data.original.content}</p>
                        </div>
                      </div>

                      {abTestMutation.data.variations.map((variation: any, index: number) => (
                        <div key={index}>
                          <h4 className="font-medium mb-2">Varyasyon {index + 1}:</h4>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="whitespace-pre-wrap">{variation.content}</p>
                            {variation.scoring && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="text-sm text-blue-600">
                                  Skor: {(variation.scoring.overallScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  color: "blue" | "green" | "purple" | "orange";
}

function ScoreCard({ title, score, color }: ScoreCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <h5 className="font-medium mb-2">{title}</h5>
      <div className="flex items-center space-x-2">
        <Progress value={score * 100} className="flex-1" />
        <span className="text-sm font-medium">{(score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}