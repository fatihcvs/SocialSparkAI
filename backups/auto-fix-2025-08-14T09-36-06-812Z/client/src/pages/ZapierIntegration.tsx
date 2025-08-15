import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ZapierIntegration() {
  const { toast } = useToast();

  const handleTest = async () => {
    try {
      const res = await apiRequest("GET", "/api/integrations/zapier/test");
      const data = await res.json();
      if (data.configured) {
        toast({ title: "Başarılı", description: "Zapier webhook testi başarılı" });
      } else {
        throw new Error("Webhook yapılandırılmamış");
      }
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-zapier">
          Zapier Entegrasyonu
        </h1>
        <p className="text-slate-600">Webhook URL'nizi .env dosyasına ekleyin ve bağlantıyı test edin.</p>
      </div>
      <Button onClick={handleTest} data-testid="button-test-zapier">
        Zapier'e Bağlan
      </Button>
    </div>
  );
}
