package com.example.ai_core_game.domain;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

public class GameEngine {

    private static final String ERR_NOT_IN_PROGRESS = "Game is not in progress";

    private final Board board;
    private final GameConfig config;
    private GameState state;
    private int revealedSafeCellsCount;
    private boolean isFirstClick;

    public GameEngine(GameConfig config) {
        this.config = config;
        this.board = new Board(config);
        this.state = GameState.IN_PROGRESS;
        this.revealedSafeCellsCount = 0;
        this.isFirstClick = true;
    }

    public void flag(int r, int c) {
        verifyInProgress();
        Cell cell = board.getCell(r, c);
        cell.toggleFlag();
    }

    public void reveal(int r, int c) {
        verifyInProgress();

        if (isFirstClick) {
            board.initializeBoard(r, c);
            isFirstClick = false;
        }

        Cell cell = board.getCell(r, c);

        if (cell.getState() == CellState.REVEALED || cell.getState() == CellState.FLAGGED) {
            return;
        }

        if (cell.isMine()) {
            cell.reveal();
            state = GameState.LOST;
            return;
        }

        floodFillReveal(cell);
        checkWinCondition();
    }

    private void floodFillReveal(Cell startCell) {
        Queue<Cell> queue = new LinkedList<>();
        Set<Cell> queued = new HashSet<>();

        queue.add(startCell);
        queued.add(startCell);

        while (!queue.isEmpty()) {
            Cell current = queue.poll();

            if (current.getState() == CellState.HIDDEN) {
                current.reveal();
                revealedSafeCellsCount++;
            }

            if (current.getAdjacentMines() == 0) {
                enqueueHiddenNeighbors(current, queue, queued);
            }
        }
    }

    private void enqueueHiddenNeighbors(Cell current, Queue<Cell> queue, Set<Cell> queued) {
        for (Cell neighbor : board.getNeighbors(current.getRow(), current.getCol())) {
            if (neighbor.getState() == CellState.HIDDEN && !queued.contains(neighbor)) {
                queue.add(neighbor);
                queued.add(neighbor);
            }
        }
    }

    private void checkWinCondition() {
        int safeCellsTotal = config.rows() * config.cols() - config.totalMines();
        if (revealedSafeCellsCount == safeCellsTotal) {
            state = GameState.WON;
        }
    }

    private void verifyInProgress() {
        if (state != GameState.IN_PROGRESS) {
            throw new IllegalStateException(ERR_NOT_IN_PROGRESS);
        }
    }

    public GameState getState() {
        return state;
    }

    public Board getBoard() {
        return board;
    }

    public int getRevealedSafeCellsCount() {
        return revealedSafeCellsCount;
    }
}
