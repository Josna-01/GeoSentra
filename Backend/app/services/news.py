import requests
from app.config import settings

class NewsFeedUnavailable(Exception):
    pass


class NewsService:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        # Using NewsAPI.org
        self.base_url = "https://newsapi.org/v2/everything"

    def fetch_geopolitical_news(self, query="supply chain OR logistics OR port strike OR trade sanctions"):
        if not self.api_key:
            raise NewsFeedUnavailable("News feed is not configured.")
        
        params = {
            "q": query,
            "sortBy": "publishedAt",
            "language": "en",
            "pageSize": 5
        }
        
        try:
            response = requests.get(
                self.base_url, params=params, headers={"X-Api-Key": self.api_key}, timeout=15
            )
            response.raise_for_status()
            data = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise NewsFeedUnavailable("News feed is unavailable. Try again later.") from exc

        if not isinstance(data, dict) or data.get("status") != "ok" or not isinstance(data.get("articles"), list):
            raise NewsFeedUnavailable("News feed returned an unexpected response.")
        return data["articles"]

news_service = NewsService()
