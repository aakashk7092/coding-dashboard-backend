import cron from "node-cron";
import DeveloperStats from "../models/DeveloperStats.js";
import { hasDatabaseConnection } from "../config/db.js";
import { refreshDeveloperStats } from "../controllers/dashboardController.js";

export function startUpdateStatsJob() {
  cron.schedule("0 * * * *", async () => {
    if (!hasDatabaseConnection()) {
      return;
    }

    try {
      const users = await DeveloperStats.find({}, { username: 1 }).lean();

      for (const user of users) {
        await refreshDeveloperStats(user.username);
      }
    } catch (error) {
      console.error("Hourly stats update failed:", error.message);
    }
  });
}
