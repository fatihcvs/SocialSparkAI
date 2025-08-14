import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import type { AuthRequest } from "./auth";

interface RateLimitConfig {
  endpoint: string;
  freeLimit: number;
  proLimit: number;
  windowHours: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  ai_ideas: {
    endpoint: "ai_ideas",
    freeLimit: 5,
    proLimit: 50,
    windowHours: 24,
  },
  ai_captions: {
    endpoint: "ai_captions", 
    freeLimit: 5,
    proLimit: 50,
    windowHours: 24,
  },
  ai_images: {
    endpoint: "ai_images",
    freeLimit: 5,
    proLimit: 50,
    windowHours: 24,
  },
};

export const rateLimit = (configKey: keyof typeof rateLimitConfigs) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Giriş gerekli" } });
      return;
    }

    const config = rateLimitConfigs[configKey];
    if (!config) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Rate limit yapılandırması bulunamadı" } });
      return;
    }

    try {
      const now = new Date();
      const usage = await storage.getApiUsage(req.user.id, config.endpoint, now);

      const limit = req.user.plan === "pro" ? config.proLimit : config.freeLimit;

      if (usage >= limit) {
        res.status(429).json({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Günlük ${config.endpoint} limiti aşıldı (${usage}/${limit})`,
          },
        });
        return;
      }

      // Increment usage
      await storage.incrementApiUsage(req.user.id, config.endpoint);

      // Add usage info to response headers
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - usage - 1));
      res.setHeader("X-RateLimit-Reset", new Date(now.getTime() + config.windowHours * 60 * 60 * 1000).toISOString());

      next();
    } catch (error) {
      console.error("Rate limit error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Rate limit kontrolü başarısız" } });
    }
  };
};

// IP-based rate limiting for auth endpoints
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const ipRateLimit = (maxRequests: number, windowMinutes: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const ipData = ipRequestCounts.get(ip);

    if (!ipData || now > ipData.resetTime) {
      // Reset or initialize
      ipRequestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (ipData.count >= maxRequests) {
      res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin.",
        },
      });
      return;
    }

    ipData.count++;
    next();
  };
};
