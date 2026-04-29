package com.example.ai_core_game.domain;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Board {

    private static final String ERR_INVALID_COORD = "Coordinates are out of bounds";

    private final Cell[][] grid;
    private final GameConfig config;
    private final Random random;

    public Board(GameConfig config) {
        this.config = config;
        this.grid = new Cell[config.rows()][config.cols()];
        this.random = new SecureRandom();
        initializeGrid();
    }

    private void initializeGrid() {
        for (int r = 0; r < config.rows(); r++) {
            for (int c = 0; c < config.cols(); c++) {
                grid[r][c] = new Cell(r, c);
            }
        }
    }

    public boolean isValidCoordinate(int r, int c) {
        return r >= 0 && r < config.rows() && c >= 0 && c < config.cols();
    }

    public Cell getCell(int r, int c) {
        if (!isValidCoordinate(r, c)) {
            throw new IllegalArgumentException(ERR_INVALID_COORD);
        }
        return grid[r][c];
    }

    public List<Cell> getNeighbors(int r, int c) {
        List<Cell> neighbors = new ArrayList<>();
        for (int dr = -1; dr <= 1; dr++) {
            for (int dc = -1; dc <= 1; dc++) {
                if (dr == 0 && dc == 0) {
                    continue;
                }
                int neighborRow = r + dr;
                int neighborCol = c + dc;
                if (isValidCoordinate(neighborRow, neighborCol)) {
                    neighbors.add(grid[neighborRow][neighborCol]);
                }
            }
        }
        return neighbors;
    }

    public void initializeBoard(int safeRow, int safeCol) {
        placeMines(safeRow, safeCol);
        calculateNumbers();
    }

    private void placeMines(int safeRow, int safeCol) { //ham rai min
        int minesPlaced = 0;
        int totalMines = config.totalMines();
        int totalCells = config.rows() * config.cols();

        while (minesPlaced < totalMines) {
            int r = random.nextInt(config.rows());
            int c = random.nextInt(config.cols());

            boolean isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
            boolean isExactCell = (r == safeRow && c == safeCol);

            if (isSafeZone) {
                if (totalCells - 9 >= totalMines) {
                    continue;
                } else if (isExactCell) {
                    continue;
                }
            }

            Cell cell = grid[r][c];
            if (!cell.isMine()) {
                cell.placeMine();
                minesPlaced++;
            }
        }
    }

    private void calculateNumbers() {
        for (int r = 0; r < config.rows(); r++) {
            for (int c = 0; c < config.cols(); c++) {
                Cell cell = grid[r][c];
                if (cell.isMine()) {
                    incrementNeighborsMines(r, c);
                }
            }
        }
    }

    private void incrementNeighborsMines(int r, int c) {
        List<Cell> neighbors = getNeighbors(r, c);
        for (Cell neighbor : neighbors) {
            neighbor.incrementAdjacentMines();
        }
    }
}
