package com.example.ai_core_game.service;

import com.example.ai_core_game.domain.DifficultyLevel;
import com.example.ai_core_game.domain.GameEngine;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionManager {

    private final ConcurrentHashMap<String, GameSession> activeSessions = new ConcurrentHashMap<>();

    public String startGame(DifficultyLevel difficulty) {
        String gameId = UUID.randomUUID().toString();
        GameEngine engine = new GameEngine(difficulty.toConfig());
        GameSession session = new GameSession(gameId, engine);
        activeSessions.put(gameId, session);
        return gameId;
    }

    public GameSession getSession(String gameId) {
        GameSession session = activeSessions.get(gameId);
        if (session == null) {
            throw new IllegalArgumentException("Game session not found for ID: " + gameId);
        }
        return session;
    }

    public void removeSession(String gameId) {
        activeSessions.remove(gameId);
    }
}
