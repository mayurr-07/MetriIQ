import { Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth.js";
import { UserRole } from "../models/User.js";

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}`,
      });
      return;
    }
    next();
  };
}
