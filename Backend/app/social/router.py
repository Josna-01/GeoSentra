from fastapi import APIRouter, Query
import requests
from typing import Optional, List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/social", tags=["Social Media"])

# Simulated social media monitoring (in production, would use Twitter API, Reddit API, etc.)
KEYWORDS = ["strike", "protest", "shutdown", "delay", "disruption", "port", "logistics", "supply chain"]

@router.get("/trends")
def get_social_trends(region: Optional[str] = None, limit: int = Query(20, le=50)):
    """
    Monitor social media for supply chain disruption signals using Reddit JSON feeds (Free, Public)
    """
    trends = []
    subreddits = ["supplychain", "logistics", "shipping", "freight"]
    
    # Use a real user-agent to avoid being blocked
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    
    try:
        # Fetch from r/supplychain as a primary source
        url = "https://www.reddit.com/r/supplychain/hot.json?limit=25"
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            posts = data.get("data", {}).get("children", [])
            
            for post in posts:
                post_data = post.get("data", {})
                
                # Simple sentiment based on upvote ratio (proxy)
                upvote_ratio = post_data.get("upvote_ratio", 0.5)
                sentiment = "positive" if upvote_ratio > 0.8 else "negative" if upvote_ratio < 0.6 else "neutral"
                
                trend = {
                    "id": post_data.get("id"),
                    "keyword": post_data.get("title", "")[:50] + "...",
                    "region": "Global", # Reddit is global
                    "mentions": post_data.get("num_comments", 0),
                    "sentiment": sentiment,
                    "trending_score": round(post_data.get("score", 0) / 100, 2), # Normalize score
                    "timestamp": datetime.fromtimestamp(post_data.get("created_utc", 0)).isoformat(),
                    "sample_text": post_data.get("selftext", "")[:100] + "..." if post_data.get("selftext") else post_data.get("title"),
                    "source": "Reddit (r/supplychain)"
                }
                trends.append(trend)
        else:
            # Fallback if Reddit blocks the request (rate limits)
            print(f"Reddit API Error: {response.status_code}")
            return _get_fallback_trends(limit)

    except Exception as e:
        print(f"Social API Error: {e}")
        return _get_fallback_trends(limit)
    
    # Sort by trending score
    trends.sort(key=lambda x: x["trending_score"], reverse=True)
    
    return {
        "total": len(trends),
        "trends": trends[:limit],
        "last_updated": datetime.utcnow().isoformat()
    }

def _get_fallback_trends(limit):
    # Minimal fallback just in case
    trends = []
    fallback_keywords = ["Container Shortage", "Port Congestion", "Freight Rate Hike", "Suez Canal Delays"]
    for i in range(limit):
        trends.append({
            "id": f"fb_{i}",
            "keyword": random.choice(fallback_keywords),
            "region": "Global",
            "mentions": random.randint(50, 500),
            "sentiment": "negative",
            "trending_score": round(random.uniform(0.1, 0.5), 2),
            "timestamp": datetime.utcnow().isoformat(),
            "sample_text": "Live data unavailable, showing fallback simulated trend.",
            "source": "Simulation (Fallback)"
        })
    return {
        "total": len(trends),
        "trends": trends,
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/alerts")
def get_social_alerts():
    """
    Get high-priority social media alerts
    """
    alerts = [
        {
            "id": "alert_001",
            "type": "protest",
            "location": "Port of Los Angeles",
            "severity": "high",
            "mentions": 5420,
            "description": "Labor union announcing potential strike action",
            "timestamp": datetime.utcnow().isoformat(),
            "verified": True
        },
        {
            "id": "alert_002",
            "type": "weather",
            "location": "Singapore Strait",
            "severity": "medium",
            "mentions": 2100,
            "description": "Tropical storm warnings affecting shipping routes",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "verified": True
        }
    ]
    
    return {
        "alerts": alerts,
        "count": len(alerts)
    }
