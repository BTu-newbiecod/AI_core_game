const NUMBER_COLORS = {
  1: "text-blue-600",
  2: "text-green-700",
  3: "text-red-600",
  4: "text-purple-700",
  5: "text-red-900",
  6: "text-teal-600",
  7: "text-gray-800",
  8: "text-gray-400",
};

const getHiddenBg   = (l) => l ? "bg-[#aad751] hover:bg-[#bce35f]" : "bg-[#a2d149] hover:bg-[#b2d950]";
const getRevealedBg = (l) => l ? "bg-[#e5c29f]" : "bg-[#d7b899]";
const getMineBg     = (l) => l ? "bg-[#e07070]" : "bg-[#d45f5f]";

export default function Cell({ row, col, value, onClick, onRightClick, isNewMine, isNewWrongFlag, cellSize }) {
  const isLight     = (row + col) % 2 === 0;
  const isMine      = value === -3;
  const isWrongFlag = value === -4;
  const isFlagged   = value === -2;
  const isHidden    = value === -1;
  const isRevealed  = value >= 0;

  const handleRightClick = (e) => { e.preventDefault(); onRightClick(row, col); };

  const bgClasses = isMine || isWrongFlag
    ? getMineBg(isLight)
    : isRevealed
      ? getRevealedBg(isLight)
      : getHiddenBg(isLight);

  const fontSize = cellSize >= 32 ? "text-sm" : cellSize >= 26 ? "text-xs" : "text-[10px]";

  const renderContent = () => {
    if (isMine)       return <span className={`leading-none ${isNewMine      ? "mine-pop"  : ""}`}>💣</span>;
    if (isWrongFlag)  return <span className={`leading-none ${isNewWrongFlag ? "flag-drop" : ""}`}>❌</span>;
    if (isFlagged)    return <span>🚩</span>;
    if (isHidden || value === 0) return null;
    return <span className={`font-bold ${fontSize} ${NUMBER_COLORS[value] ?? "text-gray-800"}`}>{value}</span>;
  };

  return (
    <div
      className={`flex items-center justify-center cursor-pointer select-none overflow-hidden ${bgClasses}`}
      style={{ width: cellSize, height: cellSize }}
      onClick={() => onClick(row, col)}
      onContextMenu={handleRightClick}
    >
      {renderContent()}
    </div>
  );
}
