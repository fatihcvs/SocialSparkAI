import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Copy, X } from "lucide-react";
import type { CaptionVariant } from "@/types";

interface CaptionGeneratorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId?: string;
}

export default function CaptionGenerator({ isOpen, onOpenChange, ideaId }: CaptionGeneratorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    rawIdea: "",
    platform: "",
    tone: "",
    keywords: "",
  });

  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionVariant[]>([]);

  const generateCaptionsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const keywords = data.keywords ? data.keywords.split(",").map(k => k.trim()) : [];
      const payload = ideaId 
        ? { ideaId, platform: data.platform, tone: data.tone, keywords }
        : { rawIdea: data.rawIdea, platform: data.platform, tone: data.tone, keywords };
      
      const response = await apiRequest("POST", "/api/ai/generate/caption", payload);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ideaId && !formData.rawIdea) {
      toast({
        title: "Hata",
        description: "Lütfen içerik konusu girin",
        variant: "destructive",
      });
      return;
    }

    if (!formData.platform || !formData.tone) {
      toast({
        title: "Hata",
        description: "Lütfen platform ve ton seçin",
        variant: "destructive",
      });
      return;
    }

    generateCaptionsMutation.mutate(formData);
  };

  const copyToClipboard = (caption: string, hashtags: string[]) => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Kopyalandı",
      description: "Caption panoya kopyalandı",
    });
  };

  const handleClose = () => {
    setFormData({ rawIdea: "", platform: "", tone: "", keywords: "" });
    setGeneratedCaptions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="title-caption-generator">AI Caption Üretici</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="button-close-caption-generator"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!ideaId && (
              <div>
                <Label htmlFor="rawIdea">İçerik Konusu</Label>
                <Textarea
                  id="rawIdea"
                  placeholder="Kahve deneyimi ve müşteri memnuniyeti hakkında bir post..."
                  value={formData.rawIdea}
                  onChange={(e) => setFormData({ ...formData, rawIdea: e.target.value })}
                  className="h-24"
                  data-testid="textarea-caption-content"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, platform: value })}>
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
                <Select onValueChange={(value) => setFormData({ ...formData, tone: value })}>
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
            </div>

            <div>
              <Label htmlFor="keywords">Anahtar Kelimeler (isteğe bağlı)</Label>
              <Input
                id="keywords"
                placeholder="kalite, deneyim, memnuniyet (virgülle ayırın)"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
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
          
          {/* Generated Captions */}
          {generatedCaptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Oluşturulan Varyantlar</h3>
              {generatedCaptions.map((variant, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700" data-testid={`caption-variant-title-${index}`}>
                      {variant.variant}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(variant.caption, variant.hashtags)}
                      data-testid={`button-copy-caption-${index}`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-slate-900 mb-3 whitespace-pre-wrap" data-testid={`caption-text-${index}`}>
                    {variant.caption}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {variant.hashtags.map((hashtag, hashIndex) => (
                      <span key={hashIndex} className="text-blue-600 text-sm" data-testid={`caption-hashtag-${index}-${hashIndex}`}>
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
