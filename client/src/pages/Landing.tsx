import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Brain, Calendar, Share2, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">AI Sosyal Medya Planlayıcı</span>
          </div>
          <Link href="/auth">
            <Button data-testid="button-login">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          AI ile Sosyal Medya 
          <span className="text-blue-600"> Yönetiminizi</span> Dönüştürün
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          İçerik fikirleri oluşturun, görsel üretin, gönderileri planlayın ve 
          tüm sosyal medya hesaplarınızı tek yerden yönetin.
        </p>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8 py-4" data-testid="button-get-started">
            Ücretsiz Başlayın
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Özellikler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI İçerik Üretimi</h3>
              <p className="text-slate-600">
                OpenAI ile güçlendirilmiş içerik fikirleri ve caption'lar
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">İçerik Takvimi</h3>
              <p className="text-slate-600">
                Gönderilerinizi planlayın ve zamanında yayınlayın
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Share2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zapier Entegrasyonu</h3>
              <p className="text-slate-600">
                Instagram, LinkedIn, Twitter/X'e Zapier ile otomatik paylaşım
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analitik</h3>
              <p className="text-slate-600">
                Performansınızı takip edin ve gelişim gösterin
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Güvenli</h3>
              <p className="text-slate-600">
                Verileriniz güvende, GDPR uyumlu platform
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hızlı Kurulum</h3>
              <p className="text-slate-600">
                5 dakikada hesabınızı kurun ve kullanmaya başlayın
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          Planlar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Ücretsiz</h3>
                <div className="text-4xl font-bold text-slate-900 mb-4">
                  ₺0<span className="text-lg text-slate-600">/ay</span>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Günlük 5 AI çağrısı
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Temel içerik takvimi
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Manuel post oluşturma
                  </li>
                </ul>
                <Link href="/auth">
                  <Button variant="outline" className="w-full" data-testid="button-free-plan">
                    Başlayın
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Önerilen
              </span>
            </div>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold text-slate-900 mb-4">
                  ₺99<span className="text-lg text-slate-600">/ay</span>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Günlük 50 AI çağrısı
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Zapier otomatik paylaşım
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Gelişmiş analitik
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Öncelikli destek
                  </li>
                </ul>
                <Link href="/auth">
                  <Button className="w-full" data-testid="button-pro-plan">
                    Pro'ya Yükselt
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">AI Sosyal Medya Planlayıcı</span>
          </div>
          <p className="text-slate-400">
            © 2024 AI Sosyal Medya Planlayıcı. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
