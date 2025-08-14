import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Image, Download, Sparkles, Copy } from "lucide-react";

interface GeneratedImage {
  url: string;
  prompt: string;
  aspectRatio: string;
  styleHints?: string;
  timestamp: Date;
}

export default function ImageGeneration() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    prompt: "",
    aspectRatio: "1:1",
    styleHints: "",
  });

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/ai/generate/image", data);
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      const newImage: GeneratedImage = {
        url: data.url,
        prompt: formData.prompt,
        aspectRatio: formData.aspectRatio,
        styleHints: formData.styleHints,
        timestamp: new Date(),
      };
      setGeneratedImages(prev => [newImage, ...prev]);
      toast({
        title: "Başarılı",
        description: "Görsel oluşturuldu!",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir prompt girin",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateImageMutation.mutate(formData);
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görsel indirilemedi",
        variant: "destructive",
      });
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Kopyalandı",
      description: "Prompt panoya kopyalandı",
    });
  };

  const getAspectRatioLabel = (ratio: string) => {
    switch (ratio) {
      case "1:1": return "Kare (Instagram Post)";
      case "16:9": return "Yatay (YouTube Thumbnail)";
      case "9:16": return "Dikey (Instagram Story)";
      default: return ratio;
    }
  };

  // Örnek prompt'lar
  const examplePrompts = [
    "Modern minimalist cafe interior with warm lighting",
    "Professional business team working in a modern office",
    "Colorful healthy breakfast bowl with fruits and granola",
    "Cozy reading corner with books and natural light",
    "Tech startup office with computers and whiteboards",
    "Beautiful sunset landscape with mountains",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-image-generation">
          Görsel Oluştur
        </h1>
        <p className="text-slate-600">
          AI ile sosyal medya gönderileriniz için özel görseller oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Görsel Ayarları
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Görsel Açıklaması</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Örn: Modern bir cafe iç mekanı, sıcak ışıklandırma ile..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="h-24"
                    data-testid="textarea-image-prompt"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Detaylı açıklamalar daha iyi sonuçlar verir
                  </p>
                </div>

                <div>
                  <Label htmlFor="aspectRatio">En-Boy Oranı</Label>
                  <Select 
                    value={formData.aspectRatio}
                    onValueChange={(value) => setFormData({ ...formData, aspectRatio: value })}
                  >
                    <SelectTrigger data-testid="select-aspect-ratio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1 - Kare (Instagram)</SelectItem>
                      <SelectItem value="16:9">16:9 - Yatay (YouTube)</SelectItem>
                      <SelectItem value="9:16">9:16 - Dikey (Story)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="styleHints">Stil İpuçları (İsteğe Bağlı)</Label>
                  <Input
                    id="styleHints"
                    placeholder="minimal, flat, neon, realistic..."
                    value={formData.styleHints}
                    onChange={(e) => setFormData({ ...formData, styleHints: e.target.value })}
                    data-testid="input-style-hints"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isGenerating}
                  data-testid="button-generate-image"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? "Oluşturuluyor..." : "Görsel Oluştur"}
                </Button>
              </form>

              {/* Example Prompts */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Örnek Prompt'lar</h3>
                <div className="space-y-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData({ ...formData, prompt })}
                      className="w-full text-left text-xs p-2 bg-slate-50 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                      data-testid={`button-example-prompt-${index}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Images */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Oluşturulan Görseller
              </h2>

              {generatedImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    Henüz görsel oluşturulmadı
                  </p>
                  <p className="text-sm text-slate-400">
                    Görsel oluşturmak için formu kullanın
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="space-y-3">
                      <div className="relative group">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-64 object-cover rounded-lg"
                          data-testid={`generated-image-${index}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => downloadImage(image.url, image.prompt)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-download-${index}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            İndir
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {getAspectRatioLabel(image.aspectRatio)}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {image.timestamp.toLocaleString("tr-TR")}
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between space-x-2">
                          <p className="text-sm text-slate-600 flex-1 line-clamp-2">
                            {image.prompt}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPrompt(image.prompt)}
                            data-testid={`button-copy-prompt-${index}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {image.styleHints && (
                          <p className="text-xs text-slate-500">
                            Stil: {image.styleHints}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Daha İyi Görseller İçin İpuçları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Detaylı Tanımlayın</h4>
              <p className="text-sm text-slate-600">
                Renk, ışık, atmosfer gibi detayları belirtin
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Stil Belirtin</h4>
              <p className="text-sm text-slate-600">
                Minimal, realistic, artistic gibi stil tercihlerinizi ekleyin
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-700">Platform Düşünün</h4>
              <p className="text-sm text-slate-600">
                Paylaşacağınız platform için uygun en-boy oranını seçin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
