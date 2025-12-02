import { NextResponse } from "next/server";

// Very small in-memory rate limiter for demo purposes.
// Note: in serverless environments this is per-instance and not global.
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_PER_WINDOW = 5;
const ipMap = new Map<string, { count: number; start: number }>();

export async function POST(req: Request) {
  try {
    // Gate demo: require explicit enable via env or a secret demo token header.
    // To enable publicly set `NEXT_PUBLIC_ENABLE_DEMO=true` in your deployment.
    // For limited access, set a server env `DEMO_TOKEN` and provide it in
    // the request header `x-demo-token`.
    const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";
    const demoToken = process.env.DEMO_TOKEN;
    const reqToken = req.headers.get("x-demo-token");

    if (!demoEnabled && (!demoToken || reqToken !== demoToken)) {
      return NextResponse.json({ error: "Demo is disabled" }, { status: 403 });
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    const now = Date.now();
    const entry = ipMap.get(ip);
    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
      ipMap.set(ip, { count: 1, start: now });
    } else {
      if (entry.count >= MAX_PER_WINDOW) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
      entry.count++;
      ipMap.set(ip, entry);
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 500) : "";

    if (!message || message.length < 3) {
      return NextResponse.json({ error: "Please provide a short description (3+ chars)." }, { status: 400 });
    }

    // Sanitize: remove tags and collapse whitespace
    const safeMessage = message.replace(/<[^>]*>?/g, "").replace(/\s+/g, " ");

    // Demo-only canned response. Replace this with a real function call
    // to your AI backend or functions client if/when you wire secrets.
    const reply = `Demo reply: I heard: "${safeMessage}" — here are 3 quick ideas to help you book more clients this week:\n1) Post a before/after carousel with these caption prompts; 2) Send these 3 DM reply templates; 3) Run a 48-hr promo and use this CTA.`;

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
