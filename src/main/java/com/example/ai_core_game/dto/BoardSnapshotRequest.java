package com.example.ai_core_game.dto;

import com.example.ai_core_game.domain.Board;
import com.example.ai_core_game.domain.Cell;
import com.example.ai_core_game.domain.CellState;
import com.example.ai_core_game.domain.GameState;

public record BoardSnapshotRequest(int rows, int cols, int[][] board, String gameState) {

    private static final int CELL_MINE          = -3;
    private static final int CELL_WRONG_FLAG    = -4;
    private static final int CELL_HIDDEN        = -1;
    private static final int CELL_FLAGGED       = -2;

    public static BoardSnapshotRequest from(Board domainBoard, int rows, int cols, GameState state) {
        int[][] grid = new int[rows][cols];
        boolean isGameLost = state == GameState.LOST;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                grid[r][c] = encodeCellValue(domainBoard.getCell(r, c), isGameLost);
            }
        }

        return new BoardSnapshotRequest(rows, cols, grid, state.name());
    }

    private static int encodeCellValue(Cell cell, boolean isGameLost) {
        if (cell.getState() == CellState.REVEALED) {
            return cell.isMine() ? CELL_MINE : cell.getAdjacentMines();
        }
        if (cell.getState() == CellState.FLAGGED) {
            return (isGameLost && !cell.isMine()) ? CELL_WRONG_FLAG : CELL_FLAGGED;
        }
        // HIDDEN
        return (isGameLost && cell.isMine()) ? CELL_MINE : CELL_HIDDEN;
    }
}
