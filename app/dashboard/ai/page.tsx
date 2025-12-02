"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type ContentType = "instagram_caption" | "tiktok_script" | "email" | "dm_opener" | "money_play";

export default function AIActionsPage() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<"generator" | "dm" | "money">("generator");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState("");

  // CONTENT GENERATOR
  const [formData, setFormData] = useState({
    contentType: "instagram_caption" as ContentType,
    description: "",
    tone: "casual" as "casual" | "professional" | "funny" | "urgent",
  });

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: userData?.subscription?.plan || "barber",
          ...formData,
        }),
      });

      const data = await response.json();
      setGenerated(data.content);
    } catch (err) {
      console.error("Generation error:", err);
      setGenerated("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // DM REPLY
  const [dmInput, setDmInput] = useState("");
  const [dmReply, setDmReply] = useState("");

  const handleGenerateDMReply = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/dm-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incomingMessage: dmInput,
          userNiche: "barber",
          userContext: "",
        }),
      });

      const data = await response.json();
      setDmReply(data.reply);
    } catch (err) {
      console.error("DM reply error:", err);
      setDmReply("Failed to generate reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // MONEY PLAY
  const [moneyPlay, setMoneyPlay] = useState<Record<string, unknown> | null>(null);

  const handleGenerateMoneyPlay = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/money-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userNiche: "barber",
          recentBookings: 5,
          userRevenue: 5000,
        }),
      });

      const data = await response.json();
      setMoneyPlay(data);
    } catch (err) {
      console.error("Money play error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black mb-2">🤖 AI Actions Suite</h1>
          <p className="text-gray-400">
            Powered by Google Gemini. Generate content, reply to DMs, and create money plays instantly.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b border-white/10">
          {[
            { id: "generator" as const, label: "📝 Content Generator", icon: "✍️" },
            { id: "dm" as const, label: "💬 DM Smart Reply", icon: "📱" },
            { id: "money" as const, label: "💰 Money Plays", icon: "🎯" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-bold text-sm transition ${
                activeTab === tab.id
                  ? "border-b-2 border-[#ff006e] text-[#ff006e]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT GENERATOR TAB */}
        {activeTab === "generator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Content Type</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value as ContentType })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#ff006e]"
                >
                  <option value="instagram_caption">Instagram Caption</option>
                  <option value="tiktok_script">TikTok Script</option>
                  <option value="email">Email</option>
                  <option value="dm_opener">DM Opener</option>
                  <option value="money_play">Money Play</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#ff006e]"
                >
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Funny</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">What do you want to create?</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="E.g., A flash sale for haircuts this weekend, offer 25% off for first-time customers"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#ff006e] h-32 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateContent}
                disabled={loading || !formData.description}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "✨ Generating..." : "🚀 Generate Content"}
              </button>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-sm text-gray-400 mb-4">Generated Content:</p>
              {generated ? (
                <div className="space-y-3">
                  <p className="text-white leading-relaxed">{generated}</p>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(generated)}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#ff006e]/20 text-[#ff006e] font-bold hover:bg-[#ff006e]/30 transition text-sm"
                    >
                      📋 Copy
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition text-sm">
                      👍 Perfect
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition text-sm">
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Generated content will appear here...</p>
              )}
            </div>
          </div>
        )}

        {/* DM REPLY TAB */}
        {activeTab === "dm" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Incoming DM</label>
                <textarea
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  placeholder="Paste the DM message you received..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#ff006e] h-32 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateDMReply}
                disabled={loading || !dmInput}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "⏳ Generating Reply..." : "💬 Generate Reply"}
              </button>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-sm text-gray-400 mb-4">AI-Generated Reply:</p>
              {dmReply ? (
                <div className="space-y-3">
                  <p className="text-white leading-relaxed">{dmReply}</p>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(dmReply)}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#ff006e]/20 text-[#ff006e] font-bold hover:bg-[#ff006e]/30 transition text-sm"
                    >
                      📋 Copy
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition text-sm">
                      ✅ Send
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">AI reply will appear here...</p>
              )}
            </div>
          </div>
        )}

        {/* MONEY PLAY TAB */}
        {activeTab === "money" && (
          <div className="space-y-6">
            <button
              onClick={handleGenerateMoneyPlay}
              disabled={loading}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-black hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
            >
              {loading ? "⏳ Generating Money Play..." : "💰 Generate Today's Money Play"}
            </button>

            {moneyPlay && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">TODAY'S OFFER</p>
                  <p className="text-2xl font-black text-[#ff006e] mb-4">{moneyPlay.offer}</p>
                  <button className="w-full px-4 py-2 rounded-lg bg-[#ff006e]/20 text-[#ff006e] font-bold hover:bg-[#ff006e]/30 transition">
                    📋 Copy Offer
                  </button>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">SALES SCRIPT</p>
                  <p className="text-white leading-relaxed mb-4">{moneyPlay.script}</p>
                  <button className="w-full px-4 py-2 rounded-lg bg-[#ff006e]/20 text-[#ff006e] font-bold hover:bg-[#ff006e]/30 transition">
                    📋 Copy Script
                  </button>
                </div>

                <div className="md:col-span-2 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">ESTIMATED REVENUE LIFT</p>
                  <p className="text-4xl font-black text-green-400">+{moneyPlay.estimatedLift}%</p>
                  <p className="text-gray-400 mt-2">Based on similar offers to your niche</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BACK LINK */}
        <div className="text-center border-t border-white/10 pt-8">
          <Link href="/dashboard" className="text-[#ff006e] hover:text-[#ff006e]/80">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
