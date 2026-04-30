package com.example.ai_core_game.dto;

public record AiTurnResponse(
        BoardSnapshotRequest board,
        String actionTaken,
        int row,
        int col,
        String reasoning,
        double confidence
) {
}
