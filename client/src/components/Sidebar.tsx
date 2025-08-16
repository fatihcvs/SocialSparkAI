import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  LayoutDashboard, 
  Calendar,
  CalendarClock,
  FileText, 
  Brain, 
  Image, 
  Share2,
  CreditCard,
  Settings,
  Shield,
  Activity,
  Sparkles
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "İçerik Takvimi", href: "/calendar", icon: Calendar },
  { name: "Sosyal Takvim", href: "/social-calendar", icon: CalendarClock },
  { name: "Gönderiler", href: "/posts", icon: FileText },
  { name: "AI İçerik Üret", href: "/ai-content", icon: Brain },
  { name: "Gelişmiş AI", href: "/advanced-ai", icon: Sparkles },
  { name: "Görsel Oluştur", href: "/image-generation", icon: Image },
  { name: "Zapier Entegrasyonu", href: "/zapier-integration", icon: Share2 },
  { name: "Admin Paneli", href: "/admin", icon: Shield, admin: true },
];

const secondaryNavigation = [
  { name: "Faturalandırma", href: "/billing", icon: CreditCard },
  { name: "Ayarlar", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth() as { user: AuthUser | null };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-slate-200">
      {/* Logo and Brand */}
      <div className="flex items-center px-6 py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900" data-testid="text-brand">
            AI Sosyal Medya
          </span>
        </div>
      </div>

      {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            if (item.admin && user?.role !== "admin") return null;
            const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg group transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
              data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-200">
          {secondaryNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg group transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Plan Status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Plan</span>
            <span 
              className={cn(
                "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
                user?.plan === "pro" 
                  ? "text-green-700 bg-green-100"
                  : "text-orange-700 bg-orange-100"
              )}
              data-testid="text-user-plan"
            >
              {user?.plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          {user?.plan === "free" && (
            <>
              <p className="text-xs text-slate-600 mb-3" data-testid="text-usage-limit">
                Günlük AI çağrısı limitiniz
              </p>
              <Button
                asChild
                size="sm"
                className="w-full text-xs"
                data-testid="button-upgrade"
              >
                <Link href="/billing">Pro'ya Yükselt</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}