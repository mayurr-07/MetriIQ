import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const payload = jwt.verify(token, secret) as { sub: string };
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.active) {
      res.status(401).json({ error: "User not found or inactive" });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
