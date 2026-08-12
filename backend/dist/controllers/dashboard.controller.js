"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_js_1 = require("../services/dashboard.service.js");
class DashboardController {
    static getStats = async (req, res) => {
        const stats = await dashboard_service_js_1.DashboardService.getDashboardStats(req.user.userId);
        return res.status(200).json(stats);
    };
}
exports.DashboardController = DashboardController;
