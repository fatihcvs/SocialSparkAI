import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: number;
  userPlan?: string;
  userId?: string;
}

/**
 * Performance monitoring and analytics service
 */
export class PerformanceMonitorService {
  private static readonly METRICS_KEY_PREFIX = 'perf_metrics';
  private static readonly SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds
  private static readonly METRICS_RETENTION_HOURS = 24;

  /**
   * Log performance metrics
   */
  static logMetrics(metrics: PerformanceMetrics): void {
    const key = `${this.METRICS_KEY_PREFIX}:${Date.now()}`;
    cacheService.cache.set(key, metrics, this.METRICS_RETENTION_HOURS * 3600);

    // Log slow requests
    if (metrics.duration > this.SLOW_REQUEST_THRESHOLD) {
      console.warn(`SLOW REQUEST: ${metrics.method} ${metrics.endpoint} took ${metrics.duration}ms`);
    }

    // Log errors
    if (metrics.statusCode >= 400) {
      console.error(`ERROR REQUEST: ${metrics.method} ${metrics.endpoint} returned ${metrics.statusCode}`);
    }
  }

  /**
   * Get performance statistics
   */
  static getStats(): {
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
    totalRequests: number;
    requestsByPlan: Record<string, number>;
  } {
    const allKeys = cacheService.cache.keys();
    const metricsKeys = allKeys.filter(key => key.startsWith(this.METRICS_KEY_PREFIX));
    
    const metrics: PerformanceMetrics[] = metricsKeys
      .map(key => cacheService.cache.get<PerformanceMetrics>(key))
      .filter(Boolean) as PerformanceMetrics[];

    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        totalRequests: 0,
        requestsByPlan: {}
      };
    }

    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const slowRequests = metrics.filter(m => m.duration > this.SLOW_REQUEST_THRESHOLD).length;
    const errorRequests = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;

    const requestsByPlan: Record<string, number> = {};
    metrics.forEach(m => {
      if (m.userPlan) {
        requestsByPlan[m.userPlan] = (requestsByPlan[m.userPlan] || 0) + 1;
      }
    });

    return {
      averageResponseTime: Math.round(averageResponseTime),
      slowRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests,
      requestsByPlan
    };
  }

  /**
   * Get endpoint-specific statistics
   */
  static getEndpointStats(endpoint: string): {
    averageResponseTime: number;
    requestCount: number;
    errorRate: number;
  } {
    const allKeys = cacheService.cache.keys();
    const metricsKeys = allKeys.filter(key => key.startsWith(this.METRICS_KEY_PREFIX));
    
    const endpointMetrics: PerformanceMetrics[] = metricsKeys
      .map(key => cacheService.cache.get<PerformanceMetrics>(key))
      .filter(m => m && m.endpoint === endpoint) as PerformanceMetrics[];

    if (endpointMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        requestCount: 0,
        errorRate: 0
      };
    }

    const requestCount = endpointMetrics.length;
    const averageResponseTime = endpointMetrics.reduce((sum, m) => sum + m.duration, 0) / requestCount;
    const errorRequests = endpointMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / requestCount) * 100;

    return {
      averageResponseTime: Math.round(averageResponseTime),
      requestCount,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }
}

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response
  res.send = function(data: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Extract user info if available
    const user = (req as any).user;
    
    const metrics: PerformanceMetrics = {
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: endTime,
      userPlan: user?.plan,
      userId: user?.id
    };

    PerformanceMonitorService.logMetrics(metrics);

    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Timestamp', endTime.toString());

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Health check middleware
 */
export function healthCheck(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/health' || req.path === '/api/health') {
    const stats = PerformanceMonitorService.getStats();
    const cacheStats = cacheService.getStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      performance: stats,
      cache: cacheStats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
    return;
  }
  next();
}