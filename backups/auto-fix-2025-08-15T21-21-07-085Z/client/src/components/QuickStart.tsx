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
