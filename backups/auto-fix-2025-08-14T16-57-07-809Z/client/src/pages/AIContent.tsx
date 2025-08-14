import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, Sparkles, Copy, Clock, Lightbulb, Send, Image } from "lucide-react";
import CaptionGenerator from "@/components/CaptionGenerator";
import type { ContentIdea, CaptionVariant } from "@/types";

export default function AIContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"ideas" | "captions" | "images">("ideas");
  
  // Ideas form state
  const [ideasForm, setIdeasForm] = useState({
    topic: "",
    targetAudience: "",
    platform: "",
    tone: "",
    quantity: 5,
  });

  // Caption form state
  const [captionForm, setCaptionForm] = useState({
    rawIdea: "",
    platform: "",
    tone: "",
    keywords: "",
  });

  // Image form state
  const [imageForm, setImageForm] = useState({
    prompt: "",
    aspectRatio: "1:1" as "1:1" | "16:9" | "9:16",
    styleHints: "",
  });

  const [generatedIdeas, setGeneratedIdeas] = useState<ContentIdea | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant[]>([]);
  const [generatedImage, setGeneratedImage] = useState<{ url: string } | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);

  const { data: contentIdeas = [] } = useQuery<ContentIdea[]>({
    queryKey: ["/api/content-ideas"],
  });

  const generateIdeasMutation = useMutation({
    mutationFn: async (data: typeof ideasForm) => {
      const response = await apiRequest("POST", "/api/ai/generate/ideas", data);
      return response.json();
    },
    onSuccess: (data: ContentIdea) => {
      setGeneratedIdeas(data);
      toast({
        title: "Başarılı",
        description: "İçerik fikirleri oluşturuldu!",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateCaptionsMutation = useMutation({
    mutationFn: async (data: typeof captionForm) => {
      const keywords = data.keywords ? data.keywords.split(",").map(k => k.trim()) : [];
      const response = await apiRequest("POST", "/api/ai/generate/caption", {
        ...data,
        keywords,
      });
      return response.json();
    },
    onSuccess: (data: { variants: CaptionVariant[] }) => {
      setGeneratedCaptions(data.variants);
      toast({
        title: "Başarılı",
        description: "Caption varyantları oluşturuldu!",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (data: typeof imageForm) => {
      const response = await apiRequest("POST", "/api/ai/generate/image", data);
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      setGeneratedImage(data);
      toast({
        title: "Başarılı",
        description: "Görsel oluşturuldu!",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateIdeas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideasForm.topic || !ideasForm.targetAudience || !ideasForm.platform || !ideasForm.tone) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    generateIdeasMutation.mutate(ideasForm);
  };

  const handleGenerateCaptions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionForm.rawIdea || !captionForm.platform || !captionForm.tone) {
      toast({
        title: "Hata",
        description: "Lütfen gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    generateCaptionsMutation.mutate(captionForm);
  };

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageForm.prompt.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen görsel açıklaması girin",
        variant: "destructive",
      });
      return;
    }
    generateImageMutation.mutate(imageForm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Metin panoya kopyalandı",
    });
  };

  const generateCaptionFromIdea = (ideaTitle: string, ideaAngle: string) => {
    setActiveTab("captions");
    setCaptionForm({
      ...captionForm,
      rawIdea: `${ideaTitle}: ${ideaAngle}`,
    });
    
    toast({
      title: "Hazırlandı",
      description: "Caption üretimi için form dolduruldu",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-ai-content">
          AI İçerik Üret
        </h1>
        <p className="text-slate-600">
          Yapay zeka ile içerik fikirleri, caption'lar ve görseller oluşturun
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("ideas")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "ideas"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid="tab-ideas"
        >
          <Brain className="w-4 h-4 inline mr-2" />
          İçerik Fikirleri
        </button>
        <button
          onClick={() => setActiveTab("captions")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "captions"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid="tab-captions"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Caption Üret
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "images"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid="tab-images"
        >
          <Image className="w-4 h-4 inline mr-2" />
          Görsel Üret
        </button>
      </div>

      {/* Ideas Tab */}
      {activeTab === "ideas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ideas Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                İçerik Fikirleri Oluştur
              </h2>
              
              <form onSubmit={handleGenerateIdeas} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Konu</Label>
                  <Input
                    id="topic"
                    placeholder="Kahve markası, teknoloji startupı..."
                    value={ideasForm.topic}
                    onChange={(e) => setIdeasForm({ ...ideasForm, topic: e.target.value })}
                    data-testid="input-ideas-topic"
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Hedef Kitle</Label>
                  <Select onValueChange={(value) => setIdeasForm({ ...ideasForm, targetAudience: value })}>
                    <SelectTrigger data-testid="select-ideas-audience">
                      <SelectValue placeholder="Hedef kitle seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25 Genç Yetişkinler">18-25 Genç Yetişkinler</SelectItem>
                      <SelectItem value="25-35 Profesyoneller">25-35 Profesyoneller</SelectItem>
                      <SelectItem value="35+ Deneyimli Kitle">35+ Deneyimli Kitle</SelectItem>
                      <SelectItem value="Girişimciler">Girişimciler</SelectItem>
                      <SelectItem value="Öğrenciler">Öğrenciler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => setIdeasForm({ ...ideasForm, platform: value })}>
                    <SelectTrigger data-testid="select-ideas-platform">
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
                  <Select onValueChange={(value) => setIdeasForm({ ...ideasForm, tone: value })}>
                    <SelectTrigger data-testid="select-ideas-tone">
                      <SelectValue placeholder="Ton seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Samimi">Samimi</SelectItem>
                      <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                      <SelectItem value="Eğlenceli">Eğlenceli</SelectItem>
                      <SelectItem value="Bilgilendirici">Bilgilendirici</SelectItem>
                      <SelectItem value="İlham Verici">İlham Verici</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Fikir Sayısı</Label>
                  <Select onValueChange={(value) => setIdeasForm({ ...ideasForm, quantity: parseInt(value) })}>
                    <SelectTrigger data-testid="select-ideas-quantity">
                      <SelectValue placeholder="Fikir sayısı" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Fikir</SelectItem>
                      <SelectItem value="5">5 Fikir</SelectItem>
                      <SelectItem value="7">7 Fikir</SelectItem>
                      <SelectItem value="10">10 Fikir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={generateIdeasMutation.isPending}
                  data-testid="button-generate-ideas"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {generateIdeasMutation.isPending ? "Oluşturuluyor..." : "Fikirler Oluştur"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Ideas */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Oluşturulan Fikirler
              </h2>

              {generatedIdeas ? (
                <div className="space-y-6">
                  {/* Calendar Hints */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Önerilen Zamanlama</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedIdeas.ideas.calendarHints?.map((hint, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {hint}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Ideas */}
                  <div className="space-y-4">
                    {generatedIdeas.ideas.ideas?.map((idea, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{idea.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(idea.title)}
                            data-testid={`button-copy-idea-${index}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{idea.angle}</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-slate-500">Ana Noktalar:</span>
                            <ul className="text-sm text-slate-600 mt-1 space-y-1">
                              {idea.keyPoints?.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start">
                                  <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {idea.cta && (
                            <div>
                              <span className="text-xs font-medium text-slate-500">Çağrı:</span>
                              <p className="text-sm text-blue-600 font-medium">{idea.cta}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCaptionFromIdea(idea.title, idea.angle)}
                            className="w-full"
                            data-testid={`button-caption-from-idea-${index}`}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Caption Üret
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    İçerik fikirleri oluşturmak için formu doldurun
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Captions Tab */}
      {activeTab === "captions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Caption Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Caption Varyantları Oluştur
              </h2>
              
              <form onSubmit={handleGenerateCaptions} className="space-y-4">
                <div>
                  <Label htmlFor="rawIdea">İçerik Konusu</Label>
                  <Textarea
                    id="rawIdea"
                    placeholder="Kahve deneyimi ve müşteri memnuniyeti hakkında bir post..."
                    value={captionForm.rawIdea}
                    onChange={(e) => setCaptionForm({ ...captionForm, rawIdea: e.target.value })}
                    className="h-24"
                    data-testid="textarea-caption-idea"
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => setCaptionForm({ ...captionForm, platform: value })}>
                    <SelectTrigger data-testid="select-caption-platform">
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
                  <Select onValueChange={(value) => setCaptionForm({ ...captionForm, tone: value })}>
                    <SelectTrigger data-testid="select-caption-tone">
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

                <div>
                  <Label htmlFor="keywords">Anahtar Kelimeler (isteğe bağlı)</Label>
                  <Input
                    id="keywords"
                    placeholder="kalite, deneyim, memnuniyet (virgülle ayırın)"
                    value={captionForm.keywords}
                    onChange={(e) => setCaptionForm({ ...captionForm, keywords: e.target.value })}
                    data-testid="input-caption-keywords"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={generateCaptionsMutation.isPending}
                  data-testid="button-generate-captions"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateCaptionsMutation.isPending ? "Oluşturuluyor..." : "Caption Varyantları Oluştur"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Captions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Caption Varyantları
              </h2>

              {generatedCaptions.length > 0 ? (
                <div className="space-y-4">
                  {generatedCaptions.map((variant, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-slate-700">
                          {variant.variant}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${variant.caption}\n\n${variant.hashtags.join(' ')}`)}
                          data-testid={`button-copy-caption-${index}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-slate-900 mb-3 whitespace-pre-wrap">
                        {variant.caption}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {variant.hashtags.map((hashtag, hashIndex) => (
                          <span key={hashIndex} className="text-blue-600 text-sm">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(`${variant.caption}\n\n${variant.hashtags.join(' ')}`)}
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Kopyala
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Pre-fill post data and navigate
                              const postData = {
                                caption: `${variant.caption}\n\n${variant.hashtags.join(' ')}`,
                                imageUrl: "",
                                platform: "",
                                scheduledAt: "",
                              };
                              localStorage.setItem('pendingPost', JSON.stringify(postData));
                              window.open('/social-publishing', '_blank');
                            }}
                            className="flex-1"
                            data-testid={`button-create-post-${index}`}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Post Oluştur
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    Caption varyantları oluşturmak için formu doldurun
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                AI Görsel Oluştur
              </h2>
              
              <form onSubmit={handleGenerateImage} className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Görsel Açıklaması</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Professional social media post image with modern design, blue and purple colors..."
                    value={imageForm.prompt}
                    onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                    data-testid="input-image-prompt"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="aspectRatio">En-Boy Oranı</Label>
                  <Select onValueChange={(value) => setImageForm({ ...imageForm, aspectRatio: value as "1:1" | "16:9" | "9:16" })}>
                    <SelectTrigger data-testid="select-image-aspect-ratio">
                      <SelectValue placeholder="En-boy oranı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1 (Instagram Post)</SelectItem>
                      <SelectItem value="16:9">16:9 (LinkedIn, YouTube)</SelectItem>
                      <SelectItem value="9:16">9:16 (Instagram Story)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="styleHints">Stil İpuçları (isteğe bağlı)</Label>
                  <Input
                    id="styleHints"
                    placeholder="minimalist, modern, colorful, photography..."
                    value={imageForm.styleHints}
                    onChange={(e) => setImageForm({ ...imageForm, styleHints: e.target.value })}
                    data-testid="input-image-style-hints"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={generateImageMutation.isPending}
                  data-testid="button-generate-image"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {generateImageMutation.isPending ? "Oluşturuluyor..." : "Görsel Oluştur"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Image */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Oluşturulan Görsel
              </h2>

              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-slate-50 rounded-lg overflow-hidden">
                    <img
                      src={generatedImage.url}
                      alt="AI Oluşturulan Görsel"
                      className="w-full h-auto rounded-lg"
                      data-testid="generated-image"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generatedImage.url)}
                      className="flex-1"
                      data-testid="button-copy-image-url"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      URL Kopyala
                    </Button>
                    <Button
                      onClick={() => {
                        const postData = {
                          caption: "",
                          imageUrl: generatedImage.url,
                          platform: "",
                          scheduledAt: "",
                        };
                        localStorage.setItem('pendingPost', JSON.stringify(postData));
                        window.open('/social-publishing', '_blank');
                      }}
                      className="flex-1"
                      data-testid="button-use-in-post"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post'ta Kullan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    AI görsel oluşturmak için formu doldurun
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Previous Ideas */}
      {contentIdeas.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Önceki İçerik Fikirleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentIdeas.slice(0, 6).map((idea) => (
                <div key={idea.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getPlatformColor(idea.platform)}>
                      {idea.platform.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {idea.tone}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">{idea.topic}</h4>
                  <p className="text-sm text-slate-600 mb-2">{idea.targetAudience}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(idea.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
