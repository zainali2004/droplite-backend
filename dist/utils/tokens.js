"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
