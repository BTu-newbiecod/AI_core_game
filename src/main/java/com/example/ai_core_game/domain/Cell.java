package com.example.ai_core_game.domain;

public class Cell {

    private static final String ERR_REVEAL_FLAGGED = "Cannot reveal a flagged cell";
    private static final String ERR_FLAG_REVEALED = "Cannot flag a revealed cell";

    private final int row;
    private final int col;
    private boolean isMine;
    private int adjacentMines; //so min xung quanh
    private CellState state;

    public Cell(int row, int col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.adjacentMines = 0;
        this.state = CellState.HIDDEN;
    }

    public void reveal() {
        if (this.state == CellState.FLAGGED) {
            throw new IllegalStateException(ERR_REVEAL_FLAGGED);
        }
        this.state = CellState.REVEALED;
    }

    public void toggleFlag() {
        if (this.state == CellState.REVEALED) {
            throw new IllegalStateException(ERR_FLAG_REVEALED);
        }
        this.state = (this.state == CellState.HIDDEN) ? CellState.FLAGGED : CellState.HIDDEN;
    }

    public void placeMine() {
        this.isMine = true;
    }

    public void incrementAdjacentMines() {
        this.adjacentMines++;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    public boolean isMine() {
        return isMine;
    }

    public int getAdjacentMines() {
        return adjacentMines;
    }

    public CellState getState() {
        return state;
    }
}
