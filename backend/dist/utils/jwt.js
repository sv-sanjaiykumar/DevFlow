"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hashToken = hashToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const index_js_1 = require("../config/index.js");
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwt.accessSecret, {
        expiresIn: index_js_1.config.jwt.accessExpiry,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwt.refreshSecret, {
        expiresIn: index_js_1.config.jwt.refreshExpiry,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.accessSecret);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.refreshSecret);
}
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
