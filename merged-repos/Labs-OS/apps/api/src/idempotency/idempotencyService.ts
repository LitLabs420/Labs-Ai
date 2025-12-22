import crypto from "crypto";
import { prisma } from "../lib/prisma";

export function hashRequest(obj: any): string {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

export async function beginIdempotent(params: {
  key: string;
  scope: string;
  userId: string;
  requestHash: string;
}) {
  try {
    return await prisma.idempotencyKey.create({
      data: {
        key: params.key,
        scope: params.scope,
        userId: params.userId,
        requestHash: params.requestHash,
        status: "STARTED",
      },
    });
  } catch (e: any) {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key: params.key } });
    if (!existing) throw e;
    if (existing.requestHash !== params.requestHash) {
      throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD");
    }
    return existing;
  }
}

export async function completeIdempotent(key: string, response: any) {
  return prisma.idempotencyKey.update({
    where: { key },
    data: { status: "COMPLETED", response },
  });
}

export async function failIdempotent(key: string, error: any) {
  return prisma.idempotencyKey.update({
    where: { key },
    data: { status: "FAILED", response: error },
  });
}