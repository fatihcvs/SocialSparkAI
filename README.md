# 🤖 SocialSparkAI - Autonomous AI Development Platform

> **Revolutionary AI-powered social media platform with ChatGPT autonomous development system**

[![Autonomous Development](https://img.shields.io/badge/Development-Autonomous-brightgreen)](https://github.com/features/actions)
[![ChatGPT Powered](https://img.shields.io/badge/AI-ChatGPT%20Powered-blue)](https://openai.com/chatgpt)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)

## 🚀 **World's First Fully Autonomous Social Media Platform**

SocialSparkAI is not just another social media tool - it's a **self-evolving platform** powered by ChatGPT that continuously develops itself, adds new features, fixes bugs, and optimizes performance **without human intervention**.

### 🤖 **Autonomous Development Features**
- **🔄 Continuous Development**: GitHub workflow runs every 2 minutes analyzing and improving code
- **🧠 AI-Powered Planning**: ChatGPT generates comprehensive development plans
- **⚡ Autonomous Implementation**: Automatic bug fixes, feature additions, and optimizations  
- **🛡️ Self-Healing**: System automatically detects and resolves issues
- **📊 Real-Time Telemetry**: Performance monitoring and user feedback integration

AI destekli sosyal medya içerik yönetimi ve planlama platformu. İçerik fikirleri üretin, görseller oluşturun, gönderileri planlayın ve tüm sosyal medya hesaplarınızı tek yerden yönetin.

## 🚀 Özellikler

### 🤖 AI İçerik Üretimi
- **OpenAI GPT-4o** ile içerik fikirleri oluşturma
- Platform özelinde caption varyantları (Instagram, LinkedIn, Twitter/X, TikTok)
- **DALL-E 3** ile özel görsel oluşturma
- Ton ve hedef kitle özelleştirmesi

### 📅 İçerik Planlama
- Görsel içerik takvimi (aylık/haftalık görünüm)
- Otomatik gönderi zamanlaması
- Gönderi durumu takibi (taslak, planlandı, yayınlandı)

### 🔗 Sosyal Medya Entegrasyonu
  - **Zapier Webhook** entegrasyonu (Pro)
- Instagram, LinkedIn, Twitter/X, TikTok otomatik paylaşım
- Multi-platform gönderi yönetimi

### 💰 Faturalama Sistemi
- **Iyzico** entegrasyonu
- Free vs Pro plan yönetimi
- Otomatik faturalandırma

### 🔐 Güvenlik
- JWT tabanlı kimlik doğrulama
- Rate limiting (kullanıcı ve IP bazlı)
- Helmet güvenlik middleware'leri

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js** + Express
- **TypeScript**
- **Drizzle ORM** + PostgreSQL
- **JWT** + bcrypt authentication
- **OpenAI API** (GPT-4o + DALL-E 3)
  - **Zapier Webhooks**
- **Iyzico** payments
- **node-cron** scheduler

### Frontend
- **React 18** + TypeScript
- **Vite** build tool
- **TailwindCSS** + **shadcn/ui**
- **React Hook Form** + **Zod** validation
- **TanStack Query** (React Query)
- **Wouter** routing

## 📦 Kurulum

### Ön Gereksinimler
- Node.js 18+
- PostgreSQL
- OpenAI API anahtarı
- Iyzico sandbox hesabı
  - Zapier hesabı (Pro özellikler için)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd ai-social-media-planner
```

### 2. Ortam Değişkenlerini Yapılandırın
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli API anahtarlarını **Replit Secrets bölümünden** doldurun:

```bash
cp .env.example .env
```

**Replit Secrets'tan doldurmanız gereken anahtarlar:**
- `OPENAI_API_KEY` - OpenAI API anahtarınız
- `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY` - Iyzico sandbox API anahtarlarınız
- `IYZICO_BASE_URL` - Iyzico API URL'i (varsayılan: https://sandbox-api.iyzipay.com)
- `ZAPIER_HOOK_URL` - Zapier webhook URL'niz (Pro)
- `JWT_SECRET` - Güçlü bir JWT gizli anahtarı (tanımlanmazsa uygulama başlamaz)

### 3. Projeyi Başlatın
```bash
npm run dev
```

### 4. Zapier Webhook Kurulumu (Pro Özellik)
ZAPIER_HOOK_URL'yi Replit Secrets'a ekleyin:

1. Zapier'da yeni Zap oluşturun
2. Trigger: "Webhooks by Zapier" > "Catch Hook"
3. Webhook URL'ni alın (örn: https://hooks.zapier.com/hooks/catch/12345/abcde)
4. Replit Secrets'ta `ZAPIER_HOOK_URL` olarak ekleyin
5. Test için örnek cURL çalıştırın

### 5. Iyzico Ödeme Testi (Geliştirme)
Iyzico ödemelerini test etmek için sandbox API anahtarlarını kullanın ve faturalandırma sayfasından "Pro'ya Yükselt" butonuna tıklayın. Başarılı yönlendirme sonrasında ödeme formu Iyzico tarafından sağlanacaktır.

## 🧪 Test Rehberi

### Elle Test Edilmesi Gerekenler
Sırayla şu testleri yapın ve tümünün çalıştığından emin olun:

1. **API Health Check**
   ```bash
   curl https://<replit-url>/api/health
   # Beklenen: {"ok":true}
   ```

2. **Kullanıcı Kaydı/Girişi**
   - Kayıt ol sayfasından yeni hesap oluşturun
   - Giriş yapın ve `/api/auth/me` endpoint'inin token ile çalıştığını kontrol edin

3. **AI İçerik Üretimi**
   ```bash
   curl -X POST https://<replit-url>/api/ai/generate/ideas \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"topic":"teknoloji","platform":"instagram","targetAudience":"genç profesyoneller","tone":"ilham verici"}'
   # Beklenen: 3+ içerik fikri JSON formatında
   ```

4. **Caption Üretimi**
   ```bash
   curl -X POST https://<replit-url>/api/ai/generate/caption \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"rawIdea":"Yapay zeka teknolojisi","platform":"linkedin","tone":"profesyonel"}'
   # Beklenen: 3-5 caption varyantı
   ```

5. **Görsel Üretimi**
   ```bash
   curl -X POST https://<replit-url>/api/ai/generate/image \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Modern ofis ortamında çalışan profesyonel","aspectRatio":"1:1"}'
   # Beklenen: imageUrl dönmeli, UI'de görünmeli
   ```

6. **Post Oluşturma ve Zamanlama**
   ```bash
   curl -X POST https://<replit-url>/api/posts \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"caption":"Test caption","hashtags":"#test #ai","platform":"instagram"}'
   # Beklenen: Post oluşturulmalı
   ```

7. **Zapier/Make Webhook Entegrasyonu** (Pro Plan Gerekli)
   ```bash
   curl -X POST https://<replit-url>/api/integrations/zapier/publish \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"caption":"Hello from SocialSparkAI 🚀","imageUrl":"https://picsum.photos/800","platform":"instagram","scheduledAt":"2025-08-20T10:00:00Z"}'
   # Beklenen: 202 {"ok":true} ve Zapier'de webhook tetiklenmeli
   ```

8. **Otomatik Yayınlama**
   - Zamanlanan bir gönderi oluşturun (5 dakika sonrası)
   - Cron job zamanı geldiğinde status="posted" yapmalı

9. **Iyzico Checkout** (Test Kartı)
   ```
   Test Kartı: 5526 0800 0000 0006
   CVV: 000, Son Kullanma: 12/2030
   ```
   - Ödeme tamamlandıktan sonra yönlendirme başarılı olmalı

10. **cURL Örnekleri**
    ```bash
    # Gönderileri listele
    curl -H "Authorization: Bearer <token>" https://<url>/api/posts
    
    # Gönderiyi Zapier'e gönder
    curl -X POST -H "Authorization: Bearer <token>" https://<url>/api/posts/<post-id>/publish
    
    # Dashboard istatistikleri
    curl -H "Authorization: Bearer <token>" https://<url>/api/dashboard/stats
    
    # Fatura durumu
    curl -H "Authorization: Bearer <token>" https://<url>/api/billing/status
    ```

## 🚀 Iyzico Test Kartları
- **Başarılı Ödeme**: 5526 0800 0000 0006
- **Yetersiz Bakiye**: 5526 0000 0000 0007
- **3D Secure**: 4766 0000 0000 0004

## 📝 Daha Fazla Bilgi
- OpenAI API limitlerini kontrol edin
- Iyzico sandbox işlemleri gerçek ödeme almaz
