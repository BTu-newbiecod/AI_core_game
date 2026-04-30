package com.example.ai_core_game.controller;

import com.example.ai_core_game.domain.DifficultyLevel;
import com.example.ai_core_game.domain.GameEngine;
import com.example.ai_core_game.dto.AiActionResponse;
import com.example.ai_core_game.dto.AiTurnResponse;
import com.example.ai_core_game.dto.BoardSnapshotRequest;
import com.example.ai_core_game.service.AiIntegrationService;
import com.example.ai_core_game.service.GameSession;
import com.example.ai_core_game.service.GameSessionManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ai_core_game.dto.ManualMoveRequest;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameSessionManager sessionManager;
    private final AiIntegrationService aiService;

    public GameController(GameSessionManager sessionManager, AiIntegrationService aiService) {
        this.sessionManager = sessionManager;
        this.aiService = aiService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> startGame(
            @RequestParam(defaultValue = "EASY") DifficultyLevel difficulty) {
        String gameId = sessionManager.startGame(difficulty);
        return ResponseEntity.ok(Map.of("gameId", gameId));
    }

    @PostMapping("/{gameId}/manual-move")
    public ResponseEntity<BoardSnapshotRequest> executeManualMove(
            @PathVariable String gameId,
            @RequestBody ManualMoveRequest moveRequest) {
        GameEngine engine = sessionManager.getSession(gameId).getEngine();

        if ("REVEAL".equalsIgnoreCase(moveRequest.action())) {
            engine.reveal(moveRequest.row(), moveRequest.col());
        } else if ("FLAG".equalsIgnoreCase(moveRequest.action())) {
            engine.flag(moveRequest.row(), moveRequest.col());
        }

        BoardSnapshotRequest updatedBoard = BoardSnapshotRequest.from(
                engine.getBoard(),
                engine.getConfig().rows(),
                engine.getConfig().cols(),
                engine.getState()
        );

        return ResponseEntity.ok(updatedBoard);
    }

    @PostMapping("/{gameId}/ai-move")
    public ResponseEntity<AiTurnResponse> executeAiMove(@PathVariable String gameId) {
        GameSession session = sessionManager.getSession(gameId);
        GameEngine engine = session.getEngine();

        BoardSnapshotRequest request = BoardSnapshotRequest.from(
                engine.getBoard(),
                engine.getConfig().rows(),
                engine.getConfig().cols(),
                engine.getState()
        );

        AiActionResponse[] actions = aiService.getNextMove(request);
        if (actions == null || actions.length == 0) {
            return ResponseEntity.noContent().build();
        }

        AiActionResponse chosenAction = actions[0];
        applyActionToEngine(engine, chosenAction);
        session.markAiUsed();

        BoardSnapshotRequest updatedBoard = BoardSnapshotRequest.from(
                engine.getBoard(),
                engine.getConfig().rows(),
                engine.getConfig().cols(),
                engine.getState()
        );

        AiTurnResponse response = new AiTurnResponse(
                updatedBoard,
                chosenAction.action(),
                chosenAction.getRow(),
                chosenAction.getCol(),
                chosenAction.reasoning(),
                chosenAction.confidence()
        );

        return ResponseEntity.ok(response);
    }

    private void applyActionToEngine(GameEngine engine, AiActionResponse action) {
        if ("REVEAL".equalsIgnoreCase(action.action())) {
            engine.reveal(action.getRow(), action.getCol());
        } else if ("FLAG".equalsIgnoreCase(action.action())) {
            engine.flag(action.getRow(), action.getCol());
        }
    }
}

