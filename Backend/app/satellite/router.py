from fastapi import APIRouter, Query
import requests
from typing import Optional

router = APIRouter(prefix="/satellite", tags=["Satellite"])

# Using NASA EONET (Earth Observatory Natural Event Tracker) - Free API
EONET_API = "https://eonet.gsfc.nasa.gov/api/v3/events"

@router.get("/events")
def get_satellite_events(limit: int = Query(10, le=50)):
    """
    Get natural events from NASA's Earth Observatory
    Filters for events that could impact supply chains and logistics
    """
    try:
        response = requests.get(
            EONET_API,
            params={"limit": limit * 3, "status": "open"},  # Fetch more to filter
            timeout=10
        )
        data = response.json()
        
        # Categories that affect logistics
        LOGISTICS_CATEGORIES = [
            "Wildfires",
            "Severe Storms", 
            "Floods",
            "Volcanoes",
            "Sea and Lake Ice",
            "Drought",
            "Earthquakes",
            "Landslides",
            "Snow"
        ]
        
        # Transform and filter to our format
        events = []
        for event in data.get("events", []):
            # Filter by category
            categories = event.get("categories", [])
            if not categories:
                continue
                
            category_title = categories[0].get("title", "Unknown")
            
            # Only include events that affect logistics
            if category_title not in LOGISTICS_CATEGORIES:
                continue
            
            # Get latest geometry (location)
            geometries = event.get("geometry", [])
            if not geometries:
                continue
                
            latest_geo = geometries[-1]
            coords = latest_geo.get("coordinates", [0, 0])
            
            events.append({
                "id": event.get("id"),
                "title": event.get("title"),
                "category": category_title,
                "location": {
                    "coordinates": coords if len(coords) == 2 else [coords[1], coords[0]],
                },
                "date": latest_geo.get("date"),
                "source": "NASA EONET",
                "link": event.get("link", "")
            })
            
            # Stop when we have enough
            if len(events) >= limit:
                break
        
        return {
            "total": len(events),
            "events": events,
            "source": "NASA Earth Observatory (Logistics-Filtered)"
        }
    except Exception as e:
        return {
            "total": 0,
            "events": [],
            "error": str(e),
            "source": "NASA Earth Observatory (Failed)"
        }

@router.get("/port-activity")
def get_port_weather(port: str = Query("shanghai")):
    """
    Get real-time marine weather for ports using Open-Meteo (Free) and Nominatim (Free)
    Replaces simulated congestion data with real wave/wind data.
    """
    headers = {'User-Agent': 'GeoSentra/1.0'}
    
    try:
        # 1. Geocoding via Nominatim
        geo_url = "https://nominatim.openstreetmap.org/search"
        geo_params = {
            "q": f"{port} port",
            "format": "json",
            "limit": 1
        }
        geo_res = requests.get(geo_url, params=geo_params, headers=headers, timeout=5)
        
        if geo_res.status_code != 200 or not geo_res.json():
            # Fallback for common ports if geocoding fails (rate limits)
            defaults = {
                "shanghai": {"lat": 31.23, "lon": 121.47, "country": "China"},
                "rotterdam": {"lat": 51.92, "lon": 4.47, "country": "Netherlands"},
                "singapore": {"lat": 1.26, "lon": 103.82, "country": "Singapore"},
                "los angeles": {"lat": 33.72, "lon": -118.27, "country": "USA"},
                "new york": {"lat": 40.71, "lon": -74.00, "country": "USA"}
            }
            fallback = defaults.get(port.lower())
            if not fallback:
                return {"error": "Port not found", "status": "not_found"}
            lat, lon, display_name = fallback["lat"], fallback["lon"], f"Port of {port.title()}, {fallback['country']}"
        else:
            location = geo_res.json()[0]
            lat, lon = float(location["lat"]), float(location["lon"])
            display_name = location["display_name"]

        # 2. Marine Weather via Open-Meteo
        weather_url = "https://marine-api.open-meteo.com/v1/marine"
        weather_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "wave_height,wave_direction,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction",
            "hourly": "wave_height",
            "timezone": "auto"
        }
        
        weather_res = requests.get(weather_url, params=weather_params, timeout=5)
        
        if weather_res.status_code == 200:
            data = weather_res.json()
            current = data.get("current", {})
            
            # Interpret data
            wave_height = current.get("wave_height", 0)
            status = "Optimal"
            if wave_height > 2.5: status = "Rough"
            if wave_height > 4.0: status = "Dangerous"
            
            return {
                "name": display_name.split(",")[0],
                "location": display_name,
                "coordinates": [lat, lon],
                "weather": {
                    "wave_height_m": wave_height,
                    "wind_wave_height_m": current.get("wind_wave_height", 0),
                    "swell_wave_height_m": current.get("swell_wave_height", 0),
                    "ocean_current_speed": current.get("ocean_current_velocity", 0),
                    "timestamp": current.get("time")
                },
                "status": status,
                "congestion_level": "N/A (Requires Paid API)", # Transparently removed
                "source": "Open-Meteo Marine API"
            }
            
        return {"error": "Weather data unavailable", "status": "api_error"}

    except Exception as e:
        print(f"Port API Error: {e}")
        return {"error": str(e), "status": "error"}
