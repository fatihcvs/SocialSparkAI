import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" (released May 13, 2024).
// Do not change this unless explicitly requested by the user.
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}
const openai = new OpenAI({ apiKey });

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
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      
      return {
        calendarHints: result.calendarHints || ["Pazartesi Sabah", "Çarşamba Öğleden Sonra", "Cumartesi Sabah"],
        ideas: result.ideas || [],
      };
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
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || "{}";
      const result = JSON.parse(content);
      return result.variants || [];
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

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("Görsel URL'si alınamadı");
      }
      return { url: imageUrl };
    } catch (error) {
      console.error("OpenAI image generation error:", error);
      throw new Error("Görsel oluşturulamadı");
    }
  }
}

export const openaiService = new OpenAIService();
