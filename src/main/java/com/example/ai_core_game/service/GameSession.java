package com.example.ai_core_game.service;

import com.example.ai_core_game.domain.GameEngine;

public class GameSession {

    private final String gameId;
    private final GameEngine engine;
    private final long startTimeMillis;
    private boolean isAiUsed;

    public GameSession(String gameId, GameEngine engine) {
        this.gameId = gameId;
        this.engine = engine;
        this.startTimeMillis = System.currentTimeMillis();
        this.isAiUsed = false;
    }

    public void markAiUsed() {
        this.isAiUsed = true;
    }

    public long getDurationSeconds() {
        return (System.currentTimeMillis() - startTimeMillis) / 1000;
    }

    public String getGameId() {
        return gameId;
    }

    public GameEngine getEngine() {
        return engine;
    }

    public long getStartTimeMillis() {
        return startTimeMillis;
    }

    public boolean isAiUsed() {
        return isAiUsed;
    }
}
