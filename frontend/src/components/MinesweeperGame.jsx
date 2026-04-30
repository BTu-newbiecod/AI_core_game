import { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";
import AiControlPanel from "./AiControlPanel";
import GameOverModal from "./GameOverModal";
import LeaderboardPanel from "./LeaderboardPanel";

const API_BASE_URL = "http://localhost:8080/api/games";
const LEADERBOARD_URL = (d) => `http://localhost:8080/api/leaderboard/${d}`;

const CELL_SIZE = { EASY: 36, MEDIUM: 28, HARD: 22 };

const DIFFICULTY_META = {
  EASY: { rows: 9, cols: 9, mines: 10, label: "Easy", color: "bg-emerald-500" },
  MEDIUM: { rows: 16, cols: 16, mines: 40, label: "Medium", color: "bg-amber-500" },
  HARD: { rows: 16, cols: 30, mines: 99, label: "Hard", color: "bg-red-500" },
};

const EMPTY_GRID = ({ rows, cols }) =>
  Array.from({ length: rows }, () => Array(cols).fill(-1));

const sounds = {
  reveal: new Audio("/sounds/reveal.mp3"),
  flag: new Audio("/sounds/flag.mp3"),
  lose: new Audio("/sounds/lose.mp3"),
  win: new Audio("/sounds/win.mp3"),
};
const playSound = (s) => { s.currentTime = 0; s.play().catch(() => { }); };

const postJson = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

const formatAiLog = ({ actionTaken, row, col, confidence, reasoning }) =>
  `[${actionTaken}] at (${row},${col}) Conf:${(confidence * 100).toFixed(0)}% — ${reasoning}`;

const formatTimer = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
};

const EXPLOSION_MS = 90;

export default function MinesweeperGame() {
  const [board, setBoard] = useState(() => EMPTY_GRID(DIFFICULTY_META.EASY));
  const [gameId, setGameId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [gameState, setGameState] = useState("IN_PROGRESS");
  const [isAiUsed, setIsAiUsed] = useState(false);
  const [difficulty, setDifficulty] = useState("EASY");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [animatedMines, setAnimatedMines] = useState(new Set());
  const [animatedWrongFlags, setAnimatedWrongFlags] = useState(new Set());

  const explosionTimers = useRef([]);

  const appendLog = (m) => setLogs((p) => [...p, m]);
  const appendError = (m) => appendLog(`❌ ERROR: ${m}`);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "IN_PROGRESS") return;
    const id = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameState]);

  // ── SFX ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === "LOST") playSound(sounds.lose);
    if (gameState === "WON") playSound(sounds.win);
  }, [gameState]);

  // ── Fetch best time when game ends ────────────────────────────────────────
  useEffect(() => {
    if (gameState === "IN_PROGRESS") return;
    fetch(LEADERBOARD_URL(difficulty))
      .then((r) => r.ok ? r.json() : [])
      .then((recs) => { if (recs.length > 0) setBestTime(recs[0].durationSeconds); })
      .catch(() => { });
  }, [gameState, difficulty]);

  // ── Explosion animation ───────────────────────────────────────────────────
  const runExplosion = useCallback((finalBoard) => {
    const mines = [];
    const wrongFlags = [];

    finalBoard.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val === -3) mines.push(`${r}-${c}`);
        if (val === -4) wrongFlags.push(`${r}-${c}`);
      })
    );

    mines.sort(() => Math.random() - 0.5);

    if (wrongFlags.length > 0) {
      setBoard((prev) => prev.map((row, r) => row.map((v, c) => finalBoard[r][c] === -4 ? -4 : v)));
      setAnimatedWrongFlags(new Set(wrongFlags));
    }

    mines.forEach((key, i) => {
      const t = setTimeout(() => {
        setBoard((prev) => {
          const [r, c] = key.split("-").map(Number);
          const next = prev.map((row) => [...row]);
          next[r][c] = -3;
          return next;
        });
        setAnimatedMines((prev) => new Set([...prev, key]));
      }, i * EXPLOSION_MS);
      explosionTimers.current.push(t);
    });
  }, []);

  // ── Apply board response ──────────────────────────────────────────────────
  const applyResponse = useCallback((data, nested) => {
    const snap = nested ? data.board : data;
    const finalBoard = snap.board;
    const newState = snap.gameState;

    if (newState === "LOST") {
      runExplosion(finalBoard);
    } else {
      setBoard(finalBoard);
    }
    setGameState(newState);
  }, [runExplosion]);

  // ── Start / Restart ───────────────────────────────────────────────────────
  const startGame = useCallback(async (level) => {
    const lv = level ?? difficulty;
    explosionTimers.current.forEach(clearTimeout);
    explosionTimers.current = [];
    setAnimatedMines(new Set());
    setAnimatedWrongFlags(new Set());

    try {
      const data = await postJson(`${API_BASE_URL}?difficulty=${lv}`);
      setGameId(data.gameId);
      setBoard(EMPTY_GRID(DIFFICULTY_META[lv]));
      setGameState("IN_PROGRESS");
      setIsAiUsed(false);
      setTimeElapsed(0);
      setBestTime(null);
      setLogs(["New game started — click a cell to begin!"]);
    } catch (err) {
      appendError(`Failed to start game — ${err.message}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => { startGame(); }, []); // eslint-disable-line

  const handleDifficultyChange = (lv) => {
    setDifficulty(lv);
    startGame(lv);
  };

  // ── Player moves ─────────────────────────────────────────────────────────
  const handleCellClick = async (r, c) => {
    if (!gameId || gameState !== "IN_PROGRESS") return;
    try {
      playSound(sounds.reveal);
      applyResponse(await postJson(`${API_BASE_URL}/${gameId}/manual-move`, { action: "REVEAL", row: r, col: c }), false);
    } catch (err) { appendError(`Reveal failed — ${err.message}`); }
  };

  const handleCellRightClick = async (r, c) => {
    if (!gameId || gameState !== "IN_PROGRESS") return;
    try {
      playSound(sounds.flag);
      applyResponse(await postJson(`${API_BASE_URL}/${gameId}/manual-move`, { action: "FLAG", row: r, col: c }), false);
    } catch {
    }
  };

  const handleAiMove = async () => {
    if (!gameId || gameState !== "IN_PROGRESS") { appendError("No active game."); return; }
    try {
      const res = await postJson(`${API_BASE_URL}/${gameId}/ai-move`);
      setIsAiUsed(true);
      applyResponse(res, true);
      appendLog(formatAiLog(res));
    } catch (err) { appendError(`AI move failed — ${err.message}`); }
  };

  const meta = DIFFICULTY_META[difficulty];
  const cellSize = CELL_SIZE[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-100 via-green-50 to-emerald-100 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-green-200 px-6 py-3 flex items-center gap-3 shadow-sm">
        <span className="text-2xl">🌿</span>
        <span className="font-extrabold text-xl text-[#2d5a00] tracking-tight">Minesweeper AI</span>
        <span className="ml-auto text-xs text-gray-400">{meta.rows}×{meta.cols} · {meta.mines} mines</span>
      </header>

      {/* ── Main 3-column layout ─────────────────────────────────────────── */}
      <main className="flex flex-1 gap-4 p-4 items-stretch justify-center overflow-hidden">

        {/* LEFT — Leaderboard */}
        <aside className="w-56 shrink-0 hidden lg:flex flex-col">
          <LeaderboardPanel difficulty={difficulty} refreshKey={leaderboardKey} />
        </aside>

        {/* CENTER — Controls + Board */}
        <section className="flex flex-col items-center gap-3 min-w-0">

          {/* Difficulty + Timer pill bar */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Difficulty buttons */}
            <div className="flex rounded-xl overflow-hidden border-2 border-[#8eb228] shadow-sm bg-[#aad751]">
              {Object.entries(DIFFICULTY_META).map(([lv, m]) => (
                <button
                  key={lv}
                  onClick={() => handleDifficultyChange(lv)}
                  className={`px-4 py-2 text-sm font-bold transition-colors duration-150
                    ${difficulty === lv
                      ? "bg-[#2d5a00] text-white"
                      : "text-[#2d5a00] hover:bg-[#c4e96c]"}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow border border-green-200">
              <span>⏱️</span>
              <span className="font-extrabold text-[#2d5a00] text-lg tabular-nums tracking-widest">
                {formatTimer(timeElapsed)}
              </span>
            </div>
          </div>

          {/* Board — horizontally scrollable if too wide */}
          <div className="overflow-x-auto max-w-full">
            <Board
              grid={board}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              animatedMines={animatedMines}
              animatedWrongFlags={animatedWrongFlags}
              cellSize={cellSize}
            />
          </div>

          <p className="text-xs text-gray-400">Left-click to reveal · Right-click to flag</p>

          {/* Leaderboard — visible only on small screens (stacked below board) */}
          <div className="lg:hidden w-full max-w-sm">
            <LeaderboardPanel difficulty={difficulty} refreshKey={leaderboardKey} />
          </div>
        </section>

        {/* RIGHT — AI Panel */}
        <aside className="w-64 shrink-0 flex flex-col">
          <AiControlPanel
            onAiPlay={handleAiMove}
            logs={logs}
            disabled={gameState !== "IN_PROGRESS"}
          />
        </aside>
      </main>

      {/* ── Game Over Modal ───────────────────────────────────────────────── */}
      <GameOverModal
        key={gameId}
        gameState={gameState}
        isAiUsed={isAiUsed}
        gameId={gameId}
        difficulty={difficulty}
        timeElapsed={timeElapsed}
        bestTime={bestTime}
        onRestart={() => startGame()}
        onScoreSubmitted={() => setLeaderboardKey((k) => k + 1)}
      />
    </div>
  );
}
