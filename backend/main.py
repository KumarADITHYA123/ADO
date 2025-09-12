from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import json
import math
import random
from datetime import datetime

app = FastAPI(title="PS-3 ADO + BAS API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SimulationRequest(BaseModel):
    chosen_action_id: str
    current_beliefs: Dict[str, float]

class OptimizationRequest(BaseModel):
    current_beliefs: Dict[str, float]
    available_budget: float = 100.0

# Load scenario data
SCENARIO_DATA = {
    "title": "Advanced Persistent Threat (APT) Simulation - CVE-2024-1234",
    "description": "Simulate defense against a sophisticated APT group targeting critical infrastructure",
    "assets": [
        {"id": "db_server", "name": "Database Server", "value": 500000, "vulnerability": "CVE-2024-1234"},
        {"id": "mail_server", "name": "Mail Server", "value": 200000, "vulnerability": "CVE-2024-5678"},
        {"id": "web_server", "name": "Web Server", "value": 150000, "vulnerability": "CVE-2024-9012"}
    ],
    "threats": [
        {"id": "H1", "name": "Database Exfiltration", "probability": 0.6, "impact": 500000, "description": "APT group attempts to exfiltrate sensitive database records"},
        {"id": "H2", "name": "Mailbox Takeover", "probability": 0.25, "impact": 200000, "description": "Compromise email accounts for lateral movement"},
        {"id": "H3", "name": "Web Defacement", "probability": 0.15, "impact": 150000, "description": "Deface public website for reputation damage"}
    ],
    "actions": [
        {
            "id": "patch_db",
            "name": "Patch DB vuln",
            "cost": 15,
            "description": "Apply CVE-2024-1234 patch to database server",
            "effectiveness": {"H1": 0.8, "H2": 0.1, "H3": 0.05},
            "deception_factor": 0.3,
            "monitoring_boost": 0.4
        },
        {
            "id": "auth_logs",
            "name": "Enable verbose auth logs",
            "cost": 5,
            "description": "Enable detailed authentication logging",
            "effectiveness": {"H1": 0.2, "H2": 0.7, "H3": 0.1},
            "deception_factor": 0.1,
            "monitoring_boost": 0.8
        },
        {
            "id": "web_honeypot",
            "name": "Deploy web honeypot placeholder",
            "cost": 8,
            "description": "Deploy decoy web server to detect attackers",
            "effectiveness": {"H1": 0.1, "H2": 0.2, "H3": 0.9},
            "deception_factor": 0.9,
            "monitoring_boost": 0.6
        }
    ],
    "attacker_profile": {
        "sophistication": "High",
        "persistence": "Long-term",
        "resources": "Well-funded",
        "motivation": "Espionage and data theft"
    }
}

def calculate_bayesian_update(prior_beliefs: Dict[str, float], action: Dict, evidence: Dict) -> Dict[str, float]:
    """Calculate Bayesian belief updates based on action effectiveness"""
    updated_beliefs = {}
    
    for threat_id in prior_beliefs:
        prior = prior_beliefs[threat_id]
        effectiveness = action.get("effectiveness", {}).get(threat_id, 0.0)
        evidence_strength = evidence.get(threat_id, 0.5)
        
        # Bayesian update: P(H|E) = P(E|H) * P(H) / P(E)
        # Simplified: new_belief = (effectiveness * prior) / ((effectiveness * prior) + (1 - effectiveness) * (1 - prior))
        numerator = effectiveness * prior
        denominator = numerator + (1 - effectiveness) * (1 - prior)
        
        if denominator > 0:
            updated_beliefs[threat_id] = numerator / denominator
        else:
            updated_beliefs[threat_id] = prior
    
    # Normalize beliefs to sum to 1
    total = sum(updated_beliefs.values())
    if total > 0:
        updated_beliefs = {k: v/total for k, v in updated_beliefs.items()}
    
    return updated_beliefs

def calculate_expected_loss(beliefs: Dict[str, float], threats: List[Dict]) -> float:
    """Calculate expected loss based on current beliefs"""
    total_loss = 0.0
    
    for threat in threats:
        threat_id = threat["id"]
        probability = beliefs.get(threat_id, 0.0)
        impact = threat["impact"]
        total_loss += probability * impact
    
    return total_loss

def calculate_roi(action: Dict, beliefs_before: Dict[str, float], beliefs_after: Dict[str, float], threats: List[Dict]) -> float:
    """Calculate Return on Investment for an action"""
    cost = action["cost"]
    loss_before = calculate_expected_loss(beliefs_before, threats)
    loss_after = calculate_expected_loss(beliefs_after, threats)
    
    loss_reduction = loss_before - loss_after
    roi = (loss_reduction - cost) / cost if cost > 0 else 0
    
    return roi

def generate_attacker_rationale(action: Dict, beliefs: Dict[str, float]) -> str:
    """Generate realistic attacker rationale based on action and beliefs"""
    rationales = {
        "patch_db": [
            "The database patch significantly reduces our exfiltration window. We need to pivot to alternative attack vectors.",
            "Defense has hardened the primary target. Time to focus on email-based lateral movement.",
            "Database access is now heavily monitored. Let's shift to web-based attacks."
        ],
        "auth_logs": [
            "Authentication monitoring is now active. We need to be more careful with credential harvesting.",
            "Defense is watching login patterns. Time to use more sophisticated persistence techniques.",
            "Our usual attack patterns are now visible. Need to adapt our approach."
        ],
        "web_honeypot": [
            "The web server appears to be a honeypot. Let's avoid this vector and focus on other targets.",
            "Defense has deployed deception. We need to be more careful about target selection.",
            "This looks like a trap. Time to reassess our attack strategy."
        ]
    }
    
    return random.choice(rationales.get(action["id"], ["Defense action detected. Adapting strategy."]))

@app.get("/")
async def root():
    return {"message": "PS-3 ADO + BAS API", "status": "running", "timestamp": datetime.now().isoformat()}

@app.get("/scenario")
async def get_scenario():
    """Get the complete scenario data"""
    return SCENARIO_DATA

@app.post("/simulate_turn")
async def simulate_turn(request: SimulationRequest, x_api_key: str | None = Header(default=None)):
    """Simulate a single turn of the defense game"""
    try:
        # Optional demo API key guard
        from os import getenv
        required_key = getenv("DEMO_API_KEY")
        if required_key and x_api_key != required_key:
            raise HTTPException(status_code=401, detail="Unauthorized: invalid API key")

        # Validate beliefs sum approximately 1.0; normalize if slightly off
        if not request.current_beliefs:
            raise HTTPException(status_code=400, detail="Beliefs required")
        total_in = sum(request.current_beliefs.values())
        if abs(total_in - 1.0) > 0.02:
            s = total_in if total_in != 0 else 1.0
            request.current_beliefs = {k: max(0.0, v)/s for k, v in request.current_beliefs.items()}
        # Find the chosen action
        action = next((a for a in SCENARIO_DATA["actions"] if a["id"] == request.chosen_action_id), None)
        if not action:
            raise HTTPException(status_code=400, detail="Action not found")
        
        # Calculate belief updates
        evidence = {threat_id: random.uniform(0.3, 0.8) for threat_id in request.current_beliefs.keys()}
        updated_beliefs = calculate_bayesian_update(request.current_beliefs, action, evidence)
        
        # Calculate expected losses
        loss_before = calculate_expected_loss(request.current_beliefs, SCENARIO_DATA["threats"])
        loss_after = calculate_expected_loss(updated_beliefs, SCENARIO_DATA["threats"])
        
        # Calculate ROI
        roi = calculate_roi(action, request.current_beliefs, updated_beliefs, SCENARIO_DATA["threats"])
        
        # Generate attacker rationale
        rationale = generate_attacker_rationale(action, updated_beliefs)
        
        return {
            "updated_beliefs": updated_beliefs,
            "expected_loss_before": loss_before,
            "expected_loss_after": loss_after,
            "roi": roi,
            "rationale_summary": rationale,
            "action_taken": action,
            "evidence": evidence,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/optimize_deception")
async def optimize_deception(request: OptimizationRequest, x_api_key: str | None = Header(default=None)):
    """Find the optimal defense action based on current beliefs"""
    try:
        # Optional demo API key guard
        from os import getenv
        required_key = getenv("DEMO_API_KEY")
        if required_key and x_api_key != required_key:
            raise HTTPException(status_code=401, detail="Unauthorized: invalid API key")

        # Validate beliefs sum approximately 1.0; normalize if slightly off
        if not request.current_beliefs:
            raise HTTPException(status_code=400, detail="Beliefs required")
        total_in = sum(request.current_beliefs.values())
        if abs(total_in - 1.0) > 0.02:
            s = total_in if total_in != 0 else 1.0
            request.current_beliefs = {k: max(0.0, v)/s for k, v in request.current_beliefs.items()}
        best_action = None
        best_roi = -float('inf')
        best_analysis = {}
        
        for action in SCENARIO_DATA["actions"]:
            if action["cost"] > request.available_budget:
                continue
            
            # Simulate the action
            evidence = {threat_id: random.uniform(0.3, 0.8) for threat_id in request.current_beliefs.keys()}
            updated_beliefs = calculate_bayesian_update(request.current_beliefs, action, evidence)
            roi = calculate_roi(action, request.current_beliefs, updated_beliefs, SCENARIO_DATA["threats"])
            
            if roi > best_roi:
                best_roi = roi
                best_action = action
                best_analysis = {
                    "updated_beliefs": updated_beliefs,
                    "expected_loss_reduction": calculate_expected_loss(request.current_beliefs, SCENARIO_DATA["threats"]) - calculate_expected_loss(updated_beliefs, SCENARIO_DATA["threats"]),
                    "roi": roi,
                    "rationale": generate_attacker_rationale(action, updated_beliefs)
                }
        
        if not best_action:
            return {
                "best_action_id": None,
                "message": "No affordable actions available",
                "available_budget": request.available_budget
            }
        
        return {
            "best_action_id": best_action["id"],
            "best_action": best_action,
            "analysis": best_analysis,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "PS-3 ADO + BAS API", "status": "running", "timestamp": datetime.now().isoformat()}

@app.get("/export_slide")
async def export_slide():
    """Generate export data for PDF generation"""
    return {
        "scenario": SCENARIO_DATA,
        "formulas": {
            "bayesian_update": "P(H|E) = P(E|H) * P(H) / P(E)",
            "expected_loss": "E[L] = Σ P(Threat_i) * Impact_i",
            "roi": "ROI = (Loss_Reduction - Cost) / Cost"
        },
        "assumptions": [
            "Bayesian inference assumes threat probabilities are independent",
            "Action effectiveness is based on historical data and expert assessment",
            "Attacker behavior follows rational decision-making patterns",
            "Defense actions have immediate and lasting effects"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "endpoints": [
            "/scenario",
            "/simulate_turn",
            "/optimize_deception",
            "/export_slide",
            "/health"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)