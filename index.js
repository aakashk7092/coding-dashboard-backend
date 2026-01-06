import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import leetcodeRoutes from "./src/routes/leetcode.js";
import githubRoutes from "./src/routes/github.js";
import profileRoutes from "./src/routes/profiles.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Coding Dashboard Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
