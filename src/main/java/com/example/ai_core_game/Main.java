package com.example.ai_core_game;

import com.example.ai_core_game.domain.*;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        GameConfig config = DifficultyLevel.MEDIUM.toConfig(); //chon level
        GameEngine engine = new GameEngine(config);
        Scanner scanner = new Scanner(System.in);

        System.out.println("lenh: 'r <row> <col>' to reveal, 'f <row> <col>' to flag");

        while (engine.getState() == GameState.IN_PROGRESS) {
            printBoard(engine.getBoard(), config, false);
            System.out.print("Enter command: ");
            
            if (!scanner.hasNextLine()) {
                break;
            }
            
            String input = scanner.nextLine().trim();
            if (input.isEmpty()) {
                continue;
            }

            try {
                processInput(input, engine);
            } catch (IllegalArgumentException | IllegalStateException e) {
                System.out.println("Error: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("Invalid input format. Expected: <action> <row> <col>");
            }
        }

        printBoard(engine.getBoard(), config, true);
        if (engine.getState() == GameState.WON) {
            System.out.println("Congratulations! You WON!");
        } else if (engine.getState() == GameState.LOST) {
            System.out.println("Game Over! You hit a mine.");
        }
        
        scanner.close();
    }

    private static void processInput(String input, GameEngine engine) {
        String[] parts = input.split("\\s+");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Format must be: <action> <row> <col>");
        }

        String action = parts[0].toLowerCase();
        int r = Integer.parseInt(parts[1]);
        int c = Integer.parseInt(parts[2]);

        if ("r".equals(action)) {
            engine.reveal(r, c);
        } else if ("f".equals(action)) {
            engine.flag(r, c);
        } else {
            throw new IllegalArgumentException("Action must be 'r' (reveal) or 'f' (flag)");
        }
    }

    private static void printBoard(Board board, GameConfig config, boolean revealMines) {
        System.out.println();
        System.out.print("   ");
        for (int c = 0; c < config.cols(); c++) {
            System.out.print(c + " ");
        }
        System.out.println();

        for (int r = 0; r < config.rows(); r++) {
            System.out.printf("%2d ", r);
            for (int c = 0; c < config.cols(); c++) {
                Cell cell = board.getCell(r, c);
                System.out.print(getCellSymbol(cell, revealMines) + " ");
            }
            System.out.println();
        }
        System.out.println();
    }

    private static String getCellSymbol(Cell cell, boolean revealMines) {
        if (revealMines && cell.isMine()) {
            return "*";
        }
        if (cell.getState() == CellState.HIDDEN) {
            return ".";
        } else if (cell.getState() == CellState.FLAGGED) {
            return "F";
        } else {
            int count = cell.getAdjacentMines();
            return count == 0 ? "-" : String.valueOf(count);
        }
    }
}
