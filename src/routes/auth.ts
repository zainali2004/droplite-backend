import { Router } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/tokens";
import jwt from "jsonwebtoken";

const router = Router();

// Utility to safely handle async logic
const safeAsync = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Register user
router.post(
  "/register",
  safeAsync(async (req: any, res: any) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashed },
    });

    const tokens = generateTokens(newUser.id);

    res.status(201).json({
      user: { id: newUser.id, email: newUser.email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  })
);

// Login user
router.post(
  "/login",
  safeAsync(async (req: any, res: any): Promise<any> => {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password!))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens(user.id);

    res.status(200).json(tokens);
  })
);

// Refresh token
router.post(
  "/refresh",
  safeAsync(async (req: any, res: any) => {
    const { refreshToken } = req.body ?? {};

    if (typeof refreshToken !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as jwt.JwtPayload;

      if (!payload?.userId) {
        throw new Error("Invalid token structure");
      }

      const tokens = generateTokens(payload.userId);
      res.status(200).json(tokens);
    } catch {
      res.status(403).json({ message: "Invalid refresh token" });
    }
  })
);

export default router;
