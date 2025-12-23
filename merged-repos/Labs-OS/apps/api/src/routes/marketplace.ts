import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requestTrade } from "../economy/marketplace/services/tradeService";
import { requireAuth, requirePerm } from "../auth/middleware";
import { Permissions } from "../auth/types";
import { beginIdempotent, completeIdempotent, failIdempotent, hashRequest } from "../idempotency/idempotencyService";

export const marketplaceRouter = Router();
marketplaceRouter.use(requireAuth);

marketplaceRouter.post("/asset", requirePerm(Permissions.Marketplace.CreateAsset), async (req, res) => {
  const body = z.object({
    type: z.string(),
    ownerId: z.string(),
    tradable: z.boolean().optional(),
    metadata: z.any().optional(),
    totalShares: z.number().int().min(1).optional(),
  }).parse(req.body);

  const totalShares = body.totalShares ?? 1;

  const asset = await prisma.asset.create({
    data: {
      type: body.type,
      tradable: body.tradable ?? true,
      metadata: body.metadata ?? {},
      totalShares,
      shares: { create: [{ ownerId: body.ownerId, shares: totalShares }] },
    },
    include: { shares: true },
  });

  res.json(asset);
});

marketplaceRouter.post("/list", requirePerm(Permissions.Marketplace.ListAsset), async (req, res) => {
  const body = z.object({
    assetId: z.string(),
    sellerId: z.string(),
    priceCents: z.number().int().min(1),
    shares: z.number().int().min(1).optional(),
  }).parse(req.body);

  const listing = await prisma.listing.create({
    data: {
      assetId: body.assetId,
      sellerId: body.sellerId,
      priceCents: body.priceCents,
      shares: body.shares ?? 1,
    },
  });

  res.json(listing);
});

marketplaceRouter.post("/trade/request", requirePerm(Permissions.Marketplace.RequestTrade), async (req, res) => {
  const body = z.object({
    listingId: z.string(),
    buyerId: z.string(),
  }).parse(req.body);

  const idempotencyKey = (req.headers["idempotency-key"] as string) || "";
  if (!idempotencyKey) return res.status(400).json({ error: "Missing idempotency-key header" });

  const scope = "trade.request";
  const userId = req.auth!.userId;

  const reqHash = hashRequest({ body, userId });
  const idem = await beginIdempotent({ key: idempotencyKey, scope, userId, requestHash: reqHash });

  if (idem.status === "COMPLETED" && idem.response) return res.json(idem.response);

  try {
    const trade = await requestTrade({ listingId: body.listingId, buyerId: body.buyerId, idempotencyKey });
    await completeIdempotent(idempotencyKey, trade);
    res.json(trade);
  } catch (err: any) {
    await failIdempotent(idempotencyKey, { error: err?.message || String(err) });
    throw err;
  }
});