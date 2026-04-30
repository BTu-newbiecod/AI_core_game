package com.example.ai_core_game.controller;

import com.example.ai_core_game.domain.DifficultyLevel;
import com.example.ai_core_game.dto.LeaderboardRecord;
import com.example.ai_core_game.service.GameSession;
import com.example.ai_core_game.service.GameSessionManager;
import com.example.ai_core_game.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final GameSessionManager sessionManager;

    public LeaderboardController(LeaderboardService leaderboardService, GameSessionManager sessionManager) {
        this.leaderboardService = leaderboardService;
        this.sessionManager = sessionManager;
    }

    @GetMapping("/{level}")
    public ResponseEntity<List<LeaderboardRecord>> getTopRecords(@PathVariable DifficultyLevel level) {
        return ResponseEntity.ok(leaderboardService.getTopRecords(level));
    }

    @PostMapping("/{gameId}")
    public ResponseEntity<Void> submitRecord(
            @PathVariable String gameId,
            @RequestParam String playerName,
            @RequestParam DifficultyLevel difficulty) {
        GameSession session = sessionManager.getSession(gameId);
        leaderboardService.submitRecord(playerName, session, difficulty);
        return ResponseEntity.ok().build();
    }
}
