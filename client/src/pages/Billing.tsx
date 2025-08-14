import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Check, 
  CreditCard, 
  Calendar,
  Zap,
  Brain,
  Share2,
  BarChart3,
  Shield,
  Clock
} from "lucide-react";

interface BillingStatus {
  plan: string;
  subscription?: {
    status: string;
    currentPeriodEnd: string;
  };
}

export default function Billing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const { data: billingStatus, isLoading } = useQuery<BillingStatus>({
    queryKey: ["/api/billing/status"],
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/checkout-session");
      return response.json();
    },
    onSuccess: (data: { sessionId: string; url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      setIsCreatingSession(false);
    },
  });

  const handleUpgrade = () => {
    setIsCreatingSession(true);
    createCheckoutMutation.mutate();
  };

  const freePlanFeatures = [
    "Günlük 5 AI çağrısı",
    "Temel içerik takvimi",
    "Manuel post oluşturma",
    "Basit analitik",
    "Email destek",
  ];

  const proPlanFeatures = [
    "Günlük 50 AI çağrısı",
    "Zapier ile otomatik paylaşım",
    "Gelişmiş AI özellikler",
    "Detaylı analitik ve raporlar",
    "Öncelikli destek",
    "CSV export",
    "Zamanlama özellikleri",
    "Sınırsız gönderi",
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-slate-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-billing">
          Faturalandırma
        </h1>
        <p className="text-slate-600">
          Plan yönetimi ve fatura bilgileriniz
        </p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Mevcut Planınız</h2>
            <Badge 
              className={user?.plan === "pro" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}
              data-testid="badge-current-plan"
            >
              {user?.plan === "pro" ? (
                <>
                  <Crown className="w-4 h-4 mr-1" />
                  Pro Plan
                </>
              ) : (
                "Ücretsiz Plan"
              )}
            </Badge>
          </div>

          {user?.plan === "pro" ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Crown className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Pro Plan Aktif</h4>
                    <p className="text-sm text-green-700">
                      Tüm premium özelliklere erişiminiz var
                    </p>
                  </div>
                </div>
              </div>

              {billingStatus?.subscription && (
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Yenileme Tarihi: {new Date(billingStatus.subscription.currentPeriodEnd).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {billingStatus.subscription.status === "active" ? "Aktif" : billingStatus.subscription.status}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Şu anda ücretsiz planı kullanıyorsunuz. Pro plana yükselterek daha fazla özellik açabilirsiniz.
              </p>
              <Button 
                onClick={handleUpgrade}
                disabled={isCreatingSession}
                data-testid="button-upgrade-to-pro"
              >
                <Crown className="w-4 h-4 mr-2" />
                {isCreatingSession ? "Yönlendiriliyor..." : "Pro'ya Yükselt"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={user?.plan === "free" ? "border-2 border-blue-500" : ""}>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ücretsiz Plan</h3>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                ₺0
                <span className="text-lg text-slate-600 font-normal">/ay</span>
              </div>
              <p className="text-slate-600">Başlangıç için ideal</p>
            </div>

            <div className="space-y-3 mb-6">
              {freePlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            {user?.plan === "free" ? (
              <Badge className="w-full justify-center py-2">
                Mevcut Plan
              </Badge>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Mevcut Plan Değil
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={user?.plan === "pro" ? "border-2 border-green-500" : "border-2 border-blue-500 relative"}>
          {user?.plan !== "pro" && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1">
                Önerilen
              </Badge>
            </div>
          )}
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Pro Plan
              </h3>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                ₺99
                <span className="text-lg text-slate-600 font-normal">/ay</span>
              </div>
              <p className="text-slate-600">Profesyonel kullanım için</p>
            </div>

            <div className="space-y-3 mb-6">
              {proPlanFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            {user?.plan === "pro" ? (
              <Badge className="w-full justify-center py-2 bg-green-100 text-green-700">
                <Crown className="w-4 h-4 mr-1" />
                Mevcut Plan
              </Badge>
            ) : (
              <Button 
                className="w-full"
                onClick={handleUpgrade}
                disabled={isCreatingSession}
                data-testid="button-upgrade-pro-card"
              >
                <Crown className="w-4 h-4 mr-2" />
                {isCreatingSession ? "Yönlendiriliyor..." : "Pro'ya Yükselt"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Özellik Karşılaştırması
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4">Özellik</th>
                  <th className="text-center py-3 px-4">Ücretsiz</th>
                  <th className="text-center py-3 px-4">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-slate-500" />
                    Günlük AI Çağrısı
                  </td>
                  <td className="py-3 px-4 text-center">5</td>
                  <td className="py-3 px-4 text-center">50</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center">
                    <Share2 className="w-4 h-4 mr-2 text-slate-500" />
                    Zapier Entegrasyonu
                  </td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-slate-500" />
                    Gelişmiş Analitik
                  </td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-500" />
                    Otomatik Zamanlama
                  </td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-slate-500" />
                    Öncelikli Destek
                  </td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Ödeme Bilgileri
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-slate-500" />
              <span className="text-slate-600">
                Tüm ödemeler Stripe ile güvenli bir şekilde işlenir
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-slate-500" />
              <span className="text-slate-600">
                İstediğiniz zaman planınızı iptal edebilirsiniz
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="text-slate-600">
                Aylık faturalandırma, yenileme otomatiktir
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
