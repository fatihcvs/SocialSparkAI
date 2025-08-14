import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info
} from "lucide-react";

interface BufferStatus {
  connected: boolean;
  profileCount: number;
  profiles?: Array<{
    id: string;
    service: string;
    username: string;
  }>;
}

export default function BufferIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get Buffer connection status
  const { data: bufferStatus, isLoading } = useQuery<BufferStatus>({
    queryKey: ["/api/integrations/buffer/status"],
    enabled: user?.plan === "pro",
    retry: false,
  });

  const connectBufferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/integrations/buffer/connect");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Bağlantı Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectBufferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/integrations/buffer/disconnect");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Buffer Bağlantısı Kesildi",
        description: "Buffer hesabınız başarıyla bağlantısı kesildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/buffer/status"] });
    },
    onError: (error) => {
      toast({
        title: "Bağlantı Kesme Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (user?.plan !== "pro") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Buffer Entegrasyonu</h1>
          <p className="text-slate-600">Sosyal medya hesaplarınızı otomatik yayın için Buffer'a bağlayın.</p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Buffer entegrasyonu sadece Pro plan kullanıcıları için mevcuttur.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Buffer Entegrasyonu</h1>
        <p className="text-slate-600">Sosyal medya hesaplarınızı otomatik yayın için Buffer'a bağlayın.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Buffer Bağlantı Durumu
            {bufferStatus?.connected ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Bağlı
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                Bağlı Değil
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : bufferStatus?.connected ? (
            <div className="space-y-4">
              <p className="text-slate-600">
                Buffer hesabınız başarıyla bağlandı. {bufferStatus.profileCount} sosyal medya profili tespit edildi.
              </p>
              
              {bufferStatus.profiles && bufferStatus.profiles.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Bağlı Profiller:</h4>
                  <div className="grid gap-2">
                    {bufferStatus.profiles.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <Badge variant="outline">{profile.service}</Badge>
                        <span className="text-sm text-slate-700">@{profile.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                variant="destructive"
                onClick={() => disconnectBufferMutation.mutate()}
                disabled={disconnectBufferMutation.isPending}
              >
                Buffer Bağlantısını Kes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Buffer hesabınızı bağlayarak gönderilerinizi otomatik olarak sosyal medya platformlarında yayınlayabilirsiniz.
              </p>
              
              <Button
                onClick={() => connectBufferMutation.mutate()}
                disabled={connectBufferMutation.isPending}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Buffer'a Bağlan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Not:</strong> Buffer entegrasyonu, ZAPIER_HOOK_URL tanımlı olmadığında fallback olarak kullanılır. 
          Zapier entegrasyonu daha esnek çözümler sunar.
        </AlertDescription>
      </Alert>
    </div>
  );
}