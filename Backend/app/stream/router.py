from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/stream", tags=["Real-time Streaming"])

# In-memory storage for graph metrics (would be Redis/TimescaleDB in production)
GRAPH_METRICS = []

def generate_metric():
    """Generate simulated real-time graph metrics"""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "active_nodes": random.randint(45, 55),
        "risk_nodes": random.randint(2, 8),
        "warning_nodes": random.randint(5, 12),
        "safe_nodes": random.randint(30, 40),
        "total_alerts": random.randint(15, 35),
        "avg_risk_score": round(random.uniform(25, 45), 2),
        "network_health": round(random.uniform(75, 95), 2)
    }

@router.get("/graph-metrics")
def get_graph_metrics(minutes: int = 30):
    """
    Get real-time graph streaming metrics
    Returns time-series data for the last N minutes
    """
    # Generate historical data points
    metrics = []
    now = datetime.utcnow()
    
    for i in range(minutes):
        timestamp = now - timedelta(minutes=minutes - i)
        metrics.append({
            "timestamp": timestamp.isoformat(),
            "active_nodes": 50 + random.randint(-5, 5),
            "risk_nodes": 5 + random.randint(-2, 3),
            "warning_nodes": 8 + random.randint(-3, 4),
            "safe_nodes": 37 + random.randint(-5, 5),
            "total_alerts": 25 + random.randint(-10, 10),
            "avg_risk_score": round(35 + random.uniform(-10, 10), 2),
            "network_health": round(85 + random.uniform(-10, 10), 2)
        })
    
    return {
        "metrics": metrics,
        "interval_minutes": minutes,
        "latest": metrics[-1] if metrics else None
    }

@router.get("/live-pulse")
def get_live_pulse():
    """
    Get current system pulse - single data point for real-time updates
    """
    return generate_metric()
