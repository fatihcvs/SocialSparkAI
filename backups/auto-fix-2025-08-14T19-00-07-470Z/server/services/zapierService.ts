export interface ZapierPayload {
  text: string;
  mediaUrl?: string;
  scheduledAt?: string;
  postId?: string;
  userId?: string;
  platform?: string;
}

export async function sendToZapier(payload: ZapierPayload): Promise<void> {
  const url = process.env.ZAPIER_HOOK_URL;
  if (!url) {
    throw new Error("ZAPIER_HOOK_URL not configured");
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Zapier webhook error:", error);
    throw new Error("Zapier webhook'una gönderilemedi");
  }
}
