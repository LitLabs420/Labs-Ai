"use client";

import React, { useState } from "react";

export default function LiveDemo() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    setReply(null);
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setError("Please enter a short description (3+ characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Demo request failed");
      } else {
        setReply(data.reply);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm">
      <p className="mb-2 text-xs text-slate-400">Try a quick demo — no signup required (rate-limited).</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="E.g. I'm a lash tech in Austin and I want more 6-figure clients"
        className="w-full mb-2 rounded-md bg-slate-950 p-2 text-xs text-slate-100 outline-none"
        rows={3}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={send}
          disabled={loading}
          className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Thinking…" : "Run Demo"}
        </button>
        <button
          onClick={() => { setMessage(""); setReply(null); setError(null); }}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
        >
          Clear
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      {reply && (
        <div className="mt-3 rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
          <pre className="whitespace-pre-wrap">{reply}</pre>
        </div>
      )}
    </div>
  );
}
