import Cell from "./Cell";

export default function Board({ grid, onCellClick, onCellRightClick, animatedMines, animatedWrongFlags, cellSize }) {
  if (!grid || grid.length === 0) return null;
  const cols = grid[0].length;

  return (
    <div
      className="inline-grid border-4 border-[#7ab520] rounded-lg shadow-xl"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
    >
      {grid.map((row, r) =>
        row.map((value, c) => {
          const key = `${r}-${c}`;
          return (
            <Cell
              key={key}
              row={r} col={c}
              value={value}
              onClick={onCellClick}
              onRightClick={onCellRightClick}
              isNewMine={animatedMines?.has(key)}
              isNewWrongFlag={animatedWrongFlags?.has(key)}
              cellSize={cellSize}
            />
          );
        })
      )}
    </div>
  );
}
