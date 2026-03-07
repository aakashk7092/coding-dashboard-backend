import express from "express";
import { getDashboardStats, refreshDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard/:username", getDashboardStats);
router.post("/dashboard/:username/refresh", refreshDashboardStats);

export default router;
