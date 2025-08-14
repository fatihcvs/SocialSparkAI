import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { removeAuthToken } from "@/lib/authUtils";
import { useLocation } from "wouter";
import {
  User,
  Mail,
  Shield,
  Settings as SettingsIcon,
  AlertTriangle,
  Crown,
  Key,
  Database,
  LogOut
} from "lucide-react";

interface ApiUsageStats {
  ideas: number;
  captions: number;
  images: number;
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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

  const { data: apiUsage } = useQuery<ApiUsageStats>({
    queryKey: ["/api/usage/stats"],
    retry: false,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Lütfen tüm şifre alanlarını doldurun",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Yeni şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleLogout = () => {
    removeAuthToken();
    setLocation("/");
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    // This would typically show a confirmation dialog
    toast({
      title: "Geliştirme Aşamasında",
      description: "Hesap silme özelliği yakında eklenecek",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900" data-testid="heading-settings">
          Ayarlar
        </h1>
        <p className="text-slate-600">
          Hesap bilgilerinizi ve uygulama ayarlarınızı yönetin
        </p>
      </div>

      {/* Account Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Hesap Bilgileri</h2>
            <Badge 
              className={user?.plan === "pro" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}
              data-testid="badge-account-plan"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ad Soyad</p>
                <p className="font-medium text-slate-900" data-testid="text-account-name">
                  {user?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900" data-testid="text-account-email">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">API Kullanımı</p>
                <p className="font-medium text-slate-900">
                  {user?.plan === "pro" ? "50/gün" : "5/gün"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Profil Ayarları
          </h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  data-testid="input-profile-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  data-testid="input-profile-email"
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              disabled={updateProfileMutation.isPending}
              data-testid="button-update-profile"
            >
              {updateProfileMutation.isPending ? "Güncelleniyor..." : "Profili Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Şifre Değiştir
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                data-testid="input-current-password"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  data-testid="input-new-password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            
            <Button 
              type="submit"
              disabled={changePasswordMutation.isPending}
              data-testid="button-change-password"
            >
              {changePasswordMutation.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* API Usage Stats */}
      {apiUsage && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              API Kullanım İstatistikleri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900">İçerik Fikirleri</h4>
                <p className="text-2xl font-bold text-blue-600" data-testid="stat-ideas-usage">
                  {apiUsage.ideas || 0}
                </p>
                <p className="text-sm text-blue-700">Bu ay kullanılan</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900">Caption Üretimi</h4>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-captions-usage">
                  {apiUsage.captions || 0}
                </p>
                <p className="text-sm text-green-700">Bu ay kullanılan</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900">Görsel Üretimi</h4>
                <p className="text-2xl font-bold text-purple-600" data-testid="stat-images-usage">
                  {apiUsage.images || 0}
                </p>
                <p className="text-sm text-purple-700">Bu ay kullanılan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Güvenlik
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="font-medium text-slate-900">İki Faktörlü Kimlik Doğrulama</h4>
                  <p className="text-sm text-slate-600">Hesabınız için ek güvenlik</p>
                </div>
              </div>
              <Badge variant="outline">Yakında</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="font-medium text-slate-900">API Anahtarları</h4>
                  <p className="text-sm text-slate-600">Entegrasyon anahtarlarınızı yönetin</p>
                </div>
              </div>
              <Badge variant="outline">Yakında</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Tehlikeli Bölge
          </h2>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bu işlemler geri alınamaz. Dikkatli olun.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="w-full md:w-auto"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
            
            <Separator />
            
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full md:w-auto"
              data-testid="button-delete-account"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Hesabı Sil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
