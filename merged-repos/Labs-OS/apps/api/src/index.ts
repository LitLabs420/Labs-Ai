import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { requestContext } from "./auth/middleware";
import { marketplaceRouter } from "./routes/marketplace";
import { devAuthRouter } from "./routes/devAuth";
import { authRouter } from "./routes/auth";
import { startMarketAgent } from "./agents/market-agent/MarketAgent";

const app = express();
app.use(helmet());
app.use(requestContext);
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/dev", devAuthRouter);
app.use("/api/auth", authRouter);
app.use("/api/marketplace", marketplaceRouter);

const port = Number(process.env.PORT || 3001);

async function boot() {
  await startMarketAgent();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

boot().catch((err) => {
  console.error("BOOT_ERROR", err);
  process.exit(1);
});