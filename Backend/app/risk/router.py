from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from app.ml.event_detection import detector
from app.ml.graph_analysis import sc_graph
from app.ml.forecasting import forecaster
from app.db import db
from datetime import datetime
from app.services.news import news_service
import asyncio
import hashlib

# In-memory storage for deduplication (would use Redis in production)
PROCESSED_HASHES = set()

router = APIRouter(prefix="/risk", tags=["Risk"])

async def background_ingest():
    """Background task to fetch news every 10 minutes"""
    while True:
        print("Running background news ingestion...")
        try:
            articles = news_service.fetch_geopolitical_news()
            for article in articles:
                text = f"{article.get('title')} {article.get('description')}"
                
                # Deduplication Check
                text_hash = hashlib.md5(text.encode()).hexdigest()
                if text_hash in PROCESSED_HASHES:
                    continue
                
                PROCESSED_HASHES.add(text_hash)
                simulate_crisis(text)
        except Exception as e:
            print(f"Background ingest error: {e}")
        await asyncio.sleep(600) # 10 minutes

@router.on_event("startup")
async def startup_event():
    asyncio.create_task(background_ingest())

@router.get("/graph")
def get_graph():
    return sc_graph.get_graph_data()

@router.get("/alternative-paths")
def get_alternatives(source: str, target: str, avoid: str = ""):
    avoid_list = avoid.split(",") if avoid else []
    paths = sc_graph.find_alternative_paths(source, target, avoid_nodes=avoid_list)
    return {"paths": paths}

@router.get("/alerts")
def get_alerts():
    # Fetch alerts from Firestore
    try:
        alerts_ref = db.collection("alerts").order_by("timestamp", direction="DESCENDING").limit(20)
        alerts = []
        for doc in alerts_ref.stream():
            alerts.append({"id": doc.id, **doc.to_dict()})
        return alerts
    except Exception as e:
        print(f"Error fetching alerts: {e}")
        return []

@router.post("/simulate")
@router.get("/simulate")
def simulate_crisis(event_text: str = Query("Major port strike in Shanghai causing shipping delays")):
    # 1. Detect Event using Gemini
    try:
        event = detector.extract_event(event_text) or {
            "event_type": "Disaster",
            "location": {"city": "Unknown", "country": "Unknown", "coordinates": [0, 0]},
            "severity_score": 5,
            "summary": event_text,
            "affected_sectors": ["Logistics"]
        }
    except Exception as e:
        print(f"Event detection failed: {e}")
        event = {
            "event_type": "Disaster",
            "location": {"city": "Unknown", "country": "Unknown", "coordinates": [0, 0]},
            "severity_score": 5,
            "summary": event_text,
            "affected_sectors": ["Logistics"]
        }
    
    # 2. Graph Assessment: Find impacted hubs
    impacted_hubs = []
    location_city = event.get("location", {}).get("city", "Unknown")
    severity = event.get("severity_score", 5)

    for node, data in sc_graph.graph.nodes(data=True):
        if location_city.lower() in node.lower() or event.get("location", {}).get("country", "").lower() in data.get("country", "").lower():
            impacted_hubs.append(node)
            # Update node status in memory
            sc_graph.graph.nodes[node]["status"] = "risk" if severity > 7 else "warning"
    
    # 3. Predict Impact using XGBoost Model
    stability = 3.0 # default
    if impacted_hubs:
        hub_data = sc_graph.graph.nodes[impacted_hubs[0]]
        stability = hub_data.get("lpi_score", 3.0)
    
    try:
        days = forecaster.predict_disruption(event["event_type"], stability, event["severity_score"])
    except Exception as e:
        print(f"Prediction failed: {e}")
        days = event["severity_score"] * 1.2
    
    # Inventory Buffer Logic (Safety Stock)
    # detailed: transit_inventory vs safety_stock
    # specific logic: if 'delay' < safety_stock, impact is minimal.
    safety_stock_days = 2.0 # Assumed average safety stock
    start_impact_day = max(0, days - safety_stock_days)
    
    impact_cost = (start_impact_day * 2000) + (event["severity_score"] * 500)
    
    event["predicted_days"] = round(days, 2)
    event["effective_delay"] = round(start_impact_day, 2)
    event["impact_cost"] = round(impact_cost, 2)
    event["impacted_nodes"] = impacted_hubs
    now = datetime.utcnow()
    event["timestamp"] = now.isoformat()
    
    # 4. Save to Firestore
    try:
        # returns (update_time, document_ref)
        path_ref = db.collection("alerts").add(event)
        event["id"] = path_ref[1].id 
    except Exception as e:
        print(f"Firestore save failed: {e}")
        event["id"] = "temp-id"
    
    return event

@router.post("/generate-rfq")
def generate_rfq(event_id: str):
    # Fetch event from Firestore
    try:
        doc = db.collection("alerts").document(event_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        event = doc.to_dict()
        
        # Use Gemini to draft the RFQ
        prompt = f"""
        Draft a professional Request for Quotation (RFQ) email as a procurement manager.
        The reason for this RFQ is a recent supply chain disruption: {event.get('summary', 'Generic Disruption')} in {event.get('location', {}).get('city', 'Unknown')}.
        The predicted disruption is {event.get('predicted_days', 'several')} days.
        The impacted sector is {event.get('affected_sectors', ['key components'])[0]}.
        
        Make the email urgent but professional, asking for lead times and pricing.
        """
        
        try:
            response = detector.model.generate_content(prompt)
            draft = response.text.strip()
        except:
            draft = "Failed to generate AI draft. Please contact procurement manually."
        
        return {"draft": draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest-news")
def ingest_news(force: bool = False):
    print(f"Ingesting news... Force={force}")
    articles = news_service.fetch_geopolitical_news()
    print(f"Fetched {len(articles)} articles.")
    new_alerts = []
    
    for article in articles:
        text = f"{article.get('title')} {article.get('description')}"
        # Process through simulate logic
        try:
            # Deduplication Check
            text_hash = hashlib.md5(text.encode()).hexdigest()
            if not force and text_hash in PROCESSED_HASHES:
                print(f"Skipping duplicate: {text[:20]}...")
                continue
            
            PROCESSED_HASHES.add(text_hash)
            print(f"Simulating crisis for: {text[:20]}...")
            event = simulate_crisis(text)
            new_alerts.append(event)
            print(f"Alert generated: {event.get('id')}")
        except Exception as e:
            print(f"Error processing article '{text[:30]}...': {e}")
            continue
            
    print(f"Ingestion complete. Processed {len(new_alerts)} alerts.")
    return {"processed": len(new_alerts), "alerts": new_alerts}
