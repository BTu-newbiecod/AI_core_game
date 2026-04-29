package com.example.ai_core_game.domain;

public record GameConfig(int rows, int cols, int totalMines) {

    private static final String ERR_ROWS_INVALID = "Rows must be strictly positive";
    private static final String ERR_COLS_INVALID = "Columns must be strictly positive";
    private static final String ERR_MINES_NEGATIVE = "Total mines cannot be negative";
    private static final String ERR_MINES_EXCEED = "Total mines must be less than total cells";

    public GameConfig {
        if (rows <= 0) {
            throw new IllegalArgumentException(ERR_ROWS_INVALID);
        }
        if (cols <= 0) {
            throw new IllegalArgumentException(ERR_COLS_INVALID);
        }
        if (totalMines < 0) {
            throw new IllegalArgumentException(ERR_MINES_NEGATIVE);
        }
        if (totalMines >= rows * cols) {
            throw new IllegalArgumentException(ERR_MINES_EXCEED);
        }
    }
}
