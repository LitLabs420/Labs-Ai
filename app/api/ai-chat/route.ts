import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;
const SYSTEM_PROMPT = process.env.LITLABS_MASTER_SYSTEM_PROMPT || "";

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_AI_STUDIO_API_KEY" },
        { status: 500 }
      );
    }

    const { command, userMessage } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "Missing command parameter" },
        { status: 400 }
      );
    }

    const prompt = `
You are LitLabs AI, a professional marketing assistant for beauty professionals (hair stylists, lash artists, nail techs, etc.).

System Instructions:
${SYSTEM_PROMPT}

User Command: ${command}

${userMessage ? `Additional Context: ${userMessage}` : ""}

Respond with practical, actionable content that the user can copy-paste directly into Instagram, TikTok, or messaging apps. Be specific, include relevant emojis, and always add a clear call-to-action.`;

    // Call Google's Generative AI API (Gemini)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const json = await res.json();

    if (json.error) {
      return NextResponse.json(
        { error: `Google AI Error: ${json.error.message}` },
        { status: 500 }
      );
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "LitLabs AI could not generate a response. Please try again.";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    return NextResponse.json(
      { error: err.message || "Error calling LitLabs AI" },
      { status: 500 }
    );
  }
}
