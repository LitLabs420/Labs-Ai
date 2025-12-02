import { NextRequest, NextResponse } from "next/server";
import { generateMoneyPlay } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userNiche, recentBookings, userRevenue } = await req.json();

    if (!userNiche) {
      return NextResponse.json(
        { error: "Missing required field: userNiche" },
        { status: 400 }
      );
    }

    const moneyPlay = await generateMoneyPlay(
      userNiche,
      recentBookings || 0,
      userRevenue || 0
    );

    return NextResponse.json(moneyPlay);
  } catch (error) {
    console.error("Money play generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate money play" },
      { status: 500 }
    );
  }
}
