import express from "express";
import { z } from "zod";
import { authenticateToken } from "../middlewares/auth";
import type { AuthRequest } from "../middlewares/auth";

const router = express.Router();

// Zapier webhook endpoint
router.post("/zapier/publish", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const zapierHookUrl = process.env.ZAPIER_HOOK_URL;
    
    if (!zapierHookUrl) {
      return res.status(400).json({
        error: { 
          code: "ZAPIER_NOT_CONFIGURED", 
          message: "Zapier webhook URL'si yapılandırılmamış. ZAPIER_HOOK_URL environment variable'ını ayarlayın." 
        }
      });
    }

    const schema = z.object({
      caption: z.string().min(1, "Caption gerekli"),
      imageUrl: z.string().url().optional(),
      platform: z.enum(["instagram", "linkedin", "x", "tiktok"]),
      scheduledAt: z.string().datetime().optional(),
    });

    const data = schema.parse(req.body);

    // Add user info to the payload
    const payload = {
      ...data,
      userId: req.user?.id,
      userEmail: req.user?.email,
      timestamp: new Date().toISOString(),
    };

    // Forward to Zapier webhook
    const response = await fetch(zapierHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook error: ${response.status} ${response.statusText}`);
    }

    res.status(202).json({ 
      ok: true, 
      message: "Post Zapier/Make webhook'una başarıyla gönderildi",
      zapierStatus: response.status 
    });

  } catch (error) {
    console.error("Zapier webhook error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: { 
          code: "VALIDATION_ERROR", 
          message: error.errors[0].message 
        }
      });
    }

    res.status(500).json({
      error: { 
        code: "WEBHOOK_ERROR", 
        message: "Zapier webhook'una gönderilemedi. URL'yi kontrol edin." 
      }
    });
  }
});

// Test endpoint to verify webhook configuration
router.get("/zapier/test", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const zapierHookUrl = process.env.ZAPIER_HOOK_URL;
    
    if (!zapierHookUrl) {
      return res.status(400).json({
        error: { 
          code: "ZAPIER_NOT_CONFIGURED", 
          message: "Zapier webhook URL'si yapılandırılmamış" 
        }
      });
    }

    // Send test payload
    const testPayload = {
      test: true,
      message: "SocialSparkAI webhook test",
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
    };

    const response = await fetch(zapierHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    res.json({
      configured: true,
      webhookUrl: zapierHookUrl.substring(0, 50) + "...", // Partially hide URL
      testStatus: response.status,
      ok: response.ok,
    });

  } catch (error) {
    console.error("Zapier test error:", error);
    res.status(500).json({
      error: { 
        code: "TEST_FAILED", 
        message: "Webhook test başarısız" 
      }
    });
  }
});

export default router;