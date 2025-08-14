# SocialSparkAI - Test Senaryoları

## Zapier Webhook Entegrasyonu Test Senaryoları

### 1. Webhook Yapılandırma Testi
```bash
# Webhook durumunu kontrol et
curl -X GET http://localhost:5000/api/integrations/zapier/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Beklenen yanıt (ZAPIER_HOOK_URL yoksa):
{
  "error": {
    "code": "ZAPIER_NOT_CONFIGURED",
    "message": "Zapier webhook URL'si yapılandırılmamış"
  }
}
```

### 2. Test Post Gönderimi
```bash
# Zapier webhook'una test post gönder
curl -X POST http://localhost:5000/api/integrations/zapier/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Test post for Zapier integration",
    "imageUrl": "https://example.com/image.jpg",
    "platform": "instagram",
    "scheduledAt": "2025-01-15T10:00:00Z"
  }'

# Beklenen yanıt (ZAPIER_HOOK_URL yoksa):
{
  "error": {
    "code": "ZAPIER_NOT_CONFIGURED",
    "message": "Zapier webhook URL'si yapılandırılmamış. ZAPIER_HOOK_URL environment variable'ını ayarlayın."
  }
}
```

### 3. Doğrulama Hataları
```bash
# Eksik caption ile test
curl -X POST http://localhost:5000/api/integrations/zapier/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram"
  }'

# Beklenen yanıt:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Caption gerekli"
  }
}
```

### 4. Platform Desteği
Desteklenen platformlar:
- `instagram` - Instagram
- `linkedin` - LinkedIn  
- `x` - X (Twitter)
- `tiktok` - TikTok

### 5. Webhook Veri Formatı
Zapier/Make webhook'una gönderilen veri formatı:
```json
{
  "caption": "Post içeriği",
  "imageUrl": "https://example.com/image.jpg",
  "platform": "instagram",
  "scheduledAt": "2025-01-15T10:00:00Z",
  "userId": "user123",
  "userEmail": "user@example.com",
  "timestamp": "2025-01-15T09:00:00Z"
}
```

## Authentication Test Senaryoları

### 1. Kullanıcı Kayıt
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### 2. Kullanıcı Giriş
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### 3. Token Doğrulama
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## AI İçerik Üretimi Test Senaryoları

### 1. İçerik Fikirlerini Üret
```bash
curl -X POST http://localhost:5000/api/ai/generate-ideas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "sustainable fashion",
    "targetAudience": "millennials",
    "tone": "educational",
    "platform": "instagram"
  }'
```

### 2. Görsel Oluştur
```bash
curl -X POST http://localhost:5000/api/ai/generate-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A modern social media post about sustainable fashion"
  }'
```

## Rate Limiting Test Senaryoları

### 1. API Rate Limit
```bash
# 100+ istek gönder (15 dakikada)
for i in {1..105}; do
  curl -X GET http://localhost:5000/api/health
done
```

### 2. User-specific Rate Limit
```bash
# Pro olmayan kullanıcı için 10+ AI istek
for i in {1..12}; do
  curl -X POST http://localhost:5000/api/ai/generate-ideas \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "topic": "test",
      "targetAudience": "test",
      "tone": "casual",
      "platform": "instagram"
    }'
done
```

## Database Test Senaryoları

### 1. Post Oluşturma
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Test post caption",
    "hashtags": "#test #social",
    "platform": "instagram",
    "scheduledAt": "2025-01-15T10:00:00Z"
  }'
```

### 2. Post Listesi
```bash
curl -X GET http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Dashboard İstatistikleri
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Stripe Billing Test Senaryoları

### 1. Checkout Session Oluştur
```bash
curl -X POST http://localhost:5000/api/billing/checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Customer Portal
```bash
curl -X POST http://localhost:5000/api/billing/customer-portal \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Environment Variables

Test için gerekli environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/socialsparka

# JWT
JWT_SECRET=your-jwt-secret-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTH=price_...

# Zapier Integration
ZAPIER_HOOK_URL=https://hooks.zapier.com/hooks/catch/...

# Client
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Frontend Test Senaryoları

### 1. Ana Sayfa Erişimi
- http://localhost:5000 - Landing sayfası
- http://localhost:5000/auth - Giriş/Kayıt

### 2. Dashboard Erişimi (Giriş gerektir)
- http://localhost:5000/ - Dashboard
- http://localhost:5000/calendar - İçerik Takvimi
- http://localhost:5000/posts - Gönderiler
- http://localhost:5000/ai-content - AI İçerik Üretimi
- http://localhost:5000/image-generation - Görsel Oluşturma
- http://localhost:5000/social-publishing - Zapier Entegrasyonu
- http://localhost:5000/billing - Ödeme Sayfası
- http://localhost:5000/settings - Ayarlar

### 3. Pro Özellikleri Test
1. Free kullanıcı olarak giriş yap
2. `/social-publishing` sayfasına git
3. Pro plan uyarısı görmelisin
4. Test işlevleri devre dışı olmalı

## Deployment Test Senaryoları

### 1. Production Build
```bash
npm run build
npm run preview
```

### 2. Health Check
```bash
curl http://localhost:5000/api/health
```

### 3. Database Migration
```bash
npm run db:push
```