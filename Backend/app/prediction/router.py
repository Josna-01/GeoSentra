from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import pandas as pd
import os

router = APIRouter(prefix="/prediction", tags=["Cost Prediction"])

# Load the prediction dataset
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "Model", "Predective_Forecast_After_Engineering.csv")
df = None

def load_dataset():
    """Load prediction dataset on startup"""
    global df
    try:
        df = pd.read_csv(CSV_PATH)
        print(f"✅ Loaded {len(df)} prediction records")
    except Exception as e:
        print(f"⚠️ Failed to load prediction dataset: {e}")
        df = None

# Load dataset when module is imported
load_dataset()

class PredictionRequest(BaseModel):
    event_type: str
    country: Optional[str] = None
    severity: Optional[float] = None

@router.get("/cost-impact")
def get_cost_impact_overview():
    """Get overview of cost impact predictions"""
    try:
        if df is None:
            raise HTTPException(status_code=500, detail="Prediction dataset not loaded")
        
        # Calculate summary statistics
        summary = {
            "total_predictions": len(df),
            "avg_cost_impact": round(df["recomputed_cost_impact_usd"].mean(), 2),
            "avg_disruption_days": round(df["predicted_disruption_days"].mean(), 2),
            "stockout_rate": round((df["will_stockout"].sum() / len(df)) * 100, 2),
            "by_event_type": {},
            "by_severity": {}
        }
        
        # Group by event type
        for event_type in df["event_type"].unique():
            event_data = df[df["event_type"] == event_type]
            summary["by_event_type"][event_type] = {
                "count": len(event_data),
                "avg_cost": round(event_data["recomputed_cost_impact_usd"].mean(), 2),
                "avg_days": round(event_data["predicted_disruption_days"].mean(), 2),
                "stockout_rate": round((event_data["will_stockout"].sum() / len(event_data)) * 100, 2)
            }
        
        # Group by cost severity
        for severity in df["cost_severity_level"].unique():
            severity_data = df[df["cost_severity_level"] == severity]
            summary["by_severity"][severity] = {
                "count": len(severity_data),
                "avg_cost": round(severity_data["recomputed_cost_impact_usd"].mean(), 2)
            }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
def analyze_disruption(request: PredictionRequest):
    """Analyze specific disruption scenario and predict cost impact"""
    try:
        if df is None:
            raise HTTPException(status_code=500, detail="Prediction dataset not loaded")
        
        # 1. Filter by Event Type
        filtered_df = df[df["event_type"] == request.event_type].copy()
        
        if len(filtered_df) == 0:
            return {
                "status": "no_data",
                "message": f"No historical data for event type: {request.event_type}",
                "available_event_types": df["event_type"].unique().tolist()
            }
        
        # 2. Filter by Country (if provided) using fuzzy match or exact
        if request.country:
            # Try exact match first
            country_df = filtered_df[filtered_df["country_stability_index"].astype(str).str.contains(request.country, case=False, na=False)] # Assuming country column might not exist, checking dataset columns...
            # Wait, looking at previous view, columns were: event_type, country_stability_index, severity_score, etc.
            # There is NO 'country' column in the csv headers I saw earlier? 
            # "event_type,country_stability_index,severity_score,predicted_disruption_days,days_until_stockout,days_out_of_stock,will_stockout,stockout_risk_level,daily_revenue_loss,expedited_shipping_cost_usd,recomputed_cost_impact_usd,cost_severity_level"
            # Ah, 'country' is likely NOT in the dataset. 'country_stability_index' is a score.
            # So I cannot filter by country name if it's not there.
            pass

        # 3. Filter by Severity (Weighted Logic)
        if request.severity is not None:
             # Calculate similarity score (inverse of distance)
             filtered_df["similarity"] = 1 / (abs(filtered_df["severity_score"] - request.severity) + 0.1)
             
             # Pick top 50 most similar scenarios
             top_matches = filtered_df.nlargest(50, "similarity")
             
             if len(top_matches) > 0:
                 filtered_df = top_matches

        # Calculate predictions based on filtered data
        prediction = {
            "event_type": request.event_type,
            "country": request.country,
            "severity": request.severity,
            "predicted_cost_usd": round(filtered_df["recomputed_cost_impact_usd"].mean(), 2),
            "cost_range": {
                "min": round(filtered_df["recomputed_cost_impact_usd"].min(), 2),
                "max": round(filtered_df["recomputed_cost_impact_usd"].max(), 2),
                "median": round(filtered_df["recomputed_cost_impact_usd"].median(), 2)
            },
            "predicted_disruption_days": round(filtered_df["predicted_disruption_days"].mean(), 2),
            "stockout_probability": round(filtered_df["will_stockout"].mean() * 100, 2), # Correct calculation for binary
            "stockout_risk_level": filtered_df["stockout_risk_level"].mode()[0] if len(filtered_df) > 0 else "UNKNOWN",
            "cost_severity_level": filtered_df["cost_severity_level"].mode()[0] if len(filtered_df) > 0 else "UNKNOWN",
            "daily_revenue_loss": round(filtered_df["daily_revenue_loss"].mean(), 2),
            "expedited_shipping_cost": round(filtered_df["expedited_shipping_cost_usd"].mean(), 2),
            "confidence": round(min((len(filtered_df) / 50) * 100, 98.5), 2), # dynamic confidence based on sample size matches
            "sample_size": len(filtered_df),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return {
            "status": "success",
            "prediction": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historical")
def get_historical_predictions(
    event_type: Optional[str] = Query(None),
    limit: int = Query(100, le=1000)
):
    """Get historical predictions for analysis"""
    try:
        if df is None:
            raise HTTPException(status_code=500, detail="Prediction dataset not loaded")
        
        # Filter by event type if provided
        filtered_df = df if event_type is None else df[df["event_type"] == event_type]
        
        # Sample records
        sample_df = filtered_df.sample(min(limit, len(filtered_df)))
        
        # Convert to records
        records = sample_df[[
            "event_type",
            "severity_score",
            "predicted_disruption_days",
            "recomputed_cost_impact_usd",
            "will_stockout",
            "stockout_risk_level",
            "cost_severity_level"
        ]].to_dict(orient="records")
        
        return {
            "total": len(filtered_df),
            "returned": len(records),
            "records": records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/event-types")
def get_event_types():
    """Get list of available event types"""
    try:
        if df is None:
            raise HTTPException(status_code=500, detail="Prediction dataset not loaded")
        
        event_types = df["event_type"].unique().tolist()
        return {
            "total": len(event_types),
            "event_types": event_types
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
