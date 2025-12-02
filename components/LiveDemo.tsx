"use client";

import React, { useState } from "react";

export default function LiveDemo() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string>("");
  const [requestsLeft, setRequestsLeft] = useState<number | null>(null);

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
      const headers: Record<string,string> = { "Content-Type": "application/json" };
      if (demoToken && demoToken.length > 0) headers["x-demo-token"] = demoToken;

      const res = await fetch("/api/demo", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      // Show remaining requests if provided by server (optional)
      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining) {
        const num = parseInt(remaining, 10);
        if (!Number.isNaN(num)) setRequestsLeft(num);
      }
      // Handle Retry-After header
      if (res.status === 429) {
        const ra = res.headers.get("Retry-After");
        const secs = ra ? `${ra}s` : "soon";
        setError(`Rate limit exceeded. Try again in ${secs}.`);
        return;
      }
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

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div>
          <label className="text-[11px] text-slate-400">Demo token (optional)</label>
          <input
            value={demoToken}
            onChange={(e) => setDemoToken(e.target.value)}
            placeholder="x-demo-token (if demo is restricted)"
            className="w-full mt-1 rounded-md bg-slate-950 p-2 text-xs text-slate-100 outline-none"
          />
        </div>
        <div className="text-right text-[11px] text-slate-400">
          {requestsLeft !== null ? `Requests left: ${requestsLeft}` : ""}
        </div>
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
