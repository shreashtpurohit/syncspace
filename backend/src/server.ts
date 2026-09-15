import express from "express";

const app = express();

const PORT = 5000;

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message:"SyncSpace API is running",
    });
});

app.listen(PORT, () => {
  console.log(`SyncSpace API running on port ${PORT}`);
});