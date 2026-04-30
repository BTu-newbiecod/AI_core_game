package com.example.ai_core_game.service;

import com.example.ai_core_game.domain.DifficultyLevel;
import com.example.ai_core_game.domain.GameState;
import com.example.ai_core_game.dto.LeaderboardRecord;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LeaderboardService {

    private static final int MAX_RECORDS_PER_LEVEL = 5;
    private static final String ERR_GAME_NOT_WON = "Cannot submit record: game was not won";
    private static final String ERR_AI_USED = "Cannot submit record: AI assistance was used";

    private final ConcurrentHashMap<DifficultyLevel, List<LeaderboardRecord>> records = new ConcurrentHashMap<>();

    public void submitRecord(String playerName, GameSession session, DifficultyLevel difficulty) {
        validateSession(session);

        LeaderboardRecord newRecord = new LeaderboardRecord(playerName, session.getDurationSeconds());

        records.compute(difficulty, (level, existingList) -> {
            List<LeaderboardRecord> list = existingList != null ? new ArrayList<>(existingList) : new ArrayList<>();
            list.add(newRecord);
            list.sort(Comparator.comparingLong(LeaderboardRecord::durationSeconds));
            List<LeaderboardRecord> trimmed = list.size() > MAX_RECORDS_PER_LEVEL
                    ? new ArrayList<>(list.subList(0, MAX_RECORDS_PER_LEVEL))
                    : list;
            return trimmed;
        });
    }

    public List<LeaderboardRecord> getTopRecords(DifficultyLevel difficulty) {
        return List.copyOf(records.getOrDefault(difficulty, List.of()));
    }

    private void validateSession(GameSession session) {
        if (session.getEngine().getState() != GameState.WON) {
            throw new IllegalStateException(ERR_GAME_NOT_WON);
        }
        if (session.isAiUsed()) {
            throw new IllegalStateException(ERR_AI_USED);
        }
    }
}
