export interface ZapierPayload {
  text: string;
  mediaUrl?: string;
  scheduledAt?: string;
  postId?: string;
  userId?: string;
  platform?: string;
  userEmail?: string;
  timestamp?: string;
  platformSpecific?: {
    instagram?: {
      aspectRatio?: string;
      storyMode?: boolean;
    };
    linkedin?: {
      isArticle?: boolean;
      mentionTags?: string[];
    };
    tiktok?: {
      soundTrack?: string;
      effects?: string[];
    };
    x?: {
      isThread?: boolean;
      threadParts?: string[];
    };
  };
}

export async function sendToZapier(payload: ZapierPayload): Promise<{ success: boolean; zapierResponse?: any }> {
  const url = process.env.ZAPIER_HOOK_URL;
  if (!url) {
    throw new Error("ZAPIER_HOOK_URL environment variable'ı konfigüre edilmemiş");
  }

  // Enhanced payload with additional metadata
  const enhancedPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
    source: "SocialSparkAI",
    version: "1.0"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SocialSparkAI/1.0"
      },
      body: JSON.stringify(enhancedPayload),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json().catch(() => ({}));
    
    console.log(`[Zapier] Post gönderildi - Platform: ${payload.platform}, PostID: ${payload.postId}`);
    
    return { success: true, zapierResponse: result };
  } catch (error: any) {
    console.error("Zapier webhook error:", error);
    if (error.name === 'AbortError') {
      throw new Error("Zapier webhook timeout - 30 saniye içinde yanıt alınamadı");
    }
    throw new Error(`Zapier webhook hatası: ${error.message}`);
  }
}

export async function testZapierConnection(): Promise<{ connected: boolean; responseTime?: number; error?: string }> {
  const url = process.env.ZAPIER_HOOK_URL;
  if (!url) {
    return { connected: false, error: "ZAPIER_HOOK_URL konfigüre edilmemiş" };
  }

  const startTime = Date.now();
  try {
    const testPayload = {
      text: "SocialSparkAI Test - Bu bir test mesajıdır",
      platform: "test",
      timestamp: new Date().toISOString(),
      isTest: true
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload)
    });

    const responseTime = Date.now() - startTime;
    
    return { 
      connected: response.ok, 
      responseTime,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error: any) {
    return {
      connected: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

export const zapierService = {
  async publishContent({ content, platforms }: { content: string; platforms: string[] }) {
    for (const platform of platforms) {
      await sendToZapier({ text: content, platform });
    }
  },
};
