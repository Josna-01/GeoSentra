import requests
import json
import random

# Use the key directly to test
API_KEY = "ca5b4242c8f748649ae721a1a5ff022a"
URL = "https://newsapi.org/v2/everything"

def test_news():
    print(f"Testing NewsAPI with Key: {API_KEY[:5]}...")
    params = {
        "q": "supply chain OR logistics OR port strike OR trade sanctions",
        "sortBy": "publishedAt",
        "language": "en",
        "apiKey": API_KEY,
        "pageSize": 5
    }
    
    try:
        res = requests.get(URL, params=params)
        print(f"Status: {res.status_code}")
        data = res.json()
        
        if res.status_code == 200:
            articles = data.get("articles", [])
            print(f"Articles Found: {len(articles)}")
            for i, a in enumerate(articles):
                print(f"[{i+1}] {a['title']}")
        else:
            print(f"Error: {data}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_news()
