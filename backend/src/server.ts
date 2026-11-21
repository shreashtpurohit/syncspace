import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { verifyRequestOrigin } from "./middleware/csrf.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(verifyRequestOrigin);
app.use(authRoutes);
app.use(workspaceRoutes);
app.use(taskRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "SyncSpace API is running" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});