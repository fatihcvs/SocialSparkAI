import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-fake-key-for-development"
});

export interface ContentIdea {
  title: string;
  angle: string;
  keyPoints: string[];
  cta: string;
  optimalTiming: string;
  visualSuggestion: string;
}

export interface IdeasResponse {
  calendarHints: string[];
  ideas: ContentIdea[];
  trendingHashtags: string[];
  seasonalSuggestions: string[];
}

export interface CaptionVariant {
  variant: string;
  caption: string;
  hashtags: string[];
  engagement: "high" | "medium" | "low";
  hooks: string[];
}

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:5";
  style: "professional" | "casual" | "minimalist" | "vibrant" | "artistic" | "corporate";
  platform: "instagram" | "linkedin" | "tiktok" | "x" | "facebook";
  brandColors?: string[];
}

// Platform-specific optimization strategies
const PLATFORM_STRATEGIES = {
  instagram: {
    maxCaptionLength: 2200,
    hashtagRange: [5, 10],
    contentStyle: "visual-first, storytelling, authentic",
    timingHints: ["9-10 AM", "2-3 PM", "7-9 PM"],
    engagement: "likes, saves, shares",
    formats: ["photo", "carousel", "reel", "story"]
  },
  linkedin: {
    maxCaptionLength: 3000,
    hashtagRange: [1, 3],
    contentStyle: "professional, value-driven, thought leadership",
    timingHints: ["8-9 AM", "12-1 PM", "5-6 PM"],
    engagement: "comments, connections, shares",
    formats: ["article", "post", "video", "document"]
  },
  x: {
    maxCaptionLength: 280,
    hashtagRange: [1, 2],
    contentStyle: "concise, trending, conversation starter",
    timingHints: ["9 AM", "1 PM", "3 PM", "9 PM"],
    engagement: "retweets, replies, likes",
    formats: ["tweet", "thread", "space", "media"]
  },
  tiktok: {
    maxCaptionLength: 150,
    hashtagRange: [3, 5],
    contentStyle: "trending, entertaining, viral potential",
    timingHints: ["6-10 AM", "7-9 PM", "11 PM-12 AM"],
    engagement: "views, shares, comments",
    formats: ["short video", "live", "story"]
  },
  facebook: {
    maxCaptionLength: 2000,
    hashtagRange: [2, 5],
    contentStyle: "community-focused, detailed, engaging",
    timingHints: ["1-3 PM", "7-9 PM"],
    engagement: "reactions, comments, shares",
    formats: ["post", "story", "video", "event"]
  }
};

// Industry-specific content templates
const CONTENT_TEMPLATES = {
  tech: {
    angles: ["Innovation showcase", "Problem-solution", "Tutorial/How-to", "Trend analysis", "Behind the scenes"],
    tones: ["Expert", "Accessible", "Visionary", "Practical"],
    keywords: ["AI", "automation", "efficiency", "innovation", "digital transformation"]
  },
  business: {
    angles: ["Success story", "Tip/Strategy", "Market insight", "Leadership", "Growth"],
    tones: ["Professional", "Inspirational", "Data-driven", "Conversational"],
    keywords: ["growth", "strategy", "success", "leadership", "productivity"]
  },
  lifestyle: {
    angles: ["Daily routine", "Transformation", "Tips & tricks", "Inspiration", "Personal story"],
    tones: ["Relatable", "Motivational", "Authentic", "Friendly"],
    keywords: ["wellness", "lifestyle", "inspiration", "authentic", "balance"]
  },
  food: {
    angles: ["Recipe", "Food story", "Nutrition tip", "Restaurant review", "Cooking hack"],
    tones: ["Appetizing", "Educational", "Fun", "Authentic"],
    keywords: ["delicious", "healthy", "homemade", "fresh", "recipe"]
  }
};

export class OpenAIService {
  private getIndustryTemplate(topic: string) {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes("tech") || lowerTopic.includes("software") || lowerTopic.includes("ai")) {
      return CONTENT_TEMPLATES.tech;
    }
    if (lowerTopic.includes("business") || lowerTopic.includes("marketing") || lowerTopic.includes("startup")) {
      return CONTENT_TEMPLATES.business;
    }
    if (lowerTopic.includes("food") || lowerTopic.includes("recipe") || lowerTopic.includes("cooking")) {
      return CONTENT_TEMPLATES.food;
    }
    return CONTENT_TEMPLATES.lifestyle;
  }

  async generateIdeas(
    topic: string,
    platform: string,
    targetAudience: string,
    tone: string,
    quantity: number = 5
  ): Promise<IdeasResponse> {
    const platformStrategy = PLATFORM_STRATEGIES[platform as keyof typeof PLATFORM_STRATEGIES];
    const industryTemplate = this.getIndustryTemplate(topic);
    
    const systemPrompt = `Sen bir AI destekli sosyal medya stratejist ve yaratıcı direktörüsün. Platform özelliklerine, marka tonuna ve hedef kitleye göre optimize edilmiş içerik üretiyorsun.

PLATFORM ÖZEL REHBERİ:
${JSON.stringify(platformStrategy, null, 2)}

SEKTÖR ŞABLONU:
${JSON.stringify(industryTemplate, null, 2)}

ÇIKTI FORMATI: Kesinlikle JSON formatında döndür. Türkçe yaz.

Beklenen JSON yapısı:
{
  "calendarHints": ["Optimal zamanlama önerileri"],
  "ideas": [
    {
      "title": "Dikkat çekici başlık",
      "angle": "İçeriğin açısı/yaklaşımı",
      "keyPoints": ["Ana noktalar listesi"],
      "cta": "Eylem çağrısı",
      "optimalTiming": "En iyi yayın zamanı",
      "visualSuggestion": "Görsel önerisi"
    }
  ],
  "trendingHashtags": ["Trend hashtagler"],
  "seasonalSuggestions": ["Mevsimsel öneriler"]
}`;

    const userPrompt = JSON.stringify({
      topic,
      platform,
      targetAudience,
      tone,
      quantity,
      currentMonth: new Date().toLocaleString('tr-TR', { month: 'long' }),
      platformLimitations: platformStrategy
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
        max_tokens: 3000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        calendarHints: result.calendarHints || platformStrategy.timingHints,
        ideas: result.ideas || [],
        trendingHashtags: result.trendingHashtags || [],
        seasonalSuggestions: result.seasonalSuggestions || []
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
    const platformStrategy = PLATFORM_STRATEGIES[platform as keyof typeof PLATFORM_STRATEGIES];
    
    const systemPrompt = `Sen bir yaratıcı metin yazarı ve engagement uzmanısın. Platform kurallarına uygun, yüksek etkileşim potansiyeli olan metinler üretiyorsun.

PLATFORM LİMİTLERİ:
- Maksimum karakter: ${platformStrategy.maxCaptionLength}
- Hashtag sayısı: ${platformStrategy.hashtagRange[0]}-${platformStrategy.hashtagRange[1]}
- İçerik stili: ${platformStrategy.contentStyle}
- Engagement odağı: ${platformStrategy.engagement}

ÇIKTI FORMATI: JSON formatında döndür. Türkçe yaz.

Beklenen JSON yapısı:
{
  "variants": [
    {
      "variant": "Varyant adı (ör: 'Hikaye odaklı', 'CTA güçlü')",
      "caption": "Tam metin",
      "hashtags": ["hashtag1", "hashtag2"],
      "engagement": "high|medium|low",
      "hooks": ["Dikkat çeken açılış cümleleri"]
    }
  ]
}

5 farklı varyant üret: Hikaye odaklı, Soru sorma, CTA güçlü, Eğitici, Eğlenceli`;

    const userPrompt = JSON.stringify({
      content: ideaOrRawIdea,
      platform,
      tone,
      keywords: keywords || [],
      platformLimitations: platformStrategy
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
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.variants || [];
    } catch (error) {
      console.error("OpenAI caption generation error:", error);
      throw new Error("Caption varyantları oluşturulamadı");
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<{ url: string; revisedPrompt?: string }> {
    try {
      // Style-specific prompt enhancements
      const stylePrompts = {
        professional: "clean, corporate, high-quality, professional photography style",
        casual: "natural, candid, lifestyle photography, authentic feel",
        minimalist: "clean, simple, lots of white space, minimal elements",
        vibrant: "bold colors, high contrast, energetic, eye-catching",
        artistic: "creative, artistic interpretation, unique perspective",
        corporate: "business setting, professional environment, clean aesthetics"
      };

      // Platform-specific visual guidelines
      const platformGuidelines = {
        instagram: "Instagram-optimized, highly visual, aesthetic, mobile-first",
        linkedin: "Professional, business-appropriate, high-quality",
        tiktok: "Dynamic, youth-oriented, trend-conscious, energetic",
        x: "Clean, readable, impactful even at small sizes",
        facebook: "Community-friendly, accessible, engaging"
      };

      let enhancedPrompt = options.prompt;
      
      // Add style enhancements
      enhancedPrompt += `, ${stylePrompts[options.style]}`;
      
      // Add platform guidelines
      enhancedPrompt += `, ${platformGuidelines[options.platform]}`;
      
      // Add brand colors if provided
      if (options.brandColors?.length) {
        enhancedPrompt += `, color scheme: ${options.brandColors.join(", ")}`;
      }

      // Map aspect ratio to DALL-E sizes
      let size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024";
      if (options.aspectRatio === "16:9") {
        size = "1792x1024";
      } else if (options.aspectRatio === "9:16" || options.aspectRatio === "4:5") {
        size = "1024x1792";
      }

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality: "standard",
        style: "natural"
      });

      const imageUrl = response.data?.[0]?.url;
      const revisedPrompt = response.data?.[0]?.revised_prompt;
      
      if (!imageUrl) {
        throw new Error("Görsel URL'si alınamadı");
      }
      
      return { 
        url: imageUrl,
        revisedPrompt: revisedPrompt 
      };
    } catch (error) {
      console.error("OpenAI image generation error:", error);
      throw new Error("Görsel oluşturulamadı");
    }
  }

  // New method for hashtag analysis and suggestions
  async generateHashtags(
    content: string,
    platform: string,
    niche?: string
  ): Promise<{ trending: string[]; niche: string[]; branded: string[] }> {
    const platformStrategy = PLATFORM_STRATEGIES[platform as keyof typeof PLATFORM_STRATEGIES];
    
    const systemPrompt = `Sen bir hashtag stratejisti ve trend analistisisin. Belirli platformlar için optimize edilmiş hashtag setleri üretiyorsun.

PLATFORM: ${platform}
Hashtag sayısı: ${platformStrategy.hashtagRange[0]}-${platformStrategy.hashtagRange[1]}

ÇIKTI FORMATI: JSON formatında döndür.

{
  "trending": ["Popüler/trending hashtagler"],
  "niche": ["Niche/sektör specific hashtagler"],
  "branded": ["Marka/brand hashtagleri"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({ content, platform, niche }) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        trending: result.trending || [],
        niche: result.niche || [],
        branded: result.branded || []
      };
    } catch (error) {
      console.error("OpenAI hashtag generation error:", error);
      return { trending: [], niche: [], branded: [] };
    }
  }

  // Content performance prediction
  async predictEngagement(
    caption: string,
    platform: string,
    postTime: string,
    hasImage: boolean = true
  ): Promise<{ score: number; suggestions: string[]; optimizations: string[] }> {
    const systemPrompt = `Sen bir sosyal medya analisti ve engagement tahmin uzmanısın. İçeriklerin performansını tahmin edip iyileştirme önerileri sunuyorsun.

ÇIKTI FORMATI: JSON formatında döndür.

{
  "score": 85, // 0-100 arası engagement puanı
  "suggestions": ["İyileştirme önerileri"],
  "optimizations": ["Spesifik optimizasyon tavsiyeleri"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({ caption, platform, postTime, hasImage }) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        score: result.score || 50,
        suggestions: result.suggestions || [],
        optimizations: result.optimizations || []
      };
    } catch (error) {
      console.error("OpenAI engagement prediction error:", error);
      return { score: 50, suggestions: [], optimizations: [] };
    }
  }
}

export const openaiService = new OpenAIService();
