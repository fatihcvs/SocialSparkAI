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
    const systemPrompt = `Sen bir sosyal medya içerik stratejisti ve metin yazarısın. Platform kurallarına, marka tonuna ve hedef kitleye hassassın. Yanıtlarını daima JSON uyumlu döndür. Türkçe yaz.

Platform rehberleri:
- Instagram: kısa, CTA, 5-10 kaliteli hashtag
- LinkedIn: değer odaklı, mini case/snippet, 1-3 hashtag
- X: 1-2 cümle, 1-2 hashtag, gerekiyorsa thread öner
- TikTok: trend odaklı, genç kitle, 3-5 hashtag`;

    const userPrompt = JSON.stringify({
      topic,
      platform,
      targetAudience,
      tone,
      quantity,
    });

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

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
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
    const systemPrompt = `Platform kısıtlarına uy, 3-5 alternatif üret, her birine uygun hashtag setleri ekle. JSON döndür. Türkçe yaz.

Platform limitleri:
- Instagram: 2200 karakter, 5-10 hashtag
- LinkedIn: 3000 karakter, 1-3 hashtag
- X: 280 karakter, 1-2 hashtag
- TikTok: 150 karakter, 3-5 hashtag`;

    const userPrompt = JSON.stringify({
      content: ideaOrRawIdea,
      platform,
      tone,
      keywords: keywords || [],
    });

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

      const result = JSON.parse(response.choices[0].message.content || "{}");
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
