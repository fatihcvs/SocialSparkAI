import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Zap, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Send,
  TestTube2,
  Settings,
  Info
} from "lucide-react";

interface ZapierTestResponse {
  configured: boolean;
  webhookUrl?: string;
  testStatus?: number;
  ok?: boolean;
}

export default function SocialPublishing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSendingPost, setIsSendingPost] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "templates">("create");

  // Check for pre-filled content from URL params or localStorage
  const [testPost, setTestPost] = useState(() => {
    try {
      const savedPost = localStorage.getItem('pendingPost');
      if (savedPost) {
        localStorage.removeItem('pendingPost');
        return JSON.parse(savedPost);
      }
    } catch (error) {
      console.error('Error parsing saved post:', error);
    }
    
    return {
      caption: "",
      imageUrl: "",
      platform: "" as "instagram" | "linkedin" | "x" | "tiktok" | "",
      scheduledAt: "",
    };
  });

  // Test webhook configuration
  const { data: webhookStatus, refetch: refetchWebhookStatus } = useQuery<ZapierTestResponse>({
    queryKey: ["/api/integrations/zapier/test"],
    enabled: user?.plan === "pro",
    retry: false,
  });

  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/integrations/zapier/test");
      return response.json();
    },
    onSuccess: (data) => {
      setIsTestingWebhook(false);
      toast({
        title: data.ok ? "Test Başarılı" : "Test Başarısız",
        description: data.ok 
          ? "Zapier webhook'u çalışıyor!" 
          : `Test durumu: ${data.testStatus}`,
        variant: data.ok ? "default" : "destructive",
      });
      refetchWebhookStatus();
    },
    onError: (error) => {
      setIsTestingWebhook(false);
      toast({
        title: "Test Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (data: typeof testPost) => {
      const response = await apiRequest("POST", "/api/integrations/zapier/publish", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSendingPost(false);
      toast({
        title: "Başarılı",
        description: "Post Zapier webhook'una gönderildi!",
      });
      setTestPost({ caption: "", imageUrl: "", platform: "", scheduledAt: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      setIsSendingPost(false);
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestWebhook = () => {
    if (user?.plan !== "pro") {
      toast({
        title: "Pro Özelliği",
        description: "Webhook testi için Pro planı gerekli",
        variant: "destructive",
      });
      return;
    }
    setIsTestingWebhook(true);
    testWebhookMutation.mutate();
  };

  const handleSendTestPost = () => {
    if (user?.plan !== "pro") {
      toast({
        title: "Pro Özelliği",
        description: "Sosyal medya yayını için Pro planı gerekli",
        variant: "destructive",
      });
      return;
    }

    if (!testPost.caption || !testPost.platform) {
      toast({
        title: "Eksik Bilgi",
        description: "Caption ve platform seçimi gerekli",
        variant: "destructive",
      });
      return;
    }

    setIsSendingPost(true);
    publishPostMutation.mutate(testPost);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return "📸";
      case "linkedin": return "💼";
      case "x": return "🐦";
      case "tiktok": return "🎵";
      default: return "📱";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-social-publishing">
          Sosyal Medya Yayını
        </h1>
        <p className="text-slate-600">
          Zapier/Make webhook entegrasyonu ile sosyal medya hesaplarınıza otomatik gönderi yapın
        </p>
      </div>

      {/* Pro Plan Warning */}
      {user?.plan !== "pro" && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Sosyal medya webhook entegrasyonu Pro planı ile kullanılabilir.{" "}
            <a href="/billing" className="text-blue-600 hover:underline">
              Pro plana geçin
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Webhook Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Webhook Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {webhookStatus?.configured ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Webhook Yapılandırıldı</p>
                  <p className="text-sm text-green-700">
                    URL: {webhookStatus.webhookUrl}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook || user?.plan !== "pro"}
              >
                <TestTube2 className="w-4 h-4 mr-2" />
                {isTestingWebhook ? "Test Ediliyor..." : "Test Et"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Webhook Yapılandırılmamış</p>
                  <p className="text-sm text-orange-700">
                    ZAPIER_HOOK_URL environment variable'ı eksik
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                <Settings className="w-4 h-4 mr-2" />
                Yapılandır
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Sosyal Medya Gönderisi Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendTestPost(); }} className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform Seçin</Label>
              <Select onValueChange={(value) => setTestPost({ ...testPost, platform: value as any })}>
                <SelectTrigger data-testid="select-platform">
                  <SelectValue placeholder={testPost.platform ? `${getPlatformIcon(testPost.platform)} ${testPost.platform.charAt(0).toUpperCase() + testPost.platform.slice(1)}` : "Platform seçin"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="x">🐦 Twitter/X</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="caption">İçerik Metni</Label>
              <Textarea
                id="caption"
                placeholder="Sosyal medya gönderinizin metni ve hashtag'leri..."
                value={testPost.caption}
                onChange={(e) => setTestPost({ ...testPost, caption: e.target.value })}
                rows={6}
                data-testid="textarea-caption"
              />
              <div className="text-xs text-slate-500 mt-1">
                {testPost.platform === 'instagram' && '💡 Instagram: 2,200 karakter limite dikkat edin. #hashtag kullanımını önerilir'}
                {testPost.platform === 'linkedin' && '💡 LinkedIn: 3,000 karakter limit. Profesyonel ton kullanın'}
                {testPost.platform === 'x' && '💡 Twitter/X: 280 karakter limit. Kısa ve net mesajlar'}
                {testPost.platform === 'tiktok' && '💡 TikTok: Trend hashtag\u0027leri ve emoji kullanın'}
                {!testPost.platform && '💡 Platform seçtikten sonra özel rehberlik göreceksiniz'}
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Görsel URL'si (isteğe bağlı)</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={testPost.imageUrl}
                onChange={(e) => setTestPost({ ...testPost, imageUrl: e.target.value })}
                data-testid="input-image-url"
              />
              {testPost.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={testPost.imageUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="scheduledAt">Zamanlama (isteğe bağlı)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={testPost.scheduledAt}
                onChange={(e) => setTestPost({ ...testPost, scheduledAt: e.target.value })}
                data-testid="input-scheduled-at"
              />
              <div className="text-xs text-slate-500 mt-1">
                💡 Boş bırakırsanız hemen gönderilir
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={isSendingPost || !testPost.caption || !testPost.platform || user?.plan !== "pro"}
              data-testid="button-send-post"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSendingPost ? "Gönderiliyor..." : "Zapier'e Gönder"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Kurulum Talimatları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h4>Zapier ile Kurulum:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li>Zapier hesabınızda yeni bir Zap oluşturun</li>
              <li>Trigger olarak "Webhooks by Zapier" seçin</li>
              <li>Event Type: "Catch Hook" seçin</li>
              <li>Webhook URL'sini kopyalayın</li>
              <li>Action olarak sosyal medya platformunu seçin (Instagram, LinkedIn, vb.)</li>
              <li>Webhook URL'sini ZAPIER_HOOK_URL environment variable'ına ekleyin</li>
            </ol>

            <h4 className="mt-4">Make (Integromat) ile Kurulum:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li>Make hesabınızda yeni bir senaryo oluşturun</li>
              <li>İlk modül olarak "Webhooks" {">"} "Custom webhook" seçin</li>
              <li>Webhook URL'sini kopyalayın</li>
              <li>Sonraki modüllerde sosyal medya entegrasyonlarını yapın</li>
              <li>Webhook URL'sini ZAPIER_HOOK_URL environment variable'ına ekleyin</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Zapier'ı Aç
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://make.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Make'i Aç
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Webhook Data Format */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Veri Formatı</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "caption": "Post içeriği",
  "imageUrl": "https://example.com/image.jpg",
  "platform": "instagram",
  "scheduledAt": "2025-01-15T10:00:00Z",
  "userId": "user123",
  "userEmail": "user@example.com",
  "timestamp": "2025-01-15T09:00:00Z"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}