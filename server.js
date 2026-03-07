import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, hasDatabaseConnection } from "./src/config/db.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import leetcodeRoutes from "./src/routes/leetcode.js";
import githubRoutes from "./src/routes/github.js";
import profileRoutes from "./src/routes/profiles.js";
import { startUpdateStatsJob } from "./src/jobs/updateStatsJob.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", dashboardRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Developer dashboard backend is running",
    database: hasDatabaseConnection() ? "connected" : "disabled",
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  })
  .finally(() => {
    startUpdateStatsJob();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
