import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import leaderboardRoutes from "./routes/leaderboard";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import syncRoutes from "./routes/sync";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://code-nexus-ten.vercel.app",
];
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CodeNexus backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sync", syncRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled Express error:", err);
    res.status(500).json({
      success: false,
      error: err?.message || "Internal Server Error",
    });
  },
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});
