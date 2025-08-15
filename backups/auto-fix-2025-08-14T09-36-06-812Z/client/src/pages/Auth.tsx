import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setAuthToken } from "@/lib/authUtils";
import { Zap } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    name: "" 
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Başarılı",
        description: "Hesap oluşturuldu!",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  const handleDemoLogin = () => {
    loginMutation.mutate({
      email: "demo@demo.com",
      password: "demo1234"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">AI Sosyal Medya</span>
          </div>
          <CardTitle data-testid="text-auth-title">Hesabınıza Giriş Yapın</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Giriş</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Kayıt</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Şifre</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={loginMutation.isPending}
                  data-testid="button-demo-login"
                >
                  Demo Hesabı ile Dene
                </Button>
                <p className="text-xs text-slate-600 mt-2 text-center">
                  Email: demo@demo.com | Şifre: demo1234
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Ad Soyad</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    data-testid="input-register-name"
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="input-register-email"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Şifre</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    minLength={6}
                    data-testid="input-register-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid="button-register-submit"
                >
                  {registerMutation.isPending ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
