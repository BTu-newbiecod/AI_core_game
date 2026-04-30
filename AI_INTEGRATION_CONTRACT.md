# Minesweeper AI Agent Integration Contract

This document serves as the technical API contract between the Java Spring Boot Backend (`AI_core_game`) and the Python FastAPI AI Agent (`minesweeper-ai`).
It ensures that any developer (or AI assistant) switching between these repositories immediately understands the cross-service communication details.

## 1. Python AI Agent Service Details
- **Repository Path**: `c:\workspace\project\minesweeper-ai`
- **Host**: `localhost` (0.0.0.0)
- **Port**: `8000`
- **Framework**: FastAPI (run via uvicorn)

## 2. API Endpoint
- **URL**: `http://localhost:8000/api/ai/next-move`
- **Method**: `POST`
- **Content-Type**: `application/json`

## 3. Data Transfer Objects (Schemas)

### Request Schema (Java -> Python)
The Java backend must send a snapshot of the current board state.
*Mapping rule:*
- `-1`: Hidden cell
- `-2`: Flagged cell
- `0-8`: Revealed cell indicating the number of adjacent mines.

```json
{
  "rows": 9,
  "cols": 9,
  "board": [
    [-1, -1, -1, -1, -2, -1, -1, -1, -1],
    [-1,  1,  1,  1, -1, -1, -1, -1, -1],
    [-1,  1,  0,  1, -1, -1, -1, -1, -1]
  ]
}
```

### Response Schema (Python -> Java)
The Python AI processes the board and returns a JSON array of suggested actions.

```json
[
  {
    "action": "REVEAL",        
    "x": 1,               
    "y": 2,               
    "confidence": 0.95,   
    "reasoning": "Standard 1-1 pattern identified on the edge."
  }
]
```

#### Important Coordinate Mapping:
- The Python AI uses `(x, y)` coordinates, but note its internal assignment!
- **`x`** in Python's response maps directly to **`row`** in Java.
- **`y`** in Python's response maps directly to **`col`** in Java.
- **`action`** will be `"REVEAL"` or `"FLAG"`.

## 4. Implementation Guide for Java (Spring Boot)
When writing the service in Java to call this AI, you can use `RestTemplate` or `WebClient`. 

Example using `RestTemplate`:
```java
String aiServiceUrl = "http://localhost:8000/api/ai/next-move";
ResponseEntity<AiAction[]> response = restTemplate.postForEntity(
    aiServiceUrl, 
    boardSnapshotRequest, 
    AiAction[].class
);
```

> **Ghi chú cho AI Assistants**: Khi làm việc tại repo Java (`AI_core_game`), hãy đọc file này để tự động biết cách map DTO và gọi sang service AI mà không cần phải phân tích lại code Python.
