import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { MessageCircle, Image, Calendar, Crown } from "lucide-react";

export default function AITools() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const tools = [
    {
      id: "caption",
      title: "Caption Üret",
      description: "AI ile caption varyantları",
      icon: MessageCircle,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      route: "/ai-content",
      disabled: false,
    },
    {
      id: "image",
      title: "Görsel Oluştur",
      description: "AI ile özel görseller",
      icon: Image,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      route: "/image-generation",
      disabled: false,
    },
    {
      id: "social-publishing",
      title: "Sosyal Medya Yayını",
      description: "Zapier/Make entegrasyonu",
      icon: Calendar,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      route: "/social-publishing",
      disabled: user?.plan !== "pro",
      isPro: true,
    },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (tool.disabled) {
      return;
    }
    setLocation(tool.route);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4" data-testid="heading-ai-tools">
          AI İçerik Araçları
        </h3>

        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="relative">
              <button
                onClick={() => handleToolClick(tool)}
                disabled={tool.disabled}
                className={`w-full flex items-center p-3 text-left border border-slate-200 rounded-lg transition-colors ${
                  tool.disabled ? "bg-slate-50 cursor-not-allowed opacity-60" : "hover:bg-slate-50"
                }`}
                data-testid={`button-ai-tool-${tool.id}`}
              >
                <div className={`w-8 h-8 ${tool.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                  <tool.icon className={`w-4 h-4 ${tool.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{tool.title}</div>
                  <div className="text-xs text-slate-500">{tool.description}</div>
                </div>
              </button>

              {tool.isPro && (
                <div className="absolute -top-1 -right-1">
                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {user?.plan !== "pro" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pro Özellikler</p>
                <p className="text-xs text-blue-700">
                  Zapier entegrasyonu için Pro plana yükseltin
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => setLocation("/billing")}
              data-testid="button-upgrade-from-tools"
            >
              Pro'ya Yükselt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
