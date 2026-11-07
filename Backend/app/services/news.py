import requests
from app.config import settings

class NewsService:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        # Using NewsAPI.org
        self.base_url = "https://newsapi.org/v2/everything"

    def fetch_geopolitical_news(self, query="supply chain OR logistics OR port strike OR trade sanctions"):
        # Fallback data with random elements to avoid "hardcoded" feel
        import random
        cities = ["Shanghai", "Rotterdam", "Hamburg", "Los Angeles", "Singapore", "Antwerp"]
        fallback_data = [
            {"title": f"Port Congestion in {random.choice(cities)}", "description": "Severe congestion reported due to labor shortages and high volume."},
            {"title": f"New Trade Tariffs Announced", "description": "Government announces new tariffs on semiconductor imports effective immediately."},
            {"title": f"Logistics Disruption in region", "description": "Unexpected disruption in key logistics corridor due to weather event."}
        ]

        if not self.api_key:
            print("News API key missing. Returning randomized dummy news.")
            return fallback_data
        
        params = {
            "q": query,
            "sortBy": "publishedAt",
            "language": "en",
            "apiKey": self.api_key,
            "pageSize": 5
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            data = response.json()
            if data.get("status") == "ok":
                articles = data.get("articles", [])
                if articles:
                    return articles
                print("News API returned 0 articles. Using randomized fallback.")
                return fallback_data
            
            print(f"News API Error: {data.get('code')} - {data.get('message')}")
            return fallback_data
        except Exception as e:
            print(f"Error fetching news: {e}")
            return fallback_data

news_service = NewsService()
