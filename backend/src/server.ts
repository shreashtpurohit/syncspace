import "dotenv/config";
import express from "express";
import workspaceRoutes from "./routes/workspaceRoutes.js";

const app = express();

const PORT = 5000;

app.use(express.json());

app.post("/debug", (req, res) => {
  res.json({
    message: "POST works",
    body: req.body,
  });
});

app.use(workspaceRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message:"SyncSpace API is running",
    });
});

app.listen(PORT, () => {
  console.log(`SyncSpace API running on port ${PORT}`);
});