import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const db = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    const executions = await db.agentExecution.findMany({
      where: { agentId: params.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        taskId: true,
        status: true,
        createdAt: true,
        completedAt: true,
        durationMs: true,
        error: true,
        inputTokens: true,
        outputTokens: true,
      },
    });

    const total = await db.agentExecution.count({
      where: { agentId: params.id },
    });

    return NextResponse.json({
      executions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to get history" },
      { status: 500 }
    );
  }
}
