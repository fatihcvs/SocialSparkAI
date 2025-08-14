# SocialSparkAI MVP Test Rehberi

## Hızlı Test Komutları

### 1. API Health Check
```bash
curl -X GET "http://localhost:5000/api/health"
# Beklenen: {"ok":true}
```

### 2. PostgreSQL Veritabanı Kontrolü
```bash
curl -X GET "http://localhost:5000/api/integrations/zapier/test"
# Beklenen: {"configured":false} (ZAPIER_HOOK_URL yoksa)
```

### 3. Kullanıcı Kaydı (Demo)
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test1234",
    "name": "Test User"
  }'
# Beklenen: token dönmeli
```

### 4. AI İçerik Üretimi (Token gerekli)
```bash
curl -X POST "http://localhost:5000/api/ai/generate/ideas" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "teknoloji",
    "platform": "instagram",
    "targetAudience": "genç profesyoneller",
    "tone": "ilham verici"
  }'
# Beklenen: 3+ içerik fikri
```

### 5. Zapier Webhook Test (Pro Plan + Token gerekli)
```bash
curl -X POST "http://localhost:5000/api/integrations/zapier/publish" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Hello from SocialSparkAI 🚀",
    "imageUrl": "https://picsum.photos/800",
    "platform": "instagram",
    "scheduledAt": "2025-08-20T10:00:00Z"
  }'
# Beklenen: 202 {"ok":true}
```

## MVP Checklist

- [x] PostgreSQL veritabanı çalışıyor (7 tablo)
- [x] Health endpoint (`/api/health`)
- [x] Kullanıcı auth sistemi
- [x] AI içerik üretimi (OpenAI)
- [x] Zapier webhook entegrasyonu
- [x] VITE_API_BASE_URL yapılandırması
- [x] .env.example güncel
- [x] README Zapier kurulum rehberi

## Deployment Kontrolleri

1. **Environment Variables**: `.env.example` tüm gerekli anahtarları içeriyor
2. **Database**: PostgreSQL tabloları oluşturulmuş
3. **API Base URL**: Client tarafında environment variable kullanılıyor
4. **Zapier Integration**: Webhook endpoint'i hazır ve test edilebilir
5. **Security**: JWT auth, rate limiting, CORS yapılandırılmış

## Missing/Future Features

- OpenAI API key gerekli (AI özellikler için)
- Stripe entegrasyonu (ödeme için)
- Zapier webhook URL (sosyal medya yayını için)
- Buffer API token (fallback entegrasyon için)

MVP hazır! 🚀