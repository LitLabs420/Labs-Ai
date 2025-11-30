"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Calendar, MapPin, Zap } from "lucide-react";

type Props = {
  plan?: "free" | "growth" | "godmode";
};

export function FutureBuilderCard({ plan = "free" }: Props) {
  const [timeframe, setTimeframe] = useState<"30" | "60" | "90">("30");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!plan || plan === "free") {
      alert("Upgrade to Growth or Godmode to generate future plans");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate-future-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeframe: parseInt(timeframe),
          plan,
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Future plan generated:", data);
      } else {
        alert(data.error || "Failed to generate plan");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const isLocked = !plan || plan === "free";

  return (
    <Card
      className={`relative ${
        isLocked ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs text-yellow-400 font-semibold">Godmode Only</p>
            <p className="text-[11px] text-gray-300 mt-1">
              Unlock future planning
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-pink-400 flex items-center gap-1 mb-1">
            <MapPin size={13} /> Future Builder
          </p>
          <h2 className="text-sm font-semibold">Your 30/60/90 plan</h2>
        </div>
        <Zap size={16} className="text-yellow-400" />
      </div>

      <p className="text-[11px] text-gray-300 mb-3">
        Get AI-generated milestones and strategies for the next 30, 60, or 90
        days.
      </p>

      <div className="flex gap-2 mb-3">
        {(["30", "60", "90"] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            disabled={loading}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
              timeframe === tf
                ? "bg-pink-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            } disabled:opacity-50`}
          >
            <Calendar size={12} className="inline mr-1" />
            {tf}d
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || isLocked}
        className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 transition"
      >
        {loading ? "Generating..." : `Generate ${timeframe}-Day Plan`}
      </button>
    </Card>
  );
}
