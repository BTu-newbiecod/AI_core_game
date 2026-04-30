import { useRef, useEffect } from "react";

const lineColor = (log) => {
  if (log.startsWith("❌")) return "text-red-400";
  if (log.startsWith("[REVEAL]")) return "text-emerald-400";
  if (log.startsWith("[FLAG]")) return "text-yellow-300";
  if (log.startsWith("New game")) return "text-sky-400";
  return "text-slate-300";
};

export default function AiControlPanel({ onAiPlay, logs, disabled, isThinking }) {
  const logEndRef = useRef(null);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs, isThinking]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="rounded-t-2xl px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-extrabold text-white text-base tracking-wide">AI Agent</span>
        <span className="ml-auto text-white/60 text-xs">{logs.length} events</span>
      </div>

      {/* Play button */}
      <button
        onClick={onAiPlay}
        disabled={disabled}
        className="mx-0 py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all
                   bg-gradient-to-r from-violet-500 to-indigo-500
                   hover:from-violet-400 hover:to-indigo-400
                   disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                   text-white flex items-center justify-center gap-2"
      >
        ▶ Play AI Move
      </button>

      {/* Console */}
      <div className="h-[280px] overflow-y-auto bg-[#0d1117] border border-[#30363d] rounded-xl p-3 font-mono text-[11px] flex flex-col gap-0.5">
        <p className="text-emerald-400 font-bold mb-1 border-b border-[#30363d] pb-1 text-xs">
          ● Console
        </p>
        {logs.length === 0 && !isThinking && (
          <p className="text-gray-600 italic">Waiting for AI input…</p>
        )}
        {logs.map((log, i) => (
          <p key={i} className={`leading-relaxed ${lineColor(log)}`}>
            <span className="text-gray-600 mr-1 select-none">{String(i + 1).padStart(2, "0")}│</span>
            {log}
          </p>
        ))}
        {isThinking && (
          <p className="text-gray-500 italic flex items-center">
            AI is thinking
            <span className="flex ml-0.5 tracking-widest">
              <span className="animate-pulse" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "300ms" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "600ms" }}>.</span>
            </span>
          </p>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
