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
    const systemPrompt = `Sen profesyonel bir sosyal medya içerik stratejistisin. Verilen konu için yaratıcı ve etkileşimli içerik fikirleri üret.

MUTLAKA bu JSON formatını kullan:
{
  "ideas": [
    {
      "title": "İçerik başlığı",
      "angle": "İçeriğin yaklaşımı",
      "keyPoints": ["Ana nokta 1", "Ana nokta 2", "Ana nokta 3"],
      "cta": "Çağrı metni"
    }
  ],
  "calendarHints": ["Pazartesi Sabah", "Çarşamba Öğlen", "Cuma Akşam"]
}

Platform odaklı yaklaşımlar:
- Instagram: Görsel odaklı, hikaye anlatımı, engagement
- LinkedIn: Profesyonel değer, bilgi paylaşımı, network
- X: Kısa ve etkili, gündem, viral potansiyel  
- TikTok: Trend odaklı, eğlenceli, genç hedef kitle

Her fikir SEÇİLEN PLATFORM için optimize edilmeli.`;

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
    const systemPrompt = `Sen profesyonel bir sosyal medya içerik yazarısın. Verilen içerik için platform özelliklerine uygun caption varyantları üret.

MUTLAKA bu JSON formatını kullan:
{
  "variants": [
    {
      "variant": "Varyant 1",
      "caption": "Caption metni burada...",
      "hashtags": ["#hashtag1", "#hashtag2"]
    }
  ]
}

Platform kısıtları:
- Instagram: 2200 karakter max, 5-10 kaliteli hashtag
- LinkedIn: 3000 karakter max, 1-3 profesyonel hashtag  
- X: 280 karakter max, 1-2 hashtag
- TikTok: 150 karakter max, 3-5 trend hashtag

Her varyant farklı yaklaşım kullanmalı (soru, hikaye, ipucu, vb).`;

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
