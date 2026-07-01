import express from "express";
import cors from "cors";
import { router as authRouter } from "./auth.js";
import profileRouter from "./profile.js";
import checklistRouter from "./checklist.js";
import actionsRouter from "./actions.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/checklist", checklistRouter);
app.use("/api/actions", actionsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Tik server running on http://localhost:${PORT}`);
});
