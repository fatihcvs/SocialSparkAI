import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Share2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Instagram,
  Linkedin,
  Twitter,
  Crown
} from "lucide-react";

interface BufferProfile {
  id: string;
  service: string;
  service_username: string;
}

interface BufferConnectionStatus {
  profiles?: BufferProfile[];
}

export default function BufferIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: connectionStatus } = useQuery<BufferConnectionStatus>({
    queryKey: ["/api/buffer/connect"],
    enabled: user?.plan === "pro",
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/buffer/connect");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "Buffer hesabınız bağlandı!",
      });
      setIsConnecting(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  const handleConnect = () => {
    if (user?.plan !== "pro") {
      toast({
        title: "Pro Özelliği",
        description: "Buffer entegrasyonu için Pro planı gerekli",
        variant: "destructive",
      });
      return;
    }
    setIsConnecting(true);
    connectMutation.mutate();
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case "instagram": return <Instagram className="w-5 h-5 text-pink-600" />;
      case "linkedin": return <Linkedin className="w-5 h-5 text-blue-600" />;
      case "twitter": return <Twitter className="w-5 h-5 text-blue-500" />;
      default: return <Share2 className="w-5 h-5 text-slate-600" />;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service.toLowerCase()) {
      case "instagram": return "bg-pink-100 text-pink-700";
      case "linkedin": return "bg-blue-100 text-blue-700";
      case "twitter": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-buffer">
          Buffer Entegrasyonu
        </h1>
        <p className="text-slate-600">
          Sosyal medya hesaplarınızı bağlayın ve otomatik paylaşım yapın
        </p>
      </div>

      {/* Pro Plan Warning */}
      {user?.plan !== "pro" && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Buffer entegrasyonu Pro planı abonelerinde kullanılabilir. 
            <Button variant="link" className="px-2 h-auto" data-testid="link-upgrade">
              Pro'ya yükseltin
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Buffer Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Buffer Bağlantısı</h2>
              <p className="text-slate-600">
                Buffer hesabınızı bağlayarak otomatik paylaşım özelliğini aktifleştirin
              </p>
            </div>
            {connectionStatus ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4 mr-1" />
                Bağlı
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertCircle className="w-4 h-4 mr-1" />
                Bağlı Değil
              </Badge>
            )}
          </div>

          {!connectionStatus ? (
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Buffer Hesabınızı Bağlayın
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Buffer hesabınızı bağlayarak gönderilerinizi Instagram, LinkedIn ve Twitter/X'te 
                otomatik olarak zamanlayabilir ve paylaşabilirsiniz.
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting || user?.plan !== "pro"}
                data-testid="button-connect-buffer"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isConnecting ? "Bağlanıyor..." : "Buffer'ı Bağla"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Buffer Bağlantısı Aktif</h4>
                    <p className="text-sm text-green-700">
                      Gönderilerinizi sosyal medya hesaplarınızda zamanlayabilirsiniz
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Profiles */}
              {connectionStatus.profiles && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Bağlı Hesaplar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connectionStatus.profiles.map((profile: BufferProfile) => (
                      <div key={profile.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          {getServiceIcon(profile.service)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge className={getServiceColor(profile.service)}>
                                {profile.service.charAt(0).toUpperCase() + profile.service.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              @{profile.service_username}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Buffer Entegrasyonu Özellikleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-900">Otomatik Zamanlama</h3>
              <p className="text-sm text-slate-600">
                Gönderilerinizi en uygun zamanlarda otomatik olarak paylaşın
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-slate-900">Çoklu Platform</h3>
              <p className="text-sm text-slate-600">
                Instagram, LinkedIn ve Twitter/X'te aynı anda paylaşım yapın
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-slate-900">Durum Takibi</h3>
              <p className="text-sm text-slate-600">
                Gönderilerinizin durumunu gerçek zamanlı olarak takip edin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Buffer Kurulum Rehberi
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Buffer Hesabı Oluşturun</h4>
                <p className="text-sm text-slate-600">
                  <a 
                    href="https://buffer.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Buffer.com
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  adresinden ücretsiz hesap oluşturun
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Sosyal Medya Hesaplarınızı Bağlayın</h4>
                <p className="text-sm text-slate-600">
                  Buffer'da Instagram, LinkedIn ve Twitter hesaplarınızı bağlayın
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">AI Sosyal Medya'ya Bağlayın</h4>
                <p className="text-sm text-slate-600">
                  Yukarıdaki "Buffer'ı Bağla" butonuna tıklayarak entegrasyonu tamamlayın
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Önemli Notlar
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p>
                Instagram doğrudan API paylaşımı yapmaz. Buffer ile Instagram'a 
                bildirim gönderilir ve manuel onay gerekir.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p>
                LinkedIn ve Twitter/X için otomatik paylaşım tamamen desteklenmektedir.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p>
                Buffer'ın kendi kullanım limitları geçerlidir. Detaylar için Buffer 
                planlarını inceleyin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
