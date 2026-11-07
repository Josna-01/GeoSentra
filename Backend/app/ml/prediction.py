from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import numpy as np
from collections import defaultdict
from app.db import db

router = APIRouter(prefix="/ml", tags=["Machine Learning & Predictions"])

class DisruptionPredictor:
    """ML model for predicting supply chain disruptions based on historical patterns"""
    
    def __init__(self):
        self.historical_data = []
        self.patterns = defaultdict(list)
        self.load_historical_data()
    
    def load_historical_data(self):
        """Load past disruptions from Firestore"""
        try:
            alerts_ref = db.collection("alerts").order_by("timestamp", direction="DESCENDING").limit(500)
            
            for doc in alerts_ref.stream():
                event = doc.to_dict()
                self.historical_data.append({
                    "event_type": event.get("event_type"),
                    "country": event.get("location", {}).get("country"),
                    "severity": event.get("severity_score", 5),
                    "affected_sectors": event.get("affected_sectors", []),
                    "timestamp": event.get("timestamp"),
                    "month": self._extract_month(event.get("timestamp")),
                    "outcome": event.get("outcome", "unknown")  # resolved, ongoing, escalated
                })
            
            self._build_patterns()
            
        except Exception as e:
            print(f"Error loading historical data: {e}")
    
    def _extract_month(self, timestamp_str: str) -> int:
        """Extract month from ISO timestamp"""
        try:
            if timestamp_str:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                return dt.month
            return 0
        except:
            return 0
    
    def _build_patterns(self):
        """Analyze historical data to find patterns"""
        # Initialize pattern dictionaries
        self.patterns['event_frequency'] = defaultdict(int)
        self.patterns['seasonal'] = defaultdict(list)
        self.patterns['high_severity'] = []
        
        if not self.historical_data:
            print("⚠️  No historical data available for pattern learning")
            return
        
        # Pattern 1: Event frequency by type and country
        for event in self.historical_data:
            key = f"{event.get('event_type', 'Unknown')}_{event.get('country', 'Unknown')}"
            self.patterns['event_frequency'][key] += 1
        
        # Pattern 2: Seasonal patterns (month-based)
        for event in self.historical_data:
            month = event.get('month', 0)
            if month > 0:
                self.patterns['seasonal'][month].append(event.get('event_type', 'Unknown'))
        
        # Pattern 3: Severity escalation patterns
        for event in self.historical_data:
            if event.get('severity', 0) >= 7:
                self.patterns['high_severity'].append({
                    "type": event.get('event_type', 'Unknown'),
                    "country": event.get('country', 'Unknown')
                })
    
    def predict_risk(self, country: str, event_type: str = None) -> Dict:
        """
        Predict disruption risk for a country based on historical patterns
        
        Returns risk probability (0-1) and confidence score
        """
        # Check if we have any data
        if not self.historical_data:
            return {
                "country": country,
                "event_type": event_type or "Any",
                "risk_probability": 0.0,
                "confidence": 0.0,
                "risk_level": "Unknown",
                "historical_events": 0,
                "message": "No historical data available. System needs to collect event data first.",
                "factors": {
                    "base_frequency": 0.0,
                    "seasonal_factor": 0.0,
                    "severity_history": 0.0
                }
            }
        
        # Calculate base risk from historical frequency
        if event_type:
            key = f"{event_type}_{country}"
            frequency = self.patterns['event_frequency'].get(key, 0)
        else:
            # Sum all event types for this country
            frequency = sum(
                count for key, count in self.patterns['event_frequency'].items()
                if key.endswith(f"_{country}")
            )
        
        # Normalize frequency to probability (0-1)
        max_frequency = max(self.patterns['event_frequency'].values()) if self.patterns['event_frequency'] else 1
        base_probability = min(frequency / max_frequency, 1.0) if max_frequency > 0 else 0.0
        
        # Check seasonal factors
        current_month = datetime.utcnow().month
        seasonal_events = self.patterns['seasonal'].get(current_month, [])
        seasonal_boost = 0.1 if (event_type in seasonal_events or not event_type) else 0.0
        
        # Check high severity history
        high_severity_count = sum(
            1 for item in self.patterns['high_severity']
            if item['country'] == country and (not event_type or item['type'] == event_type)
        )
        severity_boost = min(high_severity_count * 0.05, 0.2)
        
        # Combined risk probability
        risk_probability = min(base_probability + seasonal_boost + severity_boost, 1.0)
        
        # Confidence based on data availability
        total_events = len([e for e in self.historical_data if e['country'] == country])
        confidence = min(total_events / 50, 1.0)  # Max confidence at 50+ events
        
        return {
            "country": country,
            "event_type": event_type or "Any",
            "risk_probability": round(risk_probability, 3),
            "confidence": round(confidence, 3),
            "risk_level": self._categorize_risk(risk_probability),
            "historical_events": total_events,
            "factors": {
                "base_frequency": round(base_probability, 3),
                "seasonal_factor": round(seasonal_boost, 3),
                "severity_history": round(severity_boost, 3)
            }
        }
    
    def _categorize_risk(self, probability: float) -> str:
        """Categorize risk level"""
        if probability >= 0.7:
            return "High"
        elif probability >= 0.4:
            return "Medium"
        else:
            return "Low"
    
    def predict_next_disruption(self, days_ahead: int = 30) -> List[Dict]:
        """
        Predict likely disruptions in the next N days based on patterns
        """
        predictions = []
        
        # Get unique countries from historical data
        countries = set(e['country'] for e in self.historical_data if e['country'])
        
        # Predict for each country
        for country in countries:
            # Get most common event types for this country
            country_events = [e for e in self.historical_data if e['country'] == country]
            event_types = defaultdict(int)
            
            for event in country_events:
                event_types[event['event_type']] += 1
            
            # Predict top 2 most likely event types
            top_events = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:2]
            
            for event_type, count in top_events:
                prediction = self.predict_risk(country, event_type)
                
                if prediction['risk_probability'] > 0.3:  # Only include significant risks
                    predictions.append({
                        **prediction,
                        "predicted_timeframe": f"Next {days_ahead} days",
                        "historical_frequency": count
                    })
        
        # Sort by risk probability
        predictions.sort(key=lambda x: x['risk_probability'], reverse=True)
        
        return predictions[:10]  # Top 10 predictions
    
    def analyze_supplier_vulnerability(self, supplier_country: str) -> Dict:
        """
        Analyze a supplier's vulnerability based on historical disruption patterns
        """
        # Get all events in supplier's country
        country_events = [e for e in self.historical_data if e['country'] == supplier_country]
        
        if not country_events:
            return {
                "country": supplier_country,
                "vulnerability_score": 0.0,
                "risk_level": "Unknown",
                "message": "Insufficient historical data"
            }
        
        # Calculate vulnerability metrics
        total_events = len(country_events)
        high_severity_events = len([e for e in country_events if e['severity'] >= 7])
        avg_severity = np.mean([e['severity'] for e in country_events])
        
        # Recent events (last 90 days)
        ninety_days_ago = (datetime.utcnow() - timedelta(days=90)).isoformat()
        recent_events = len([
            e for e in country_events 
            if e.get('timestamp', '') > ninety_days_ago
        ])
        
        # Vulnerability score (0-10)
        vulnerability_score = min(
            (total_events * 0.1) +
            (high_severity_events * 0.5) +
            (avg_severity * 0.3) +
            (recent_events * 0.3),
            10.0
        )
        
        return {
            "country": supplier_country,
            "vulnerability_score": round(vulnerability_score, 2),
            "risk_level": "High" if vulnerability_score >= 7 else "Medium" if vulnerability_score >= 4 else "Low",
            "metrics": {
                "total_historical_events": total_events,
                "high_severity_events": high_severity_events,
                "average_severity": round(avg_severity, 2),
                "recent_events_90d": recent_events
            },
            "recommendation": self._get_recommendation(vulnerability_score)
        }
    
    def _get_recommendation(self, score: float) -> str:
        """Get recommendation based on vulnerability score"""
        if score >= 7:
            return "High risk - Consider diversifying suppliers or increasing safety stock"
        elif score >= 4:
            return "Medium risk - Monitor closely and maintain backup suppliers"
        else:
            return "Low risk - Continue normal operations with standard monitoring"


# Initialize predictor
predictor = DisruptionPredictor()


@router.get("/predict-risk")
def predict_country_risk(country: str, event_type: Optional[str] = None):
    """
    Predict disruption risk for a specific country
    
    Uses historical pattern analysis to calculate probability
    """
    try:
        prediction = predictor.predict_risk(country, event_type)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecast")
def forecast_disruptions(days_ahead: int = 30):
    """
    Forecast likely disruptions in the next N days
    
    Returns top 10 most likely disruptions based on historical patterns
    """
    try:
        predictions = predictor.predict_next_disruption(days_ahead)
        return {
            "forecast_period": f"Next {days_ahead} days",
            "predictions": predictions,
            "total_predictions": len(predictions),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/supplier-vulnerability")
def analyze_supplier(country: str):
    """
    Analyze supplier vulnerability based on historical disruption patterns
    
    Returns vulnerability score (0-10) and recommendations
    """
    try:
        analysis = predictor.analyze_supplier_vulnerability(country)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrain")
def retrain_model():
    """
    Retrain the prediction model with latest historical data
    
    Call this after significant new events to improve predictions
    """
    try:
        predictor.load_historical_data()
        return {
            "status": "success",
            "message": "Model retrained with latest data",
            "historical_events": len(predictor.historical_data),
            "patterns_identified": len(predictor.patterns),
            "retrained_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patterns")
def get_learned_patterns():
    """
    View patterns learned from historical disruptions
    
    Useful for understanding model behavior
    """
    try:
        return {
            "total_historical_events": len(predictor.historical_data),
            "event_frequency_patterns": dict(predictor.patterns['event_frequency']),
            "seasonal_patterns": {
                month: list(set(events))
                for month, events in predictor.patterns['seasonal'].items()
            },
            "high_severity_hotspots": predictor.patterns['high_severity'][:20]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
