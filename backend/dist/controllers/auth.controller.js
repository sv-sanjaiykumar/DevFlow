"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
class AuthController {
    static register = async (req, res) => {
        const result = await auth_service_js_1.AuthService.register(req.body);
        return res.status(201).json(result);
    };
    static login = async (req, res) => {
        const result = await auth_service_js_1.AuthService.login(req.body);
        return res.status(200).json(result);
    };
    static refresh = async (req, res) => {
        const { refreshToken } = req.body;
        const result = await auth_service_js_1.AuthService.refresh(refreshToken);
        return res.status(200).json(result);
    };
    static logout = async (req, res) => {
        const { refreshToken } = req.body;
        await auth_service_js_1.AuthService.logout(refreshToken);
        return res.status(200).json({ message: 'Logged out successfully' });
    };
    static me = async (req, res) => {
        const user = await auth_service_js_1.AuthService.getCurrentUser(req.user.userId);
        return res.status(200).json({ user });
    };
}
exports.AuthController = AuthController;
