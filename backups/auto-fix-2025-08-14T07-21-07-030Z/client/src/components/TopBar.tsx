import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { removeAuthToken } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { Bell, LogOut } from "lucide-react";

const pageTitle: Record<string, string> = {
  "/": "Dashboard",
  "/calendar": "İçerik Takvimi", 
  "/posts": "Gönderiler",
  "/ai-content": "AI İçerik Üret",
  "/image-generation": "Görsel Oluştur",
  "/zapier-integration": "Zapier Entegrasyonu",
  "/billing": "Faturalandırma",
  "/settings": "Ayarlar",
};

const pageDescription: Record<string, string> = {
  "/": "AI destekli sosyal medya içerik yönetiminiz",
  "/calendar": "İçerik takvimi ve planlama",
  "/posts": "Gönderi yönetimi ve düzenleme",
  "/ai-content": "AI ile içerik fikirleri üretin",
  "/image-generation": "AI ile görsel oluşturun",
  "/zapier-integration": "Zapier webhook bağlantısı",
  "/billing": "Plan ve fatura yönetimi",
  "/settings": "Hesap ve uygulama ayarları",
};

export default function TopBar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    removeAuthToken();
    setLocation("/");
    window.location.reload(); // Force refresh to clear state
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" data-testid="text-page-title">
            {pageTitle[location] || "AI Sosyal Medya"}
          </h1>
          <p className="text-sm text-slate-600" data-testid="text-page-description">
            {pageDescription[location] || "AI destekli sosyal medya yönetimi"}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900" data-testid="text-user-name">
                {user?.name || "Kullanıcı"}
              </div>
              <div className="text-xs text-slate-500" data-testid="text-user-email">
                {user?.email || "user@example.com"}
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
