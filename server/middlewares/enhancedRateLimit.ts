import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';
import { cacheService } from '../services/cacheService';

interface RateLimitRequest extends Request {
  user?: {
    id: string;
    plan: string;
  };
}

/**
 * Enhanced rate limiting based on user plan and feature usage
 */
export class EnhancedRateLimitService {
  private static getPlanLimits(plan: string) {
    const limits = {
      free: {
        apiCalls: { windowMs: 60 * 60 * 1000, max: 10 }, // 10 per hour
        aiGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 5 }, // 5 per day
        imageGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 2 } // 2 per day
      },
      pro: {
        apiCalls: { windowMs: 60 * 60 * 1000, max: 1000 }, // 1000 per hour
        aiGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 100 }, // 100 per day
        imageGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 50 } // 50 per day
      },
      enterprise: {
        apiCalls: { windowMs: 60 * 60 * 1000, max: 10000 }, // 10000 per hour
        aiGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 1000 }, // 1000 per day
        imageGeneration: { windowMs: 24 * 60 * 60 * 1000, max: 500 } // 500 per day
      }
    };

    return limits[plan as keyof typeof limits] || limits.free;
  }

  /**
   * Generate rate limit key for user-specific tracking
   */
  private static generateKey(userId: string, feature: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = new Date().getHours();
    return `rateLimit:${userId}:${feature}:${date}:${hour}`;
  }

  /**
   * Check if user has exceeded rate limit for specific feature
   */
  static async checkFeatureLimit(userId: string, userPlan: string, feature: string): Promise<boolean> {
    const limits = this.getPlanLimits(userPlan);
    const featureLimit = limits[feature as keyof typeof limits];
    
    if (!featureLimit) {
      return true; // Allow if no limit defined
    }

    const key = this.generateKey(userId, feature);
    const currentUsage = cacheService.get<number>(key) || 0;

    if (currentUsage >= featureLimit.max) {
      return false; // Rate limit exceeded
    }

    // Increment usage (TTL in seconds)
    cacheService.cache.set(key, currentUsage + 1, Math.floor(featureLimit.windowMs / 1000));
    return true;
  }

  /**
   * Get current usage for a feature
   */
  static getCurrentUsage(userId: string, feature: string): number {
    const key = this.generateKey(userId, feature);
    return cacheService.get<number>(key) || 0;
  }

  /**
   * Get remaining quota for a feature
   */
  static getRemainingQuota(userId: string, userPlan: string, feature: string): number {
    const limits = this.getPlanLimits(userPlan);
    const featureLimit = limits[feature as keyof typeof limits];
    
    if (!featureLimit) {
      return Infinity;
    }

    const currentUsage = this.getCurrentUsage(userId, feature);
    return Math.max(0, featureLimit.max - currentUsage);
  }
}

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin"
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for admin users
    const user = (req as RateLimitRequest).user;
    return user?.plan === 'enterprise';
  }
});

/**
 * AI feature rate limiter middleware
 */
export function aiFeatureRateLimit(feature: string) {
  return async (req: RateLimitRequest, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Kimlik doğrulama gerekli"
        }
      });
    }

    const canProceed = await EnhancedRateLimitService.checkFeatureLimit(
      req.user.id,
      req.user.plan,
      feature
    );

    if (!canProceed) {
      const remaining = EnhancedRateLimitService.getRemainingQuota(
        req.user.id,
        req.user.plan,
        feature
      );

      return res.status(429).json({
        error: {
          code: "FEATURE_LIMIT_EXCEEDED",
          message: `${feature} özelliği için günlük limitiniz doldu`,
          feature,
          remaining,
          plan: req.user.plan
        }
      });
    }

    // Add usage info to response headers
    const currentUsage = EnhancedRateLimitService.getCurrentUsage(req.user.id, feature);
    const remaining = EnhancedRateLimitService.getRemainingQuota(req.user.id, req.user.plan, feature);
    
    res.setHeader('X-RateLimit-Feature', feature);
    res.setHeader('X-RateLimit-Used', currentUsage.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());

    next();
  };
}

/**
 * Strict rate limiter for expensive operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // very strict limit
  message: {
    error: {
      code: "STRICT_RATE_LIMIT_EXCEEDED",
      message: "Bu işlem için saatlik limitiniz doldu"
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});