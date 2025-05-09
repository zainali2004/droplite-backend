"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Utility to safely handle async logic
const safeAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Register user
router.post("/register", safeAsync(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }
    const existing = await prismaClient_1.default.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email already registered" });
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const newUser = await prismaClient_1.default.user.create({
        data: { email, password: hashed },
    });
    const tokens = (0, tokens_1.generateTokens)(newUser.id);
    res.status(201).json({
        user: { id: newUser.id, email: newUser.email },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    });
}));
// Login user
router.post("/login", safeAsync(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }
    const user = await prismaClient_1.default.user.findUnique({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const tokens = (0, tokens_1.generateTokens)(user.id);
    res.status(200).json(tokens);
}));
// Refresh token
router.post("/refresh", safeAsync(async (req, res) => {
    const { refreshToken } = req.body ?? {};
    if (typeof refreshToken !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (!payload?.userId) {
            throw new Error("Invalid token structure");
        }
        const tokens = (0, tokens_1.generateTokens)(payload.userId);
        res.status(200).json(tokens);
    }
    catch {
        res.status(403).json({ message: "Invalid refresh token" });
    }
}));
exports.default = router;
