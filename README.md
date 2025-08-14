# AI Sosyal Medya Planlayıcı

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
- **Buffer API** entegrasyonu
- Instagram, LinkedIn, Twitter/X otomatik paylaşım
- Multi-platform gönderi yönetimi

### 💰 Faturalama Sistemi
- **Stripe** entegrasyonu
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
- **Prisma ORM** + PostgreSQL
- **JWT** + bcrypt authentication
- **OpenAI API** (GPT-4o + DALL-E 3)
- **Buffer API**
- **Stripe** payments
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
- Stripe hesabı (test mode)
- Buffer hesabı (opsiyonel)

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd ai-social-media-planner
