package com.example.ai_core_game.dto;

public record AiActionResponse(String action, int x, int y, double confidence, String reasoning) {

    public int getRow() {
        return x;
    }

    public int getCol() {
        return y;
    }
}
