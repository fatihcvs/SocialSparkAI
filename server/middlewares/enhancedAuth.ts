import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    plan: string;
    role: string;
  };
}

/**
 * Enhanced JWT authentication with refresh token support
 */
export class EnhancedAuthService {
  /**
   * Generate access and refresh tokens
   */
  static generateTokens(user: { id: string; email: string; plan: string; role: string }) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, plan: user.plan, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' } // Long-lived refresh token
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Fetch user from database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, plan: user.plan, role: user.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}

/**
 * Enhanced authentication middleware with automatic token refresh
 */
export async function enhancedAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const refreshToken = req.headers['x-refresh-token'] as string;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: { 
        code: "UNAUTHORIZED", 
        message: "Token bulunamadı" 
      } 
    });
  }

  const token = authHeader.substring(7);

  try {
    // Try to verify access token
    const decoded = EnhancedAuthService.verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      plan: decoded.plan,
      role: decoded.role
    };
    next();
  } catch (error) {
    // If access token is expired and we have a refresh token, try to refresh
    if (refreshToken) {
      try {
        const { accessToken } = await EnhancedAuthService.refreshAccessToken(refreshToken);
        
        // Set new access token in response header
        res.setHeader('x-new-access-token', accessToken);
        
        // Decode new token for user info
        const decoded = EnhancedAuthService.verifyAccessToken(accessToken);
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          plan: decoded.plan,
          role: decoded.role
        };
        next();
      } catch (refreshError) {
        return res.status(401).json({ 
          error: { 
            code: "TOKEN_REFRESH_FAILED", 
            message: "Token yenileme başarısız" 
          } 
        });
      }
    } else {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "Geçersiz token" 
        } 
      });
    }
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(requiredRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "Kimlik doğrulama gerekli" 
        } 
      });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: { 
          code: "FORBIDDEN", 
          message: "Bu işlem için yeterli yetkiniz yok" 
        } 
      });
    }

    next();
  };
}

/**
 * Plan-based feature access middleware
 */
export function requirePlan(requiredPlan: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: { 
          code: "UNAUTHORIZED", 
          message: "Kimlik doğrulama gerekli" 
        } 
      });
    }

    if (!requiredPlan.includes(req.user.plan)) {
      return res.status(403).json({ 
        error: { 
          code: "PLAN_UPGRADE_REQUIRED", 
          message: "Bu özellik için plan yükseltmesi gerekli",
          requiredPlan
        } 
      });
    }

    next();
  };
}

export type { AuthRequest };