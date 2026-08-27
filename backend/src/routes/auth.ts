import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";
import { requireAuth, AuthRequest } from "../middleware/requireAuth.js";

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email, active: true });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"] }
  );

  res.json({ token, user });
});

// GET /api/auth/me
router.get(
  "/me",
  requireAuth,
  (req: AuthRequest, res: Response): void => {
    res.json({ user: req.user });
  }
);

export default router;
