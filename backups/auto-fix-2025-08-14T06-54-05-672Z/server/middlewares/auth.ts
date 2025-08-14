import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    plan: string;
    role: string;
  };
}

export const generateToken = (
  userId: string,
  email: string,
  plan: string,
  role: string,
): string => {
  return jwt.sign(
    { userId, email, plan, role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Token bulunamadı" } });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Kullanıcı bulunamadı" } });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Geçersiz token" } });
  }
};

export const requirePlan = (requiredPlan: "pro") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Giriş gerekli" } });
      return;
    }

    if (req.user.plan !== requiredPlan && req.user.role !== "admin") {
      res.status(403).json({
        error: {
          code: "PLAN_REQUIRED",
          message: `${requiredPlan} planı gerekli`
        }
      });
      return;
    }

    next();
  };
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      error: { code: "FORBIDDEN", message: "Yalnızca adminler erişebilir" },
    });
    return;
  }

  next();
};
