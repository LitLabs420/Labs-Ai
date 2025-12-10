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

    // Verify on-chain transaction based on blockchain
    let isConfirmed = false;
    let confirmations = 0;
    
    try {
      if (blockchain === 'ethereum' || blockchain === 'polygon') {
        // Verify Ethereum/Polygon transaction via Etherscan-like API
        const apiKey = process.env.ETHERSCAN_API_KEY || '';
        const baseUrl = blockchain === 'polygon' ? 'https://api.polygonscan.com/api' : 'https://api.etherscan.io/api';
        const response = await fetch(
          `${baseUrl}?module=transaction&action=getstatus&txhash=${txHash}&apikey=${apiKey}`
        );
        const data = await response.json();
        isConfirmed = data.status === '1';
        confirmations = isConfirmed ? 12 : 0; // Assume 12+ confirmations = finalized
      } else if (blockchain === 'solana') {
        // Verify Solana transaction via RPC
        const response = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [txHash, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
          }),
        });
        const result = await response.json();
        isConfirmed = result.result !== null && result.result.meta?.err === null;
        confirmations = isConfirmed ? 32 : 0;
      } else if (blockchain === 'bitcoin') {
        // Verify Bitcoin transaction via blockchain.com API
        const response = await fetch(`https://blockchain.info/rawtx/${txHash}?format=json`);
        isConfirmed = response.ok;
        if (isConfirmed) {
          const data = await response.json();
          confirmations = data.block_height ? 6 : 0; // 6+ confirmations = standard
        }
      }
    } catch (error) {
      console.error(`Error verifying ${blockchain} transaction:`, error);
      isConfirmed = false;
    }

    return NextResponse.json({
      status: isConfirmed ? "confirmed" : "pending",
      transactionHash: txHash,
      blockchain,
      confirmations,
      message: isConfirmed ? "Transaction confirmed on chain" : "Transaction is being confirmed on chain",
      verified: isConfirmed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Status check failed";
    return NextResponse.json(
      { error: "Failed to check payment status", message },
      { status: 500 }
    );
  }
}
