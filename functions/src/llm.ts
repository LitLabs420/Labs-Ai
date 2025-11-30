import * as functions from "firebase-functions";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MoneyTodayRequest {
  businessType: string;
  idealClients: string;
  audienceSize: string;
  availabilityToday: string;
  promosRunning: string;
  plan: "free" | "growth" | "godmode";
}

export interface MoneyTodayAction {
  title: string;
  description: string;
  assetsNeeded: string[];
  scripts: {
    postCaption: string;
    dmText: string;
    storyScript: string;
  };
}

export interface MoneyTodayResponse {
  summary: string;
  todayPlan: MoneyTodayAction[];
}

export async function generateMoneyTodayLLM(
  req: MoneyTodayRequest
): Promise<MoneyTodayResponse> {
  const intensity =
    req.plan === "godmode"
      ? "3 bold, aggressive but realistic actions"
      : req.plan === "growth"
        ? "3 solid, realistic actions"
        : "2 simple actions that are easy to do";

  const prompt = `
You are LitLabs OS. The user wants: "Make me money TODAY."

User context:
- Business type: ${req.businessType}
- Ideal clients: ${req.idealClients}
- Current audience size: ${req.audienceSize}
- Availability today: ${req.availabilityToday}
- Existing promos: ${req.promosRunning}
- Plan level: ${req.plan}

Task:
Give them ${intensity} they can realistically do TODAY.

Each action should:
- Be specific and doable.
- Include a mini explanation of why it works.
- Provide ready-to-use scripts: a post caption, a DM text, and a story script.

Output JSON ONLY in this format:

{
  "summary": "1-2 sentences about the overall approach.",
  "todayPlan": [
    {
      "title": "Short title",
      "description": "What to do, step by step, in 2-4 sentences.",
      "assetsNeeded": ["content", "DM script", "story script"],
      "scripts": {
        "postCaption": "Instagram post caption.",
        "dmText": "DM text to send to leads/past clients.",
        "storyScript": "Story script they can speak or type on stories."
      }
    }
  ]
}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are LitLabs OS, an execution-focused assistant. Always return valid JSON only. No markdown, no code blocks, just raw JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = completion.choices[0].message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as MoneyTodayResponse;
    return parsed;
  } catch (err) {
    console.error("Failed to parse Money Today JSON:", err, raw);
    throw new functions.https.HttpsError(
      "internal",
      "AI response could not be parsed."
    );
  }
}
