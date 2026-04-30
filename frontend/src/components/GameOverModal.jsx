import { useState } from "react";

const LEADERBOARD_SUBMIT_URL = (gameId) =>
  `http://localhost:8080/api/leaderboard/${gameId}`;

const formatTimer = (s) => {
  if (s == null) return "--:--";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
};


export default function GameOverModal({
  gameState, isAiUsed, gameId, difficulty,
  timeElapsed, bestTime,
  onRestart, onScoreSubmitted,
}) {
  const [playerName, setPlayerName] = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState(null);
  const [saving,     setSaving]     = useState(false);

  if (gameState === "IN_PROGRESS") return null;

  const isWon          = gameState === "WON";
  const canSave        = isWon && !isAiUsed;

  const handleConfirm = async () => {
    const name = playerName.trim();
    if (!name) return;

    if (canSave) {
      setSaving(true);
      try {
        const url = `${LEADERBOARD_SUBMIT_URL(gameId)}?playerName=${encodeURIComponent(name)}&difficulty=${difficulty}`;
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        onScoreSubmitted?.();
      } catch (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center z-50 bg-black/50">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl shadow-2xl">

        {/* ── Stats panel ─────────────────────────────── */}
        <div className={`relative px-8 pt-8 pb-14 flex justify-around items-start
          ${isWon ? "bg-sky-400" : "bg-slate-500"}`}>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-yellow-400 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl">⏱️</div>
            <div className="w-20 h-[2px] bg-white/50 rounded" />
            <span className="text-white font-bold text-xl tabular-nums tracking-wider">{formatTimer(timeElapsed)}</span>
            <span className="text-white/70 text-xs">Your time</span>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-5xl select-none">
            {isWon ? "⭐" : "💣"}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-yellow-400 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl">🏆</div>
            <div className="w-20 h-[2px] bg-white/50 rounded" />
            <span className="text-white font-bold text-xl tabular-nums tracking-wider">{bestTime != null ? formatTimer(bestTime) : "--:--"}</span>
            <span className="text-white/70 text-xs">Best time</span>
          </div>
        </div>

        {/* ── Grass divider ───────────────────────────── */}
        <div className="bg-green-600 h-5" />

        {/* ── White bottom sheet ──────────────────────── */}
        <div className="bg-white px-6 py-5 flex flex-col items-center gap-4">

          {!submitted ? (
            <div className="w-full flex flex-col gap-3">
              {/* Context message */}
              {isWon && isAiUsed && (
                <p className="text-amber-600 text-xs text-center bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  🤖 AI was used — score will not be saved to the leaderboard.
                </p>
              )}
              <p className="text-gray-600 text-sm text-center font-medium">
                {isWon ? "🎉 You won! Enter your name:" : "😅 Enter your name to continue:"}
              </p>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="Your name..."
                maxLength={30}
                autoFocus
                className="w-full border-2 border-[#aad751] rounded-lg px-3 py-2 text-sm
                           outline-none focus:border-[#3a5a00] transition-colors"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                onClick={handleConfirm}
                disabled={!playerName.trim() || saving}
                className="w-full bg-[#aad751] hover:bg-[#b8df60] disabled:bg-gray-200
                           disabled:text-gray-400 text-[#3a5a00] font-bold py-2.5 rounded-xl
                           transition-colors border-2 border-[#8eb228] disabled:border-gray-300 text-sm"
              >
                {saving ? "Saving…" : canSave ? "💾 Save Record" : "✅ Continue"}
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-600">
              {!isWon && <>💥 Better luck next time, <span className="font-semibold">{playerName}</span>!</>}
              {isWon && isAiUsed && <>🎉 Well played, <span className="font-semibold">{playerName}</span>! (AI assisted — not recorded)</>}
              {isWon && !isAiUsed && <span className="font-semibold text-[#3a5a00]">🏆 Saved! Great job, {playerName}!</span>}
            </p>
          )}

          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700
                       text-white font-bold rounded-2xl shadow-lg transition-all text-sm w-full justify-center"
          >
            <span className="text-lg">↺</span> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
