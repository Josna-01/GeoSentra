from fastapi import APIRouter
import requests
from typing import Dict

router = APIRouter(prefix="/market", tags=["Market Data"])

# Free currency API (no key required)
CURRENCY_API = "https://api.exchangerate-api.com/v4/latest/USD"

@router.get("/currencies")
def get_currency_rates():
    """Get live currency exchange rates"""
    try:
        response = requests.get(CURRENCY_API, timeout=5)
        data = response.json()
        
        # Focus on key currencies for supply chain
        key_currencies = {
            "USD": data["rates"].get("USD", 1.0),
            "EUR": data["rates"].get("EUR", 0.85),
            "CNY": data["rates"].get("CNY", 7.2),
            "JPY": data["rates"].get("JPY", 110.0),
            "GBP": data["rates"].get("GBP", 0.73),
            "INR": data["rates"].get("INR", 74.0),
        }
        
        return {
            "base": "USD",
            "rates": key_currencies,
            "last_updated": data.get("time_last_updated", "Unknown")
        }
    except Exception as e:
        # Fallback data if API fails
        return {
            "base": "USD",
            "rates": {
                "USD": 1.0,
                "EUR": 0.92,
                "CNY": 7.24,
                "JPY": 149.5,
                "GBP": 0.79,
                "INR": 83.2,
            },
            "last_updated": "Cached",
            "error": str(e)
        }

@router.get("/shipping-routes")
def get_shipping_routes():
    """Get major shipping route information"""
    routes = [
        {
            "id": "route_001",
            "name": "Asia-Europe",
            "origin": "Shanghai",
            "destination": "Rotterdam",
            "distance_km": 19800,
            "avg_transit_days": 28,
            "status": "operational",
            "congestion_level": "medium"
        },
        {
            "id": "route_002",
            "name": "Trans-Pacific",
            "origin": "Shanghai",
            "destination": "Los Angeles",
            "distance_km": 10500,
            "avg_transit_days": 14,
            "status": "operational",
            "congestion_level": "low"
        },
        {
            "id": "route_003",
            "name": "Suez Canal Route",
            "origin": "Singapore",
            "destination": "Hamburg",
            "distance_km": 16000,
            "avg_transit_days": 24,
            "status": "operational",
            "congestion_level": "high"
        }
    ]
    return routes
