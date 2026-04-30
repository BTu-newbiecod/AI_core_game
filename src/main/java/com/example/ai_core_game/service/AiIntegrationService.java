package com.example.ai_core_game.service;

import com.example.ai_core_game.dto.AiActionResponse;
import com.example.ai_core_game.dto.BoardSnapshotRequest;
import com.example.ai_core_game.exception.AiServiceUnavailableException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class AiIntegrationService {

    private static final String AI_SERVICE_URL = "http://localhost:8000/api/ai/next-move";
    private final RestTemplate restTemplate;

    public AiIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    public AiActionResponse[] getNextMove(BoardSnapshotRequest snapshot) {
        try {
            ResponseEntity<AiActionResponse[]> response = restTemplate.postForEntity(
                    AI_SERVICE_URL,
                    snapshot,
                    AiActionResponse[].class
            );
            
            return response.getBody();
            
        } catch (RestClientException e) {
            throw new AiServiceUnavailableException("Failed to connect to AI Agent Service at " + AI_SERVICE_URL, e);
        } catch (Exception e) {
            throw new AiServiceUnavailableException("Unexpected error when integrating with AI Agent", e);
        }
    }
}
