import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const db = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") || "24h";

    // Calculate time window
    const now = new Date();
    const timeWindow = getTimeWindow(period, now);

    // Get agent metrics
    const agentStats = await db.agent.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        type: true,
        totalExecutions: true,
        successCount: true,
        failureCount: true,
        averageLatencyMs: true,
      },
    });

    // Get execution metrics for period
    const executionMetrics = await db.agentExecution.groupBy({
      by: ["agentId", "status"],
      where: {
        createdAt: {
          gte: timeWindow,
        },
      },
      _count: true,
      _avg: {
        durationMs: true,
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        costUsd: true,
      },
    });

    // Get top metrics
    const topMetrics = await db.agentMetric.findMany({
      where: {
        timestamp: {
          gte: timeWindow,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      distinct: ["metric"],
      take: 20,
    });

    return NextResponse.json({
      period,
      timeWindow,
      agentStats,
      executionMetrics,
      topMetrics,
      summary: {
        totalAgents: agentStats.length,
        totalExecutions: agentStats.reduce((sum, a) => sum + a.totalExecutions, 0),
        successRate:
          agentStats.reduce((sum, a) => sum + a.successCount, 0) /
          agentStats.reduce((sum, a) => sum + a.totalExecutions, 0) || 0,
        averageLatency:
          agentStats.reduce((sum, a) => sum + a.averageLatencyMs, 0) /
          agentStats.length || 0,
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);
    return NextResponse.json(
      { error: "Failed to get metrics" },
      { status: 500 }
    );
  }
}

function getTimeWindow(period: string, now: Date): Date {
  const windows: { [key: string]: number } = {
    "1h": 3600000,
    "24h": 86400000,
    "7d": 604800000,
    "30d": 2592000000,
  };

  const ms = windows[period] || windows["24h"];
  return new Date(now.getTime() - ms);
}
