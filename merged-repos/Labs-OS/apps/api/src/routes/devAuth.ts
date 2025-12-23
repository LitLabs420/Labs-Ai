import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const devAuthRouter = Router();

devAuthRouter.post("/token", async (req, res) => {
  if (process.env.NODE_ENV !== "development") return res.status(404).json({ error: "Not available" });

  const body = z.object({
    sub: z.string(),
    role: z.enum(["USER","ADMIN","MOD","SERVICE"]).optional(),
  }).parse(req.body);

  const secret = process.env.JWT_SECRET || "";
  if (!secret) return res.status(500).json({ error: "JWT_SECRET missing" });

  const token = jwt.sign({ role: body.role ?? "USER" }, secret, { subject: body.sub, expiresIn: "7d" });
  res.json({ token });
});