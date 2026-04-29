package com.example.ai_core_game.domain;

public enum DifficultyLevel {
    EASY(9, 9, 10),
    MEDIUM(16, 16, 40),
    HARD(16, 30, 99);

    private final int rows;
    private final int cols;
    private final int totalMines;

    private DifficultyLevel(int rows, int cols, int totalMines) {
        this.rows = rows;
        this.cols = cols;
        this.totalMines = totalMines;
    }

    public GameConfig toConfig() {
        return new GameConfig(rows, cols, totalMines);
    }
}
