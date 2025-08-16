import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { insertUserSchema, insertPostAssetSchema } from "@shared/schema";
import { storage } from "./storage";
import { authenticateToken, generateToken, hashPassword, verifyPassword, requirePlan, requireAdmin } from "./middlewares/auth";
import { rateLimit as apiRateLimit, ipRateLimit } from "./middlewares/rateLimiter";
import { openaiService } from "./services/openaiService";
import { contentService } from "./services/contentService";
import { iyzicoService } from "./services/iyzicoService";
import { userBehaviorService } from "./services/userBehaviorService";
import { advancedAIService } from "./services/advancedAIService";
import type { AuthRequest } from "./middlewares/auth";
import integrationRoutes from "./routes/integrations";
import { registerPerformanceRoutes } from "./routes/performance.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
  }));

  app.use(cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"] // Replace with actual domain
        : true,
    credentials: true,
  }));

  // Global rate limiting
  app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: { code: "RATE_LIMIT", message: "Çok fazla istek" } },
  }));

  // Trust proxy for rate limiting
  app.set("trust proxy", 1);

  // Basic health check for uptime monitoring
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Auth routes with IP rate limiting
  app.use("/api/auth", ipRateLimit(10, 15)); // 10 requests per 15 minutes per IP

  // Auth - Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = insertUserSchema.pick({
        email: true,
        name: true,
      }).extend({
        password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
      });

      const { email, password, name } = registerSchema.parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: { code: "USER_EXISTS", message: "Bu email zaten kayıtlı" }
        });
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        name,
        role: "user",
        plan: "free",
      });

      // Generate token
      const token = generateToken(user.id, user.email, user.plan, user.role);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Register error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Kayıt sırasında hata oluştu" }
      });
    }
  });

  // Auth - Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        email: z.string().email("Geçersiz email"),
        password: z.string().min(1, "Şifre gerekli"),
      });

      const { email, password } = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: { code: "INVALID_CREDENTIALS", message: "Geçersiz email veya şifre" }
        });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          error: { code: "INVALID_CREDENTIALS", message: "Geçersiz email veya şifre" }
        });
      }

      // Generate token
      const token = generateToken(user.id, user.email, user.plan, user.role);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Giriş sırasında hata oluştu" }
      });
    }
  });

  // Auth - Get current user
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı" }
        });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Kullanıcı bilgisi alınamadı" }
      });
    }
  });

  // AI routes
  app.post("/api/ai/generate/ideas", authenticateToken, apiRateLimit("ai_ideas"), async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        topic: z.string().min(1, "Konu gerekli"),
        targetAudience: z.string().min(1, "Hedef kitle gerekli"),
        platform: z.enum(["instagram", "tiktok", "linkedin", "x"]),
        tone: z.string().min(1, "Ton gerekli"),
        quantity: z.number().min(1).max(10).default(5),
      });

      const { topic, targetAudience, platform, tone, quantity } = schema.parse(req.body);

      const contentIdea = await contentService.generateContentIdeas(
        req.user!.id,
        topic,
        targetAudience,
        platform,
        tone,
        quantity
      );

      res.json(contentIdea);
    } catch (error) {
      console.error("Generate ideas error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "İçerik fikirleri oluşturulamadı" }
      });
    }
  });

  app.post("/api/ai/generate/caption", authenticateToken, apiRateLimit("ai_captions"), async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        ideaId: z.string().optional(),
        rawIdea: z.string().optional(),
        platform: z.enum(["instagram", "linkedin", "x", "tiktok"]),
        tone: z.string().min(1, "Ton gerekli"),
        keywords: z.array(z.string()).optional(),
      }).refine(data => data.ideaId || data.rawIdea, {
        message: "ideaId veya rawIdea gerekli"
      });

      const { ideaId, rawIdea, platform, tone, keywords } = schema.parse(req.body);

      let captions;
      if (ideaId) {
        captions = await contentService.generatePostCaptions(ideaId, platform, tone, keywords);
      } else {
        captions = await openaiService.generateCaptions(rawIdea!, platform, tone, keywords);
      }

      res.json({ variants: captions });
    } catch (error) {
      console.error("Generate caption error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Caption oluşturulamadı" }
      });
    }
  });

  app.post("/api/ai/generate/image", authenticateToken, apiRateLimit("ai_images"), async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1, "Prompt gerekli"),
        aspectRatio: z.enum(["1:1", "16:9", "9:16"]).default("1:1"),
        styleHints: z.string().optional(),
      });

      const { prompt, aspectRatio, styleHints } = schema.parse(req.body);

      const image = await openaiService.generateImage(prompt, aspectRatio, styleHints);

      res.json(image);
    } catch (error) {
      console.error("Generate image error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Görsel oluşturulamadı" }
      });
    }
  });

  // Posts routes
  app.get("/api/posts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const status = req.query.status as string | undefined;
      const posts = await storage.getPostAssets(req.user!.id, status);
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Gönderiler alınamadı" }
      });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const schema = insertPostAssetSchema.pick({
        caption: true,
        hashtags: true,
        imageUrl: true,
        platform: true,
        ideaId: true,
      }).extend({
        scheduledAt: z.string().datetime().optional(),
      });

      const data = schema.parse(req.body);

      const post = await storage.createPostAsset({
        ...data,
        userId: req.user!.id,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        status: "draft",
      });

      res.json(post);
    } catch (error) {
      console.error("Create post error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Gönderi oluşturulamadı" }
      });
    }
  });

  app.patch("/api/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        caption: z.string().optional(),
        hashtags: z.string().optional(),
        imageUrl: z.string().optional(),
        scheduledAt: z.string().datetime().optional(),
        status: z.enum(["draft", "scheduled", "posted", "failed"]).optional(),
      });

      const data = schema.parse(req.body);
      const updates: any = { ...data };

      if (data.scheduledAt) {
        updates.scheduledAt = new Date(data.scheduledAt);
      }

      const post = await storage.updatePostAsset(req.params.id, updates);
      res.json(post);
    } catch (error) {
      console.error("Update post error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: error.errors[0].message }
        });
      }
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Gönderi güncellenemedi" }
      });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.deletePostAsset(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Gönderi silinemedi" }
      });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "İstatistikler alınamadı" }
      });
    }
  });

  // API usage stats
  app.get("/api/usage/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const usage = await storage.getApiUsageStats(req.user!.id, since);
      res.json({
        ideas: usage.ai_ideas || 0,
        captions: usage.ai_captions || 0,
        images: usage.ai_images || 0,
      });
    } catch (error) {
      console.error("Get API usage stats error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "API kullanım istatistikleri alınamadı" },
      });
    }
  });

  // Integration routes (Zapier/Make webhook)
  app.use("/api/integrations", integrationRoutes);

  app.post("/api/posts/:postId/publish", authenticateToken, requirePlan("pro"), async (req: AuthRequest, res) => {
    try {
      const post = await contentService.publishPostNow(req.params.postId);
      res.json(post);
    } catch (error) {
      console.error("Publish post error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Gönderi Zapier'e gönderilemedi" }
      });
    }
  });

  // Export routes
  app.get("/api/export/csv", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const csv = await contentService.generatePostsCSV(req.user!.id);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=posts.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export CSV error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "CSV dışa aktarılamadı" }
      });
    }
  });

  // Billing routes
  app.post("/api/billing/checkout", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı" }
        });
      }

      try {
        const result = await iyzicoService.createCheckoutForm(
          user.email,
          user.name || "Pro User",
          99,
          `${req.protocol}://${req.get("host")}/billing?payment_status=success&plan=pro`
        );

        res.json({ token: result.token, url: result.paymentPageUrl });
      } catch (iyzicoError: any) {
        console.error("İyzico API error, using fallback:", iyzicoError.message);

        // Fallback development checkout URL
        const fallbackUrl = `${req.protocol}://${req.get("host")}/billing?payment_status=success&plan=pro&source=fallback`;

        res.json({
          token: "dev-checkout-session",
          url: fallbackUrl
        });
      }
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Ödeme oluşturulamadı" }
      });
    }
  });

  app.get("/api/billing/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: { code: "USER_NOT_FOUND", message: "Kullanıcı bulunamadı" }
        });
      }

      const subscription = await storage.getSubscription(user.id);

      res.json({
        plan: user.plan,
        subscription: subscription ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        } : null,
      });
    } catch (error) {
      console.error("Get billing status error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "Fatura durumu alınamadı" }
      });
    }
  });

  // Content ideas routes
  app.get("/api/content-ideas", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const ideas = await storage.getContentIdeas(req.user!.id);
      res.json(ideas);
    } catch (error) {
      console.error("Get content ideas error:", error);
      res.status(500).json({
        error: { code: "INTERNAL_ERROR", message: "İçerik fikirleri alınamadı" }
      });
    }
  });

  // PHASE 5: Advanced AI Features Routes
  
  // Generate personalized content
  app.post("/api/ai/personalized-content", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { prompt, platform, contentType } = req.body;
      
      if (!prompt || !platform) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "Prompt ve platform gerekli" }
        });
      }

      const result = await advancedAIService.generatePersonalizedContent(
        req.user!.id,
        prompt,
        platform,
        contentType || 'post'
      );

      res.json(result);
    } catch (error) {
      console.error("Personalized content generation error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Kişiselleştirilmiş içerik oluşturulamadı" }
      });
    }
  });

  // Generate multi-modal content
  app.post("/api/ai/multi-modal", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { contentType, topic, platform, duration } = req.body;
      
      if (!contentType || !topic || !platform) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "İçerik türü, konu ve platform gerekli" }
        });
      }

      const result = await advancedAIService.generateMultiModalContent(
        req.user!.id,
        contentType,
        topic,
        platform,
        duration
      );

      res.json(result);
    } catch (error) {
      console.error("Multi-modal content generation error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Multi-modal içerik oluşturulamadı" }
      });
    }
  });

  // Score content quality
  app.post("/api/ai/score-content", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { content, platform } = req.body;
      
      if (!content || !platform) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "İçerik ve platform gerekli" }
        });
      }

      const scoring = await advancedAIService.scoreContent(
        req.user!.id,
        content,
        platform
      );

      res.json(scoring);
    } catch (error) {
      console.error("Content scoring error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "İçerik skorlanamadı" }
      });
    }
  });

  // Get A/B test recommendations
  app.post("/api/ai/ab-test", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { content, platform } = req.body;
      
      if (!content || !platform) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "İçerik ve platform gerekli" }
        });
      }

      const recommendations = await advancedAIService.generateABTestRecommendations(
        req.user!.id,
        content,
        platform
      );

      res.json(recommendations);
    } catch (error) {
      console.error("A/B test recommendations error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "A/B test önerileri oluşturulamadı" }
      });
    }
  });

  // Get personalized suggestions
  app.get("/api/ai/personalized-suggestions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { contentType } = req.query;
      
      const suggestions = await userBehaviorService.getPersonalizedSuggestions(
        req.user!.id,
        contentType as string || 'post'
      );

      res.json(suggestions);
    } catch (error) {
      console.error("Personalized suggestions error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Kişiselleştirilmiş öneriler alınamadı" }
      });
    }
  });

  // Track user interaction
  app.post("/api/ai/track-interaction", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { contentType, action, contentData } = req.body;
      
      if (!contentType || !action) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "İçerik türü ve aksiyon gerekli" }
        });
      }

      await userBehaviorService.trackInteraction({
        userId: req.user!.id,
        contentType,
        action,
        contentData: contentData || {},
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Track interaction error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Etkileşim kaydedilemedi" }
      });
    }
  });

  // Get performance analysis
  app.get("/api/ai/performance-analysis", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const analysis = await userBehaviorService.analyzePerformanceHistory(req.user!.id);
      res.json(analysis);
    } catch (error) {
      console.error("Performance analysis error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Performans analizi alınamadı" }
      });
    }
  });

  // Get industry templates
  app.get("/api/ai/industry-templates", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { industry, contentType } = req.query;
      
      if (!industry) {
        return res.status(400).json({
          error: { code: "INVALID_INPUT", message: "Sektör bilgisi gerekli" }
        });
      }

      const template = advancedAIService.getIndustryTemplate(
        industry as string,
        contentType as string || 'post'
      );

      res.json(template);
    } catch (error) {
      console.error("Industry templates error:", error);
      res.status(500).json({
        error: { code: "AI_ERROR", message: "Sektör şablonları alınamadı" }
      });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      console.error("List users error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Kullanıcılar alınamadı" } });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Kullanıcı silinemedi" } });
    }
  });

  app.get("/api/admin/posts", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const posts = await storage.listPostAssets();
      res.json(posts);
    } catch (error) {
      console.error("List posts error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Gönderiler alınamadı" } });
    }
  });

  app.delete("/api/admin/posts/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deletePostAsset(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Gönderi silinemedi" } });
    }
  });

  app.get("/api/admin/ideas", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const ideas = await storage.listContentIdeas();
      res.json(ideas);
    } catch (error) {
      console.error("List ideas error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Fikirler alınamadı" } });
    }
  });

  app.delete("/api/admin/ideas/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteContentIdea(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete idea error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Fikir silinemedi" } });
    }
  });

  app.get("/api/admin/subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const subs = await storage.listSubscriptions();
      res.json(subs);
    } catch (error) {
      console.error("List subscriptions error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Abonelikler alınamadı" } });
    }
  });

  app.delete("/api/admin/subscriptions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteSubscription(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete subscription error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Abonelik silinemedi" } });
    }
  });

  // Mount route modules
  app.use('/api/integrations', integrationRoutes);

  // Register performance routes directly
  registerPerformanceRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}