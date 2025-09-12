# 🔌 API Documentation

## **PS-3 ADO + BAS API Reference**

### **Base URL**
```
http://127.0.0.1:8000
```

---

## **Endpoints**

### **GET /scenario**
Get complete threat intelligence scenario data.

**Response:**
```json
{
  "title": "Advanced Persistent Threat (APT) Simulation - CVE-2024-1234",
  "description": "Simulate defense against a sophisticated APT group",
  "assets": [...],
  "threats": [...],
  "actions": [...],
  "attacker_profile": {...}
}
```

### **POST /simulate_turn**
Execute a single turn of the defense simulation.

**Request:**
```json
{
  "chosen_action_id": "patch_db",
  "current_beliefs": {
    "H1": 0.6,
    "H2": 0.25,
    "H3": 0.15
  }
}
```

**Response:**
```json
{
  "updated_beliefs": {
    "H1": 0.4,
    "H2": 0.35,
    "H3": 0.25
  },
  "expected_loss_before": 375000,
  "expected_loss_after": 280000,
  "roi": 0.75,
  "rationale_summary": "Defense action detected. Adapting strategy.",
  "action_taken": {...},
  "evidence": {...}
}
```

### **POST /optimize_deception**
Find optimal defense action using AI.

**Request:**
```json
{
  "current_beliefs": {
    "H1": 0.6,
    "H2": 0.25,
    "H3": 0.15
  },
  "available_budget": 100.0
}
```

**Response:**
```json
{
  "best_action_id": "patch_db",
  "best_action": {...},
  "analysis": {
    "updated_beliefs": {...},
    "expected_loss_reduction": 95000,
    "roi": 0.75,
    "rationale": "Optimal defense strategy identified"
  }
}
```

### **GET /export_slide**
Generate export data for PDF generation.

**Response:**
```json
{
  "scenario": {...},
  "formulas": {
    "bayesian_update": "P(H|E) = P(E|H) × P(H) / P(E)",
    "expected_loss": "E[L] = Σ P(Threat_i) × Impact_i",
    "roi": "ROI = (Loss_Reduction - Cost) / Cost"
  },
  "assumptions": [...]
}
```

### **GET /health**
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-12T10:30:00Z",
  "version": "1.0.0",
  "endpoints": [...]
}
```

---

## **Error Handling**

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (invalid input)
- **404**: Not Found
- **500**: Internal Server Error

Error responses include:
```json
{
  "detail": "Error message description"
}
```

---

## **Rate Limiting**

- **Simulation endpoints**: 10 requests/minute
- **Health check**: No limit
- **Export**: 5 requests/minute

---

## **Authentication**

Currently no authentication required for localhost development.

---

## **CORS**

Configured for:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
