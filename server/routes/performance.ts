import { Express } from "express";
import { enhancedAuth, requireRole } from "../middlewares/enhancedAuth";
import { PerformanceMonitorService } from "../middlewares/performanceMonitor";
import { cacheService } from "../services/cacheService";
import { rateLimitService } from "../services/rateLimitService";

export function registerPerformanceRoutes(app: Express) {
  /**
   * Get system performance metrics (Admin only)
   */
  app.get("/api/admin/performance", enhancedAuth, requireRole("admin"), async (req, res) => {
    try {
      const performanceStats = PerformanceMonitorService.getStats();
      const cacheStats = cacheService.getStats();
      const rateLimitStats = await rateLimitService.getStatus();

      res.json({
        performance: performanceStats,
        cache: {
          ...cacheStats,
          hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100 || 0
        },
        rateLimit: rateLimitStats,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Performance metrics error:", error);
      res.status(500).json({
        error: {
          code: "PERFORMANCE_METRICS_ERROR",
          message: "Performans metrikleri alınamadı"
        }
      });
    }
  });

  /**
   * Get endpoint-specific performance stats (Admin only)
   */
  app.get("/api/admin/performance/:endpoint", enhancedAuth, requireRole("admin"), async (req, res) => {
    try {
      const endpoint = req.params.endpoint;
      const stats = PerformanceMonitorService.getEndpointStats(`/api/${endpoint}`);

      res.json({
        endpoint: `/api/${endpoint}`,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Endpoint performance error:", error);
      res.status(500).json({
        error: {
          code: "ENDPOINT_PERFORMANCE_ERROR",
          message: "Endpoint performans verileri alınamadı"
        }
      });
    }
  });

  /**
   * Clear cache (Admin only)
   */
  app.post("/api/admin/cache/clear", enhancedAuth, requireRole("admin"), async (req, res) => {
    try {
      cacheService.clear();
      
      res.json({
        message: "Cache başarıyla temizlendi",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Cache clear error:", error);
      res.status(500).json({
        error: {
          code: "CACHE_CLEAR_ERROR",
          message: "Cache temizlenirken hata oluştu"
        }
      });
    }
  });

  /**
   * Get user's rate limit status
   */
  app.get("/api/user/rate-limit", enhancedAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      // Get current usage for AI features
      const aiGenerationUsage = cacheService.get<number>(`rateLimit:${user.id}:aiGeneration:${new Date().toISOString().split('T')[0]}:${new Date().getHours()}`) || 0;
      const imageGenerationUsage = cacheService.get<number>(`rateLimit:${user.id}:imageGeneration:${new Date().toISOString().split('T')[0]}:${new Date().getHours()}`) || 0;

      // Get plan limits
      const planLimits = {
        free: { aiGeneration: 5, imageGeneration: 2 },
        pro: { aiGeneration: 100, imageGeneration: 50 },
        enterprise: { aiGeneration: 1000, imageGeneration: 500 }
      };

      const userLimits = planLimits[user.plan as keyof typeof planLimits] || planLimits.free;

      res.json({
        plan: user.plan,
        usage: {
          aiGeneration: {
            used: aiGenerationUsage,
            limit: userLimits.aiGeneration,
            remaining: Math.max(0, userLimits.aiGeneration - aiGenerationUsage)
          },
          imageGeneration: {
            used: imageGenerationUsage,
            limit: userLimits.imageGeneration,
            remaining: Math.max(0, userLimits.imageGeneration - imageGenerationUsage)
          }
        },
        resetTime: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // Next day
      });
    } catch (error) {
      console.error("Rate limit status error:", error);
      res.status(500).json({
        error: {
          code: "RATE_LIMIT_STATUS_ERROR",
          message: "Rate limit durumu alınamadı"
        }
      });
    }
  });
}