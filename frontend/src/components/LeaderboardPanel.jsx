import { useState, useEffect } from "react";

const LEADERBOARD_BASE_URL = "http://localhost:8080/api/leaderboard";
const RANK_MEDALS = ["🥇", "🥈", "🥉", "4", "5"];

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s % 60}s`;
};

export default function LeaderboardPanel({ difficulty, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!difficulty) return;
    setLoading(true); setError(null);
    fetch(`${LEADERBOARD_BASE_URL}/${difficulty}`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => { setRecords(d.slice(0, 5)); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [difficulty, refreshKey]);

  const LEVEL_LABEL = { EASY: "Easy 🟢", MEDIUM: "Medium 🟡", HARD: "Hard 🔴" };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 flex items-center justify-between">
        <span className="font-extrabold text-white text-base tracking-wide">🏆 Leaderboard</span>
        <span className="text-white/80 text-xs font-semibold">{LEVEL_LABEL[difficulty]}</span>
      </div>

      {/* Body */}
      <div className="flex-1 bg-white rounded-b-2xl shadow-lg px-4 py-3 flex flex-col gap-2">
        {loading && (
          <p className="text-xs text-amber-400 font-semibold animate-pulse text-center py-2">Updating…</p>
        )}
        {error && (
          <p className="text-xs text-red-400 italic text-center py-2">Could not load.</p>
        )}
        {!loading && !error && records.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">No records yet!<br />Be the first 🚀</p>
        )}
        {records.map((rec, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm
              ${i === 0 ? "bg-yellow-50 border border-yellow-300" : "bg-gray-50"}`}
          >
            <span className="text-base w-6 text-center shrink-0">
              {i < 3 ? RANK_MEDALS[i] : <span className="text-gray-400 font-bold text-xs">{RANK_MEDALS[i]}.</span>}
            </span>
            <span className="font-semibold text-gray-700 truncate flex-1">{rec.playerName}</span>
            <span className={`font-bold tabular-nums shrink-0 ${i === 0 ? "text-amber-500" : "text-green-600"}`}>
              {formatTime(rec.durationSeconds)}
            </span>
          </div>
        ))}

        {/* Spacer to fill height */}
        <div className="flex-1" />
        <p className="text-center text-[10px] text-gray-300 font-medium">Top 5 fastest wins</p>
      </div>
    </div>
  );
}
