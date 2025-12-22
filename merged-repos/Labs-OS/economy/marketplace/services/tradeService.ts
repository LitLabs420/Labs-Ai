import { prisma } from "@/apps/api/src/lib/prisma";
import { redis } from "@/apps/api/src/lib/redis";
import { publish } from "@/apps/api/src/lib/natsBus";
import { MarketEvents } from "../types/events";

const ESCROW_TTL_SECONDS = 60 * 5;

export async function requestTrade(params: {
  listingId: string;
  buyerId: string;
  idempotencyKey: string;
}) {
  const idemKey = \	rade:idem:\\;
  const already = await redis.get(idemKey);
  if (already) return JSON.parse(already);

  const result = await prisma.\(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: params.listingId },
      include: { asset: true },
    });
    if (!listing) throw new Error("LISTING_NOT_FOUND");
    if (listing.status !== "ACTIVE") throw new Error("LISTING_NOT_ACTIVE");
    if (!listing.asset.tradable) throw new Error("ASSET_NOT_TRADABLE");
    if (listing.shares <= 0) throw new Error("NO_SHARES_AVAILABLE");

    const sharesToBuy = listing.shares;

    const trade = await tx.trade.create({
      data: {
        listingId: listing.id,
        assetId: listing.assetId,
        buyerId: params.buyerId,
        sellerId: listing.sellerId,
        shares: sharesToBuy,
        priceCents: listing.priceCents,
        status: "ESCROWED",
        idempotency: params.idempotencyKey,
      },
    });

    await redis.set(\scrow:\\, "1", "EX", ESCROW_TTL_SECONDS);

    await tx.listing.update({
      where: { id: listing.id },
      data: { status: "SOLD", shares: 0 },
    });

    return trade;
  });

  await publish(MarketEvents.Trade.Requested, { tradeId: result.id });
  await publish(MarketEvents.Trade.Escrowed, { tradeId: result.id });

  await redis.set(idemKey, JSON.stringify(result), "EX", 60 * 60);
  return result;
}

export async function settleTrade(tradeId: string) {
  const escrowKey = \scrow:\\;
  const locked = await redis.get(escrowKey);
  if (!locked) return;

  await prisma.\(async (tx) => {
    const trade = await tx.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new Error("TRADE_NOT_FOUND");
    if (trade.status === "SETTLED") return;

    await tx.ledgerEntry.create({
      data: {
        userId: trade.buyerId,
        kind: "DEBIT",
        amountCents: trade.priceCents,
        refType: "TRADE",
        refId: trade.id,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        userId: trade.sellerId,
        kind: "CREDIT",
        amountCents: trade.priceCents,
        refType: "TRADE",
        refId: trade.id,
      },
    });

    const sellerShare = await tx.assetShare.upsert({
      where: { assetId_ownerId: { assetId: trade.assetId, ownerId: trade.sellerId } },
      update: {},
      create: { assetId: trade.assetId, ownerId: trade.sellerId, shares: 0 },
    });

    await tx.assetShare.update({
      where: { id: sellerShare.id },
      data: { shares: { decrement: trade.shares } },
    });

    await tx.assetShare.upsert({
      where: { assetId_ownerId: { assetId: trade.assetId, ownerId: trade.buyerId } },
      update: { shares: { increment: trade.shares } },
      create: { assetId: trade.assetId, ownerId: trade.buyerId, shares: trade.shares },
    });

    await tx.trade.update({
      where: { id: trade.id },
      data: { status: "SETTLED" },
    });
  });

  await redis.del(escrowKey);
  await publish(MarketEvents.Trade.Settled, { tradeId });
}