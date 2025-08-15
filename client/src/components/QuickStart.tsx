import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, ImageIcon, Send, CheckCircle } from "lucide-react";

export default function QuickStart() {
  const steps = [
    {
      id: 1,
      title: "AI İçerik Fikri Üret",
      description: "Konunuz için yaratıcı içerik fikirlerini keşfedin",
      icon: Brain,
      href: "/ai-content?tab=ideas",
      completed: false
    },
    {
      id: 2,
      title: "Caption Varyantları Oluştur",
      description: "Platform özelinde optimize edilmiş caption'lar yazın",
      icon: PenTool,
      href: "/ai-content?tab=captions",
      completed: false
    },
    {
      id: 3,
      title: "AI Görsel Oluştur",
      description: "DALL-E 3 ile profesyonel görseller üretin",
      icon: ImageIcon,
      href: "/ai-content?tab=images",
      completed: false
    },
    {
      id: 4,
      title: "Sosyal Medyaya Yayınla",
      description: "Zapier entegrasyonu ile otomatik paylaşım",
      icon: Send,
      href: "/social-publishing",
      completed: false
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Hızlı Başlangıç Rehberi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => window.location.href = step.href}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {step.id}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}