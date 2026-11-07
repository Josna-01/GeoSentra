import requests
import time

URL = "http://localhost:8000/risk/ingest-news?force=true"

try:
    print("Forcing news ingestion (with force=true)...")
    res = requests.post(URL)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Failed: {e}")
