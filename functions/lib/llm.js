/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMoneyTodayLLM = generateMoneyTodayLLM;
const functions = __importStar(require("firebase-functions"));
const openai_1 = __importDefault(require("openai"));
let openai = null;
function getOpenAI() {
    if (!openai) {
        openai = new openai_1.default({
            REDACTED_SECRET_Possible_password_env
        });
    }
    return openai;
}
async function generateMoneyTodayLLM(req) {
    const intensity = req.plan === "godmode"
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
    const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            {
                role: "system",
                content: "You are LitLabs OS, an execution-focused assistant. Always return valid JSON only. No markdown, no code blocks, just raw JSON.",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
    });
    const raw = completion.choices[0].message.content ?? "{}";
    try {
        const parsed = JSON.parse(raw);
        return parsed;
    }
    catch (err) {
        console.error("Failed to parse Money Today JSON:", err, raw);
        throw new functions.https.HttpsError("internal", "AI response could not be parsed.");
    }
}
//# sourceMappingURL=llm.js.map