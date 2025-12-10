import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/crypto-payments";
import { captureError } from "@/lib/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/crypto
 * Process cryptocurrency payments (Solana, Ethereum)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from request (implement based on your auth)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, userId, tier, blockchain, description, walletAddress } = body;

    // Validate input
    if (!amount || !userId || !tier || !blockchain) {
      return NextResponse.json(
        { error: "Missing required fields: amount, userId, tier, blockchain" },
        { status: 400 }
      );
    }

    if (!["solana", "ethereum", "stripe"].includes(blockchain)) {
      return NextResponse.json(
        { error: "Invalid blockchain. Must be solana, ethereum, or stripe" },
        { status: 400 }
      );
    }

    // Process payment
    const result = await processPayment(
      {
        amount,
        userId,
        tier,
        blockchain,
        description: description || `Upgrade to ${tier} tier`,
      },
      walletAddress
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment processing failed";
    captureError("Crypto payment error", {
      error: message,
      path: "/api/payments/crypto",
    });

    return NextResponse.json(
      { error: "Failed to process payment", message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/crypto/status
 * Check status of a crypto payment
 */
export async function GET(request: NextRequest) {
  try {
    const txHash = request.nextUrl.searchParams.get("hash");
    const blockchain = request.nextUrl.searchParams.get("blockchain");

    if (!txHash || !blockchain) {
      return NextResponse.json(
        { error: "Missing required query params: hash, blockchain" },
        { status: 400 }
      );
    }

    // Implement verification based on blockchain
    // This is a placeholder - actual implementation would check on-chain
    return NextResponse.json({
      status: "pending",
      transactionHash: txHash,
      blockchain,
      message: "Transaction is being confirmed on chain",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Status check failed";
    return NextResponse.json(
      { error: "Failed to check payment status", message },
      { status: 500 }
    );
  }
}
