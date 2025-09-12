import pytest
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app, calculate_bayesian_update, calculate_expected_loss, calculate_roi

def test_bayesian_update():
    """Test Bayesian belief update calculation"""
    prior_beliefs = {"H1": 0.6, "H2": 0.25, "H3": 0.15}
    action = {"effectiveness": {"H1": 0.8, "H2": 0.1, "H3": 0.05}}
    evidence = {"H1": 0.7, "H2": 0.5, "H3": 0.3}
    
    result = calculate_bayesian_update(prior_beliefs, action, evidence)
    
    # Check that beliefs sum to approximately 1
    assert abs(sum(result.values()) - 1.0) < 0.01
    # Check that H1 probability decreased (defense was effective)
    assert result["H1"] < prior_beliefs["H1"]

def test_expected_loss():
    """Test expected loss calculation"""
    beliefs = {"H1": 0.6, "H2": 0.25, "H3": 0.15}
    threats = [
        {"id": "H1", "impact": 500000},
        {"id": "H2", "impact": 200000},
        {"id": "H3", "impact": 150000}
    ]
    
    result = calculate_expected_loss(beliefs, threats)
    expected = 0.6 * 500000 + 0.25 * 200000 + 0.15 * 150000
    assert result == expected

def test_roi_calculation():
    """Test ROI calculation"""
    action = {"cost": 15}
    beliefs_before = {"H1": 0.6, "H2": 0.25, "H3": 0.15}
    beliefs_after = {"H1": 0.4, "H2": 0.35, "H3": 0.25}
    threats = [
        {"id": "H1", "impact": 500000},
        {"id": "H2", "impact": 200000},
        {"id": "H3", "impact": 150000}
    ]
    
    result = calculate_roi(action, beliefs_before, beliefs_after, threats)
    assert isinstance(result, (int, float))

def test_app_creation():
    """Test that the FastAPI app is created successfully"""
    assert app is not None
    assert app.title == "PS-3 ADO + BAS API"

if __name__ == "__main__":
    pytest.main([__file__])
