import OpenAI from "openai";
import { cacheService } from "./cacheService";
import { rateLimitService } from "./rateLimitService";

// The newest OpenAI model is "gpt-4o" (released May 13, 2024).
// Do not change this unless explicitly requested by the user.
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}
const openai = new OpenAI({ 
  apiKey,
  timeout: 30000, // 30 seconds timeout
  maxRetries: 0 // We handle retries in rateLimitService
});

export interface ContentIdea {
  title: string;
  angle: string;
  keyPoints: string[];
  cta: string;
}

export interface IdeasResponse {
  calendarHints: string[];
  ideas: ContentIdea[];
}

export interface CaptionVariant {
  variant: string;
  caption: string;
  hashtags: string[];
}

export class OpenAIService {
  async generateIdeas(
    topic: string,
    platform: string,
    targetAudience: string,
    tone: string,
    quantity: number = 5
  ): Promise<IdeasResponse> {
    // Generate cache key
    const cacheKey = cacheService.generateIdeasKey(topic, platform, targetAudience, tone, quantity);
    
    // Check cache first
    const cachedResult = cacheService.get<IdeasResponse>(cacheKey);
    if (cachedResult) {
      console.log(`Cache HIT for ideas: ${cacheKey}`);
      return cachedResult;
    }
    
    console.log(`Cache MISS for ideas: ${cacheKey}`);
    const systemPrompt = `Sen dünya çapında tanınan bir Türk sosyal medya stratejist ve içerik uzmanısın. Amacın verilen konuya göre viral olma potansiyeli yüksek, etkileşimli içerik fikirleri üretmek.

ZORUNLU JSON FORMATI - Bu formattan kesinlikle sapma:
{
  "ideas": [
    {
      "title": "Çekici ve merak uyandıran başlık",
      "angle": "Benzersiz yaklaşım açısı", 
      "keyPoints": ["Dikkat çekici nokta 1", "Değer katacak nokta 2", "Aksiyon tetikleyici nokta 3"],
      "cta": "Güçlü çağrı metni"
    }
  ],
  "calendarHints": ["En iyi paylaşım zamanları"]
}

PLATFORM SPESİFİK OPTİMİZASYON KURALLARI:

🔹 INSTAGRAM (Instagram):
- Görsel hikaye anlatımı odaklı
- Hashtag stratejisi dahil et
- Stories, Reels, Post formatları için uygun
- Estetik ve lifestyle odaklı yaklaşım

🔹 LINKEDIN (LinkedIn): 
- Profesyonel değer ve expertise gösterimi
- B2B odaklı içerik stratejisi
- Thought leadership yaklaşımı
- İş dünyası trendleri ve insights

🔹 TWITTER/X (x):
- Kısa, vurucu ve viral potansiyeli yüksek
- Güncel konular ve trending topics
- Thread formatı için uygun
- Hızlı etkileşim odaklı

🔹 TIKTOK (tiktok):
- Gen Z odaklı eğlenceli içerik
- Trend challenges ve viral formatlar  
- Kısa format video için optimize
- Müzik ve efekt önerileri dahil

Her fikir mutlaka SEÇİLEN PLATFORM için özelleştirilmeli ve Türk kitleye hitap etmeli.`;

    const userPrompt = `Şu bilgilere göre ${quantity} adet içerik fikri üret:

Konu: ${topic}
Platform: ${platform}
Hedef Kitle: ${targetAudience}  
Ton: ${tone}

Her fikir platform özelliklerine uygun ve hedef kitleye hitap eden olmalı.`;

    try {
      // Execute with rate limiting
      const response = await rateLimitService.execute(
        async () => await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
        }),
        `ideas-${Date.now()}`
      );

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      
      const finalResult: IdeasResponse = {
        calendarHints: result.calendarHints || ["Pazartesi Sabah", "Çarşamba Öğleden Sonra", "Cumartesi Sabah"],
        ideas: result.ideas || [],
      };

      // Cache the result
      cacheService.cacheIdeas(cacheKey, finalResult);
      
      return finalResult;
    } catch (error) {
      console.error("OpenAI ideas generation error:", error);
      throw new Error("İçerik fikirleri oluşturulamadı");
    }
  }

  async generateCaptions(
    ideaOrRawIdea: string,
    platform: string,
    tone: string,
    keywords?: string[]
  ): Promise<CaptionVariant[]> {
    // Generate cache key
    const cacheKey = cacheService.generateCaptionsKey(ideaOrRawIdea, platform, tone, keywords);
    
    // Check cache first
    const cachedResult = cacheService.get<CaptionVariant[]>(cacheKey);
    if (cachedResult) {
      console.log(`Cache HIT for captions: ${cacheKey}`);
      return cachedResult;
    }
    
    console.log(`Cache MISS for captions: ${cacheKey}`);
    const systemPrompt = `Sen Türkiye'nin en başarılı sosyal medya copywriter'ısın. Görevin verilen fikre göre viral olma potansiyeli yüksek, etkileşimli caption varyantları yazmak.

ZORUNLU JSON FORMATI:
{
  "variants": [
    {
      "variant": "Varyant Adı (örn: Soru Temelli)",
      "caption": "Tam caption metni emoji ve formatla",
      "hashtags": ["#relevanthashtag1", "#relevanthashtag2"]
    }
  ]
}

PLATFORM KURALLARI VE LİMİTLER:

📸 INSTAGRAM (instagram):
- LIMIT: 2200 karakter
- HASHTAG: 5-15 arası kaliteli, niche hashtag
- FORMAT: Emoji kullan, paragraf ara boşlukları, hikaye anlatımı
- YAKLAŞIM: Görsel odaklı, lifestyle, estetik

💼 LINKEDIN (linkedin):
- LIMIT: 3000 karakter  
- HASHTAG: 1-5 profesyonel hashtag
- FORMAT: Profesyonel ton, değer odaklı, thought leadership
- YAKLAŞIM: İş dünyası insights, career tips, industry knowledge

🐦 TWITTER/X (x):
- LIMIT: 280 karakter (SIKT!)
- HASHTAG: 1-3 trending hashtag
- FORMAT: Kısa, vurucu, viral potansiyel
- YAKLAŞIM: Güncel, tartışma başlatıcı, thread teaser

🎵 TIKTOK (tiktok):
- LIMIT: 150 karakter
- HASHTAG: 3-8 trend hashtag (#fyp #keşfet dahil)
- FORMAT: Gen Z dili, eğlenceli, challenge odaklı
- YAKLAŞIM: Viral trends, müzik referansları

HER VARYANT FARKLI YAKLAȘIM KULLANMALI:
1. Soru temelli (merak uyandırıcı)
2. Hikaye anlatımı (duygusal bağ)
3. Liste/İpucu formatı (değer odaklı)
4. Challenge/Aksiyon tetikleyici

Türk kültürüne ve diline uygun, güncel slang ve trend referanslar kullan.`;

    const userPrompt = `Şu içerik için ${platform} platformunda ${tone} tonunda 3 farklı caption varyantı üret:

İçerik: ${ideaOrRawIdea}
Anahtar kelimeler: ${keywords?.join(", ") || "yok"}

Her varyant platform limitine uygun olmalı ve farklı yaklaşım kullanmalı.`;

    try {
      // Execute with rate limiting
      const response = await rateLimitService.execute(
        async () => await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
        `captions-${Date.now()}`
      );

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      const finalResult = result.variants || [];

      // Cache the result
      cacheService.cacheCaptions(cacheKey, finalResult);

      return finalResult;
    } catch (error) {
      console.error("OpenAI caption generation error:", error);
      throw new Error("Caption varyantları oluşturulamadı");
    }
  }

  async generateImage(
    prompt: string,
    aspectRatio: string = "1:1",
    styleHints?: string
  ): Promise<{ url: string }> {
    // Generate cache key
    const cacheKey = cacheService.generateImageKey(prompt, aspectRatio, styleHints);
    
    // Check cache first (shorter TTL for images due to URL expiration)
    const cachedResult = cacheService.get<{ url: string }>(cacheKey);
    if (cachedResult) {
      console.log(`Cache HIT for image: ${cacheKey}`);
      return cachedResult;
    }
    
    console.log(`Cache MISS for image: ${cacheKey}`);
    try {
      let enhancedPrompt = prompt;
      if (styleHints) {
        enhancedPrompt += ` Style: ${styleHints}`;
      }

      // Map aspect ratios to DALL-E sizes
      let size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024";
      if (aspectRatio === "16:9") {
        size = "1792x1024";
      } else if (aspectRatio === "9:16") {
        size = "1024x1792";
      }

      // Execute with rate limiting (different queue for images)
      const response = await rateLimitService.execute(
        async () => await openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size,
          quality: "standard",
        }),
        `image-${Date.now()}`
      );

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("Görsel URL'si alınamadı");
      }

      const finalResult = { url: imageUrl };

      // Cache the result (short TTL due to DALL-E URL expiration)
      cacheService.cacheImage(cacheKey, finalResult);

      return finalResult;
    } catch (error) {
      console.error("OpenAI image generation error:", error);
      throw new Error("Görsel oluşturulamadı");
    }
  }
}

export const openaiService = new OpenAIService();
