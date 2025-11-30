import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { timeframe, plan } = await req.json();

    if (!timeframe || !plan || plan === "free") {
      return NextResponse.json(
        { error: "Invalid timeframe or plan" },
        { status: 400 }
      );
    }

    // Placeholder: Later connect to Cloud Function generateFuturePlan
    const futurePlan = {
      timeframe,
      plan,
      milestones: [
        {
          week: 1,
          goal: "Set baseline metrics",
          actions: ["Audit current content", "Define KPIs"],
        },
        {
          week: 2,
          goal: "Launch first content series",
          actions: ["Create content calendar", "Post 3x/week"],
        },
      ],
    };

    return NextResponse.json({ success: true, data: futurePlan });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
